from rest_framework import serializers
from .models import User
from games.serializers import GameSerializer

class UserSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='id', read_only=True)
    games = GameSerializer(many=True, read_only=True)
    avatar_url = serializers.CharField(source='profile_picture', read_only=True)

    class Meta:
        model = User
        fields = [
            'user_id',
            'email',
            'username',
            'full_name',
            'profile_picture',
            'avatar_url',
            'is_google_authenticated',
            'games',
        ]

    #def get_games(self, obj):
        #return [game.name for game in obj.games.all()]
