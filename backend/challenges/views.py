from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Challenge, TennisMatch
from .serializers import ChallengeSerializer
from django.contrib.auth import get_user_model
from games.models import Game
from django.utils import timezone
from django.db.models import Q
from games.serializers import MatchSerializer
from games.models import Match
import traceback
from django.shortcuts import get_object_or_404

User = get_user_model()

class ChallengeListView(generics.ListAPIView):
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Challenge.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).select_related('sender', 'receiver', 'game', 'match').order_by('-scheduled_time')
    
    def get_serializer_context(self):
        return {'request': self.request}

class SentChallengeListView(generics.ListAPIView):
    serializer_class = ChallengeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Challenge.objects.filter(sender=self.request.user).order_by('-created_at')


class ChallengeCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            sender = request.user
            receiver_id = request.data.get('receiver_id')
            game_id = request.data.get('game_id')
            scheduled_time = request.data.get('scheduled_time')

            if not receiver_id or not game_id or not scheduled_time:
                return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

            receiver = get_object_or_404(User, pk=receiver_id)
            game = get_object_or_404(Game, pk=game_id)

            # Check if there's already a pending challenge between these users
            existing_challenge = Challenge.objects.filter(
                Q(sender=sender, receiver=receiver) | Q(sender=receiver, receiver=sender),
                status='pending'
            ).first()

            if existing_challenge:
                return Response(
                    {"error": "There is already a pending challenge between these users."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            challenge = Challenge.objects.create(
                sender=sender,
                receiver=receiver,
                game=game,
                scheduled_time=scheduled_time,
                status='pending'
            )

            serializer = ChallengeSerializer(challenge, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f"Error creating challenge: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ChallengeRespondView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, challenge_id):
        try:
            action = request.data.get('action')
            challenge = get_object_or_404(Challenge, pk=challenge_id, receiver=request.user)

            if challenge.status != 'pending':
                return Response(
                    {"error": "This challenge has already been responded to."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if action == "accept":
                challenge.status = "accepted"
                challenge.save()

                # Create the Match if it's a tennis game
                if challenge.game.name.lower() == "tennis":
                    match = Match.objects.create(
                        game=challenge.game,
                        player1=challenge.sender,
                        player2=challenge.receiver,
                        challenge=challenge,
                        status="not_started",
                        started_at=timezone.now()
                    )
                    challenge.match = match
                    challenge.save()

            elif action == "decline":
                challenge.status = "declined"
                challenge.save()
            else:
                return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

            serializer = ChallengeSerializer(challenge, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error responding to challenge: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



# views.py
class TennisMatchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, challenge_id):
        try:
            challenge = Challenge.objects.get(pk=challenge_id)
        except Challenge.DoesNotExist:
            return Response({"error": "Challenge not valid for match."}, status=404)

        # Get the related Match object
        match = getattr(challenge, "match", None)
        if not match:
            match = Match.objects.filter(challenge=challenge).first()
            if not match:
                return Response({"error": "Match not found for challenge."}, status=404)

        # Compute set scores from TennisSet
        player1_sets = sum(1 for s in match.sets.all() if s.player1_games > s.player2_games)
        player2_sets = sum(1 for s in match.sets.all() if s.player2_games > s.player1_games)

        winner_id = request.data.get("winner_id")
        try:
            winner = User.objects.get(pk=winner_id)
        except User.DoesNotExist:
            return Response({"error": "Winner not found."}, status=404)

        if winner not in [challenge.sender, challenge.receiver]:
            return Response({"error": "Winner must be one of the participants."}, status=400)
        
        extra_stats = request.data.get("extra_stats", {})
        print("📊 Received extra_stats:", extra_stats)  # Debug
        # Update match and challenge
        match.player1_score = player1_sets
        match.player2_score = player2_sets
        match.winner = winner
        match.status = "completed"
        match.ended_at = timezone.now()
        extra_stats = extra_stats 
        match.save()

        challenge.status = "completed"
        challenge.save()

        from .serializers import TennisMatchSerializer
        serializer = TennisMatchSerializer(match)
        return Response(serializer.data, status=200)



class CompletedChallengesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            matches = Match.objects.filter(
                status="completed"
            ).filter(
                Q(player1=request.user) | Q(player2=request.user)
            ).select_related(
                'player1', 'player2', 'game', 'challenge'
            ).order_by('-ended_at')

            serializer = MatchSerializer(matches, many=True, context={"request": request})
            return Response(serializer.data)
        except Exception as e:
            print(f"Error fetching completed challenges: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)