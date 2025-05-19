from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count
from django.contrib.auth import get_user_model
from .models import Match, User
import uuid
from django.utils import timezone

User = get_user_model()

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_stats(request, user_id):
    user = get_object_or_404(User, id=user_id)
    total = Match.objects.filter(Q(player1=user) | Q(player2=user)).count()
    wins = Match.objects.filter(winner=user).count()
    losses = total - wins
    return Response({
        "games_played": total,
        "wins": wins,
        "losses": losses
    })

@api_view(['GET'])
def user_rank(request, user_id):
    users = User.objects.all()
    user_wins = []

    for user in users:
        wins = Match.objects.filter(winner=user).count()
        user_wins.append((user.id, wins))

    # Sort descending by win count
    sorted_users = sorted(user_wins, key=lambda x: x[1], reverse=True)
    rank = next((i + 1 for i, (uid, _) in enumerate(sorted_users) if uid == int(user_id)), None)

    return Response({'rank': rank})


@api_view(["POST"])
@permission_classes([AllowAny])
def create_guest_match(request):
    try:
        data = request.data
        game_type = data.get("game_type")
        match_type = data.get("match_type")
        player_names = data.get("players", [])

        if game_type != "tennis":
            return Response({"error": "Only tennis is supported currently."}, status=400)

        if match_type not in ["singles", "doubles"]:
            return Response({"error": "Invalid match type."}, status=400)

        expected_count = 2 if match_type == "singles" else 4
        if len(player_names) != expected_count:
            return Response({"error": f"{expected_count} players required for {match_type} match."}, status=400)

        def make_guest(name):
            return {
                "id": str(uuid.uuid4()),
                "username": f"guest_{uuid.uuid4().hex[:6]}",
                "full_name": name,
            }

        guest_players = [make_guest(name) for name in player_names]

        if match_type == "singles":
            player1_name = guest_players[0]["full_name"]
            player2_name = guest_players[1]["full_name"]
        else:  # doubles
            player1_name = f"{guest_players[0]['full_name']} & {guest_players[1]['full_name']}"
            player2_name = f"{guest_players[2]['full_name']} & {guest_players[3]['full_name']}"

        match = Match.objects.create(
            player1=None,
            player2=None,
            game_type="tennis",
            match_type=match_type,
            player1_name=player1_name,
            player2_name=player2_name,
            guest_players=guest_players,
            status="not_started",
)

        return Response({"match_id": match.id}, status=201)

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([AllowAny])
def join_guest_match(request, match_id):
    match = get_object_or_404(Match, id=match_id)

    if match.status == "not_started":
        match.status = "in_progress"

        # ✅ Only initialize sets if missing
        if not match.sets or len(match.sets) == 0:
            match.sets = [{"player1_games": 0, "player2_games": 0}]

        match.save()

    return Response({
        "id": match.id,
        "player1_name": match.player1_name,
        "player2_name": match.player2_name,
        "guest_players": match.guest_players,
        "game_type": match.game_type,
        "match_type": match.match_type,
        "sets": match.sets or [],
        "status": match.status,
        "player1_points": match.player1_points,
        "player2_points": match.player2_points,
        "winner_name": match.winner_name if hasattr(match, "winner_name") else None
    })



@api_view(["POST"])
@permission_classes([AllowAny])
def end_guest_match(request, match_id):
    match = get_object_or_404(Match, id=match_id)

    sets = match.sets or []

    player1_score = sum(s.get("player1_games", 0) for s in sets)
    player2_score = sum(s.get("player2_games", 0) for s in sets)

    winner_name = request.data.get("winner_name") or (
        match.player1_name if player1_score > player2_score else match.player2_name
    )

    extra_stats = request.data.get("extra_stats", {})
    
    if match.status != "completed":
       match.status = "completed"
    match.winner_name = winner_name
    if not match.played_at:
        match.played_at = timezone.now()
    match.score = f"{player1_score} - {player2_score}"

    match.extra_stats = extra_stats
    match.save()

    return Response({
        "id": match.id,
        "player1_name": match.player1_name,
        "player2_name": match.player2_name,
        "guest_players": match.guest_players,
        "game_type": match.game_type,
        "match_type": match.match_type,
        "sets": match.sets,
        "status": match.status,
        "player1_points": match.player1_points,
        "player2_points": match.player2_points,
        "winner_name": match.winner_name,
        "score": match.score,
        "extra_stats": match.extra_stats,
        "played_at": match.played_at.isoformat() if match.played_at else None,
    })

