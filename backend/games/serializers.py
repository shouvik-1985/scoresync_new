from rest_framework import serializers
from .models import Game, Match, TennisSet
from api.models import User

class GameSerializer(serializers.ModelSerializer):
    players = serializers.SerializerMethodField()
    matches = serializers.SerializerMethodField()
    class Meta:
        model = Game
        fields = ['id', 'name', 'icon', 'players', 'matches']
    
    def get_players(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return User.objects.filter(games=obj).exclude(id=request.user.id).count()
        return User.objects.filter(games=obj).count()  # M2M from User to Game

    def get_matches(self, obj):
        return Match.objects.filter(game=obj).count()
    
class TennisSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = TennisSet
        fields = ['set_number', 'player1_games', 'player2_games']

def get_point_display(points):
    return {0: "0", 1: "15", 2: "30", 3: "40", 4: "Adv"}.get(points, "Game")
class MatchSerializer(serializers.ModelSerializer):
    player1 = serializers.IntegerField(source='player1.id', read_only=True)
    player2 = serializers.IntegerField(source='player2.id', read_only=True)
    player1_username = serializers.CharField(source='player1.username', read_only=True)
    player2_username = serializers.CharField(source='player2.username', read_only=True)
    winner_username = serializers.CharField(source='winner.username', read_only=True)
    game_name = serializers.CharField(source='game.name', read_only=True)
    sets = TennisSetSerializer(many=True, read_only=True)
    current_point_score = serializers.SerializerMethodField()

    def get_current_point_score(self, obj):
        return {
            "player1": get_point_display(getattr(obj, "player1_points", 0)),
            "player2": get_point_display(getattr(obj, "player2_points", 0)),
        }

    class Meta:
        model = Match
        fields = [
            'id',
            'game', 'game_name',
            'player1', 'player1_username',   # ✅ include player1
            'player2', 'player2_username',   # ✅ include player2
            'player1_score', 'player2_score',
            'player1_points', 'player2_points',
            'winner', 'winner_username',
            'status', 'started_at', 'ended_at',
            'sets',
            'current_point_score',
            'created_at'
        ]


