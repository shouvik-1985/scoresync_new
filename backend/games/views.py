from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.shortcuts import get_object_or_404
from .models import Game, Match, TennisSet
from .serializers import GameSerializer, MatchSerializer, TennisSetSerializer
from challenges.models import Challenge
from rest_framework.exceptions import ValidationError
from django.db.models import Q
from api.models import User
from friends.models import FriendRequest

#for temporary testing
#from django.http import JsonResponse

class GameListAPIView(generics.ListAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]  # Allow unauthenticated access

    def get_queryset(self):
        try:
            return Game.objects.all()
        except Exception as e:
            print(f"Error fetching games: {e}")
            return Game.objects.none()

class MatchListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = MatchSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        user = self.request.user
        return Match.objects.filter(
            Q(player1=user) | Q(player2=user),
            status__in=["not_started", "in_progress"]
        ).order_by("-created_at")
class MatchByChallengeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, challenge_id):
        match = Match.objects.filter(challenge_id=challenge_id).first()
        if not match:
            return Response({"error": "Match not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(MatchSerializer(match).data)


class EnterMatchByChallengeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, challenge_id):
        challenge = get_object_or_404(Challenge, id=challenge_id)

        if request.user not in [challenge.sender, challenge.receiver]:
            return Response({"error": "Not a participant."}, status=403)

        if not challenge.game:
            return Response({"error": "Challenge is missing a game."}, status=400)

        if not challenge.sender or not challenge.receiver:
            return Response({"error": "Challenge is missing sender or receiver."}, status=400)

        # Check or create match
        match = Match.objects.filter(challenge=challenge).first()
        if not match:
            try:
                match = Match.objects.create(
                    game=challenge.game,
                    player1=challenge.sender,
                    player2=challenge.receiver,
                    challenge=challenge,
                    started_at=timezone.now(),
                    status="in_progress"
                )
            except Exception as e:
                print("Error creating match:", e)
                return Response({"error": "Failed to create match."}, status=500)

        try:
            serializer = MatchSerializer(match, context={"request": request})
            return Response(serializer.data)
        except Exception as e:
            print("Serializer error:", e)
            return Response({"error": "Failed to serialize match."}, status=500)
        

class UpdateScoreView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, match_id):
        match = get_object_or_404(Match, id=match_id)
        point_winner = request.data.get("winner")  # either 'player1' or 'player2'

        if match.status != "in_progress":
            return Response({"error": "Match not in progress."}, status=400)

        # Update current set
        current_set = match.sets.last()
        if not current_set:
            current_set = TennisSet.objects.create(match=match, set_number=1)

        if point_winner == "player1":
            current_set.player1_games += 1
        elif point_winner == "player2":
            current_set.player2_games += 1
        else:
            return Response({"error": "Invalid winner."}, status=400)
        
        current_set.save()

        # Logic to check if set is over (simple version, not tiebreak)
        if current_set.player1_games >= 6 and current_set.player1_games - current_set.player2_games >= 2:
            match.player1_score += 1
        elif current_set.player2_games >= 6 and current_set.player2_games - current_set.player1_games >= 2:
            match.player2_score += 1

        # Check match win condition (best of 3 sets for now)
        if match.player1_score == 2:
            match.status = "completed"
            match.winner = match.player1
            match.ended_at = timezone.now()
        elif match.player2_score == 2:
            match.status = "completed"
            match.winner = match.player2
            match.ended_at = timezone.now()

        match.save()
        return Response(MatchSerializer(match).data)


class JoinMatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, match_id):
        try:
            match = Match.objects.get(id=match_id)
        except Match.DoesNotExist:
            return Response({"error": "Match not found"}, status=404)

        if request.user not in [match.player1, match.player2]:
            return Response({"error": "You are not a participant in this match."}, status=403)

        now = timezone.now()

        # If match hasn't started yet, set it as started
        if not match.started_at:
            match.started_at = now
            match.status = "in_progress"
            match.save()

        elif now < match.started_at:
            return Response({"error": "Match hasn't started yet."}, status=400)

        serializer = MatchSerializer(match, context={"request": request})
        return Response(serializer.data)


class SubmitPointView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, match_id):
        match = get_object_or_404(Match, id=match_id)

        if match.status != "in_progress":
            return Response({"error": "Match is not in progress."}, status=400)

        winner = request.data.get("winner")
        if winner not in ["player1", "player2"]:
            return Response({"error": "Invalid winner."}, status=400)

        # Create first set if none exists
        if not match.sets.exists():
            current_set = TennisSet.objects.create(match=match, set_number=1)
        else:
            current_set = match.sets.last()

        # Update point count
        if winner == "player1":
            match.player1_points += 1
        else:
            match.player2_points += 1

        # ✅ Always save extra_stats if present (move it here)
        incoming_stats = request.data.get("extra_stats") or {}
        if incoming_stats:
            current_stats = match.extra_stats or {}
            for player in ["player1", "player2"]:
                if player in incoming_stats:
                    current_stats[player] = {
                        **current_stats.get(player, {}),
                        **incoming_stats[player],
                    }
            match.extra_stats = current_stats


        match.save()

        def game_won(p1, p2):
            return p1 >= 4 and (p1 - p2) >= 2

        game_winner = None
        if game_won(match.player1_points, match.player2_points):
            current_set.player1_games += 1
            game_winner = "player1"
        elif game_won(match.player2_points, match.player1_points):
            current_set.player2_games += 1
            game_winner = "player2"

        if game_winner:
            match.player1_points = 0
            match.player2_points = 0
            current_set.save()

            def set_won(p1, p2):
                return (p1 >= 6 and (p1 - p2) >= 2) or p1 == 7

            set_winner = None
            if set_won(current_set.player1_games, current_set.player2_games):
                match.player1_score += 1
                set_winner = "player1"
            elif set_won(current_set.player2_games, current_set.player1_games):
                match.player2_score += 1
                set_winner = "player2"

            if match.player1_score == 2 or match.player2_score == 2:
                match.status = "completed"
                match.winner = match.challenge.sender if match.player1_score == 2 else match.challenge.receiver
                match.ended_at = timezone.now()
        
                possible_challenge = None
                if not match.challenge:
                    possible_challenge = Challenge.objects.filter(
                        Q(sender=match.player1, receiver=match.player2) |
                        Q(sender=match.player2, receiver=match.player1),
                        status="accepted"
                    ).order_by("-id").first()

                if possible_challenge:
                    match.challenge = possible_challenge
                if match.challenge:
                    match.challenge.status = "completed"
                    match.challenge.save()
            else:
                if set_winner:
                    TennisSet.objects.create(match=match, set_number=match.sets.count() + 1)

        match.save()
        return Response(MatchSerializer(match).data)






class CompleteMatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, match_id):
        try:
            match = Match.objects.get(id=match_id)
        except Match.DoesNotExist:
            return Response({"error": "Match not found"}, status=404)

        if match.status != "in_progress":
            return Response({"error": "Match is not active."}, status=400)

        # Decide winner based on total sets won (basic example)
        player1_sets = sum(1 for s in match.sets.all() if s.player1_games > s.player2_games)
        player2_sets = sum(1 for s in match.sets.all() if s.player2_games > s.player1_games)

        match.player1_score = player1_sets
        match.player2_score = player2_sets
        match.winner = match.player1 if player1_sets > player2_sets else match.player2
        match.status = "completed"
        match.ended_at = timezone.now()
        extra_stats = request.data.get("extra_stats")
        if extra_stats:
            match.extra_stats = extra_stats
        match.save()

        return Response({"message": "Match completed", "winner": match.winner.username, "extra_stats": match.extra_stats})
    


class MatchHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        matches = Match.objects.filter(
            status="completed"
        ).filter(Q(player1=user) | Q(player2=user)).order_by("-ended_at")[:10]

        result = []
        for m in matches:
            opponent = m.player2 if m.player1 == user else m.player1
            result.append({
                "id": m.id,
                "date": m.ended_at,
                "opponent": opponent.username,
                "player_score": m.player1_score if m.player1 == user else m.player2_score,
                "opponent_score": m.player2_score if m.player1 == user else m.player1_score,
                "winner": m.winner.username if m.winner else "N/A",
            })

        return Response(result)
    
class LeaderboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get accepted friend relationships (either direction)
        accepted_requests = FriendRequest.objects.filter(
            Q(from_user=user) | Q(to_user=user),
            status='accepted'
        )

        friend_ids = set()
        for fr in accepted_requests:
            if fr.from_user.id != user.id:
                friend_ids.add(fr.from_user.id)
            if fr.to_user.id != user.id:
                friend_ids.add(fr.to_user.id)
        friend_ids.add(user.id)  # include self

        users = User.objects.filter(id__in=friend_ids)

        leaderboard = []
        for u in users:
            matches = Match.objects.filter(status="completed").filter(Q(player1=u) | Q(player2=u))
            wins = matches.filter(winner=u).count()
            total = matches.count()
            ratio = wins / total if total > 0 else 0

            leaderboard.append({
                "user_id": u.id,
                "username": u.username,
                "full_name": u.full_name,
                "profile_picture": (
                    u.profile_picture.url if hasattr(u.profile_picture, "url") else u.profile_picture
                ),
                "wins": wins,
                "games": total,
                "ratio": round(ratio, 2),
            })

        leaderboard.sort(key=lambda x: x["ratio"], reverse=True)

        for i, entry in enumerate(leaderboard[:10]):
            entry["rank"] = i + 1

        return Response(leaderboard[:10])


    
class SidebarStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        matches = Match.objects.filter(Q(player1=user) | Q(player2=user), status="completed")
        wins = matches.filter(winner=user).count()
        losses = matches.count() - wins

        pending = FriendRequest.objects.filter(to_user=user, status="pending").count()
        friends = user.friends.count() if hasattr(user, 'friends') else 0

        return Response({
            "wins": wins,
            "losses": losses,
            "games": wins + losses,
            "pending_requests": pending,
            "friends": friends
        })


class UserMatchStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)

        matches = Match.objects.filter(Q(player1=user) | Q(player2=user), status="completed")
        wins = matches.filter(winner=user).count()
        losses = matches.count() - wins

        return Response({
            "games_played": wins + losses,
            "wins": wins,
            "losses": losses
        })
    

class ChallengeMatchDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, match_id):
        match = get_object_or_404(Match, id=match_id)

        if request.user not in [match.player1, match.player2]:
            return Response({"error": "Unauthorized"}, status=403)

        return Response({
            "id": match.id,
            "player1_name": match.player1.username,
            "player2_name": match.player2.username,
            "player1_id": match.player1.id,
            "player2_id": match.player2.id,
            "match_type": "singles",
            "game_type": match.game.name if match.game else "N/A",
            "score": f"{match.player1_score} - {match.player2_score}",
            "winner_name": match.winner.username if match.winner else None,
            "status": match.status,
            "played_at": match.ended_at,
            "sets": [
                {
                    "player1_games": s.player1_games,
                    "player2_games": s.player2_games
                } for s in match.sets.all().order_by("set_number")
            ],
            "extra_stats": match.extra_stats or {},
        })


#Temporary testing endpoint

from django.http import JsonResponse
def debug_join(request, match_id):
    return JsonResponse({"message": f"Join view hit for match {match_id}"})