@api_view(["POST"])
@permission_classes([AllowAny])
def point_guest_match(request, match_id):
    match = get_object_or_404(Match, id=match_id)

    # ✅ Clearly return immediately if match already completed
    if match.status == "completed":
        return Response({
            "id": match.id,
            "player1_name": match.player1_name,
            "player2_name": match.player2_name,
            "guest_players": match.guest_players,
            "game_type": match.game_type,
            "match_type": match.match_type,
            "sets": match.sets,
            "status": match.status,
            "player1_points": match.player1_points,
            "player2_points": match.player2_points,
            "winner_name": match.winner_name,
            "played_at": match.played_at.isoformat() if match.played_at else None,
        })

    winner = request.data.get("winner")

    if winner not in ["player1", "player2"]:
        return Response({"error": "Invalid winner"}, status=400)

    # Increment points
    if winner == "player1":
        match.player1_points += 1
    else:
        match.player2_points += 1

    p1 = match.player1_points
    p2 = match.player2_points

    def game_won(a, b):
        return a >= 4 and a - b >= 2

    def set_won(g1, g2):
        return (g1 >= 6 or g2 >= 6) and abs(g1 - g2) >= 2

    sets = match.sets or []
    if not sets:
        sets = [{"player1_games": 0, "player2_games": 0}]
    current_set = sets[-1]

    print(f"\n🔵 Before Game Decision: p1={p1}, p2={p2}")
    print(f"Current Set: {current_set}")

    # Check if current game is won
    if game_won(p1, p2):
        current_set["player1_games"] += 1
        print("player1 won the game")
        match.player1_points = 0
        match.player2_points = 0
    elif game_won(p2, p1):
        current_set["player2_games"] += 1
        print("player2 won the game")
        match.player1_points = 0
        match.player2_points = 0

    print(f"🟡 After Game Check: {current_set}")

    # Check if set is won
    if set_won(current_set["player1_games"], current_set["player2_games"]):
        sets[-1] = current_set

        print("🏁 Set won. Recalculating sets won so far...")
        # Count sets won so far
        p1_sets_won = sum(1 for s in sets if s["player1_games"] > s["player2_games"])
        p2_sets_won = sum(1 for s in sets if s["player2_games"] > s["player1_games"])

        print(f"Player 1 Sets: {p1_sets_won}, Player 2 Sets: {p2_sets_won}")

        # Check if either player has won 2 sets (best of 3)
        if p1_sets_won == 2 or p2_sets_won == 2:
            print("🎯 Match COMPLETED clearly")
            match.status = "completed"
            match.winner_name = match.player1_name if p1_sets_won == 2 else match.player2_name
            if not match.played_at:
                match.played_at = timezone.now()
            total_p1_games = sum(s["player1_games"] for s in sets)
            total_p2_games = sum(s["player2_games"] for s in sets)
            match.score = f"{total_p1_games} - {total_p2_games}"
        else:
            # Start a new set if match not over
            sets.append({"player1_games": 0, "player2_games": 0})
            print("➡️ New set started")
    else:
        sets[-1] = current_set  # No set won, just update

    match.sets = sets
    if not match.status or match.status == "not_started":
        match.status = "in_progress"

    if match.status == "completed" and not match.played_at:
        match.played_at = timezone.now()

    match.save()

    print(f"📊 Match Status: {match.status}")
    print(f"All Sets: {sets}")

    return Response({
        "id": match.id,
        "player1_name": match.player1_name,
        "player2_name": match.player2_name,
        "guest_players": match.guest_players,
        "game_type": match.game_type,
        "match_type": match.match_type,
        "sets": sets,
        "status": match.status,
        "player1_points": match.player1_points,
        "player2_points": match.player2_points,
        "winner_name": match.winner_name,
        "played_at": match.played_at.isoformat() if match.played_at else None,
    })



@api_view(["POST"])
@permission_classes([AllowAny])
def submit_guest_point(request, match_id):
    match = get_object_or_404(Match, id=match_id)
    data = request.data
    winner = data.get("winner")

    if match.status == "not_started":
        match.status = "in_progress"

    if winner == "player1":
        match.player1_points += 1
    elif winner == "player2":
        match.player2_points += 1

    # Initialize sets if not exist
    sets = match.sets or []
    if not sets:
        sets = [{"player1_games": 0, "player2_games": 0}]

    current_set = sets[-1]

    # Example: win game after 4 points (simplified logic)
    if match.player1_points >= 4 and match.player1_points > match.player2_points + 1:
        current_set["player1_games"] += 1
        match.player1_points = 0
        match.player2_points = 0
    elif match.player2_points >= 4 and match.player2_points > match.player1_points + 1:
        current_set["player2_games"] += 1
        match.player1_points = 0
        match.player2_points = 0

    sets[-1] = current_set
    match.sets = sets
    match.save()

    return Response({
        "id": match.id,
        "player1_name": match.player1_name,
        "player2_name": match.player2_name,
        "guest_players": match.guest_players,
        "game_type": match.game_type,
        "match_type": match.match_type,
        "sets": sets,
        "status": match.status,
        "player1_points": match.player1_points,
        "player2_points": match.player2_points,
        "winner_name": match.winner_name
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def guest_match_history(request):
    matches = (
        Match.objects
        .filter(
            match_type__in=["singles", "doubles"],
            status="completed"
        )
        .exclude(played_at=None)  # ✅ Ensure only valid dates
        .order_by("-played_at")[:10]
    )

    print("\n🟢 GUEST MATCH HISTORY:")
    for m in matches:
        print(f"{m.player1_name} vs {m.player2_name} | played_at: {m.played_at} | status: {m.status}")


    result = []
    for match in matches:
        result.append({
            "id": match.id,
            "player1_name": match.player1_name,
            "player2_name": match.player2_name,
            "guest_players": match.guest_players,
            "match_type": match.match_type,
            "game_type": match.game_type,
            "score": match.score,
            "winner_name": match.winner_name,
            "status": match.status,
            "played_at": match.played_at.isoformat() if match.played_at else None,
        })

    return Response(result)



# matches/views.py

@api_view(["GET"])
@permission_classes([AllowAny])
def guest_match_detail(request, match_id):
    match = get_object_or_404(Match, id=match_id)
    return Response({
        "id": match.id,
        "player1_name": match.player1_name,
        "player2_name": match.player2_name,
        "guest_players": match.guest_players,
        "match_type": match.match_type,
        "game_type": match.game_type,
        "score": match.score,
        "winner_name": match.winner_name,
        "status": match.status,
        "played_at": match.played_at,
        "sets": match.sets,
        "extra_stats": match.extra_stats or {},
    })
