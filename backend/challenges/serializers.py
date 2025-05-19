from rest_framework import serializers
from .models import Challenge, TennisMatch
from django.contrib.auth import get_user_model
from games.models import Game, Match
from api.serializers import UserSerializer
from games.serializers import MatchSerializer  # You already have this

User = get_user_model()

class TennisMatchSerializer(serializers.ModelSerializer):
    challenge_id = serializers.IntegerField(source='challenge.id', read_only=True)
    player1 = serializers.CharField(source='challenge.sender.username', read_only=True)
    player2 = serializers.CharField(source='challenge.receiver.username', read_only=True)
    winner_username = serializers.CharField(source='winner.username', read_only=True)
    player1_score = serializers.SerializerMethodField()
    player2_score = serializers.SerializerMethodField()
    extra_stats = serializers.JSONField()

    class Meta:
        model = TennisMatch
        fields = ['id', 'challenge_id', 'player1', 'player2', 'player1_score', 'player2_score', 'winner', 'winner_username','extra_stats']

    def get_player1(self, obj):
        return obj.challenge.sender.full_name if obj.challenge.sender else None

    def get_player2(self, obj):
        return obj.challenge.receiver.full_name if obj.challenge.receiver else None

    def get_winner_username(self, obj):
        return str(obj.winner.full_name) if obj.winner else None
    
    def get_player1_score(self, obj):
        return obj.player1_score if isinstance(obj.player1_score, int) else 0

    def get_player2_score(self, obj):
        return obj.player2_score if isinstance(obj.player2_score, int) else 0

class ChallengeSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()
    receiver = serializers.SerializerMethodField()
    game_name = serializers.CharField(source="game.name", read_only=True)
    scheduled_time = serializers.DateTimeField()
    game = serializers.PrimaryKeyRelatedField(read_only=True)
    role = serializers.SerializerMethodField()
    match = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            "id", "sender", "receiver",
            "game_name", "game",
            "scheduled_time", "status", "created_at", "role", "match"
        ]

    def get_sender(self, obj):
        from api.serializers import UserSerializer
        return UserSerializer(obj.sender, context=self.context).data

    def get_receiver(self, obj):
        from api.serializers import UserSerializer
        return UserSerializer(obj.receiver, context=self.context).data

    def get_role(self, obj):
        user = self.context['request'].user
        if obj.sender == user:
            return "sender"
        elif obj.receiver == user:
            return "receiver"
        return "unknown"

    def get_match(self, obj):
        #from games.models import Match  # ensure this import is placed here
        match = Match.objects.filter(challenge=obj).first()
        if match:
            print(f"✅ Match found for Challenge {obj.id}: Match {match.id}")
            return MatchSerializer(match, context=self.context).data
        else:
            print(f"❌ No Match found for Challenge {obj.id}")
            return None



