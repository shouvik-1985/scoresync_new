# friends/serializers.py

from rest_framework import serializers
from .models import FriendRequest, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class UserMiniSerializer(serializers.ModelSerializer):
    games = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'profile_picture','games']  # ✅ NOT user_id

class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserMiniSerializer(read_only=True)
    to_user = UserMiniSerializer(read_only=True)

    class Meta:
        model = FriendRequest
        fields = ['id', 'from_user', 'to_user', 'status', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserMiniSerializer(read_only=True)
    receiver = UserMiniSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'timestamp', 'read']

