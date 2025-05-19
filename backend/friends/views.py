# backend/friends/views.py

from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import FriendRequest, Block, Message
from django.contrib.auth import get_user_model
from .serializers import FriendRequestSerializer, UserMiniSerializer, MessageSerializer
from api.serializers import UserSerializer

User = get_user_model()


# ------------------ Friend Request APIs ------------------ #

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_friend_request(request):
    receiver_id = request.data.get("receiver_id")
    sender = request.user

    if not receiver_id:
        return Response({"error": "receiver_id is required"}, status=400)

    receiver = get_object_or_404(User, id=receiver_id)

    if sender == receiver:
        return Response({"error": "You cannot send request to yourself."}, status=400)

    if Block.objects.filter(blocker=receiver, blocked=sender).exists():
        return Response({"error": "You are blocked by this user."}, status=403)

    if Block.objects.filter(blocker=sender, blocked=receiver).exists():
        return Response({"error": "You have blocked this user."}, status=403)

    if FriendRequest.objects.filter(from_user=sender, to_user=receiver).exists():
        return Response({"error": "Friend request already sent."}, status=400)

    FriendRequest.objects.create(from_user=sender, to_user=receiver)
    return Response({"message": "Friend request sent successfully."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def accept_request(request):
    request_id = request.data.get("request_id")
    try:
        fr = FriendRequest.objects.get(id=request_id, to_user=request.user)
        fr.status = "accepted"
        fr.save()
        return Response({"message": "Friend request accepted."})
    except FriendRequest.DoesNotExist:
        return Response({"error": "Request not found."}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def reject_request(request):
    request_id = request.data.get("request_id")
    try:
        fr = FriendRequest.objects.get(id=request_id, to_user=request.user)
        fr.status = "rejected"
        fr.save()
        return Response({"message": "Friend request rejected."})
    except FriendRequest.DoesNotExist:
        return Response({"error": "Request not found."}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def remove_friend(request):
    user_id = request.data.get("user_id")
    try:
        other_user = User.objects.get(id=user_id)
        FriendRequest.objects.filter(
            Q(from_user=request.user, to_user=other_user) |
            Q(from_user=other_user, to_user=request.user),
            status="accepted"
        ).delete()
        return Response({"message": "Friend removed."})
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=404)


# ------------------ Blocking APIs ------------------ #

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def block_user(request, user_id):  # 👈 accepts user_id from URL
    blocker = request.user
    blocked = get_object_or_404(User, id=user_id)

    if Block.objects.filter(blocker=blocker, blocked=blocked).exists():
        return Response({"message": "Already blocked."}, status=400)

    Block.objects.create(blocker=blocker, blocked=blocked)
    return Response({"message": "User blocked successfully."})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def unblock_user(request, user_id):  # 👈 accepts user_id from URL
    blocker = request.user
    blocked = get_object_or_404(User, id=user_id)

    block = Block.objects.filter(blocker=blocker, blocked=blocked).first()
    if not block:
        return Response({"error": "User not blocked."}, status=404)

    block.delete()
    return Response({"message": "User unblocked successfully."})



# ------------------ Lists and Search ------------------ #

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def friend_list(request):
    user = request.user
    sent = FriendRequest.objects.filter(from_user=user, status="accepted")
    received = FriendRequest.objects.filter(to_user=user, status="accepted")
    friends = [fr.to_user for fr in sent] + [fr.from_user for fr in received]
    return Response(UserMiniSerializer(friends, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pending_requests(request):
    pending = FriendRequest.objects.filter(to_user=request.user, status="pending")
    return Response(FriendRequestSerializer(pending, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def search_users(request):
    query = request.GET.get("q", "")
    current_user = request.user

    friend_ids = set()
    accepted = FriendRequest.objects.filter(
        Q(from_user=current_user) | Q(to_user=current_user),
        status="accepted"
    )
    for fr in accepted:
        if fr.from_user == current_user:
            friend_ids.add(fr.to_user.id)
        else:
            friend_ids.add(fr.from_user.id)

    users = User.objects.filter(
        Q(full_name__icontains=query) | Q(username__icontains=query)
    ).exclude(id=current_user.id).exclude(id__in=friend_ids)[:10]

    return Response(UserMiniSerializer(users, many=True).data)


# ------------------ Notifications ------------------ #

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def friend_notifications(request):
    user = request.user

    incoming_requests = FriendRequest.objects.filter(
        to_user=user,
        status='pending'
    )

    accepted_sent_requests = FriendRequest.objects.filter(
        from_user=user,
        status='accepted'
    ).order_by('-created_at')[:5]

    data = {
        "incoming": [
            {
                "id": fr.id,
                "from_user": UserSerializer(fr.from_user).data,
                "created_at": fr.created_at
            } for fr in incoming_requests
        ],
        "accepted": [
            {
                "id": fr.id,
                "to_user": UserSerializer(fr.to_user).data,
                "created_at": fr.created_at
            } for fr in accepted_sent_requests
        ]
    }

    return Response(data)

# views.py - helper logic for friends who play a game
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def friends_who_play_game(request, game_id):
    user = request.user
    
    # Get IDs of friends who are accepted
    accepted_friend_ids = FriendRequest.objects.filter(
        Q(from_user=user, status='accepted') | Q(to_user=user, status='accepted')
    ).values_list('from_user', 'to_user')

    # Flatten the IDs, remove current user's ID
    friend_ids = set()
    for from_user, to_user in accepted_friend_ids:
        if from_user != user.id:
            friend_ids.add(from_user)
        if to_user != user.id:
            friend_ids.add(to_user)

    # Filter users by friends and the game
    friends = User.objects.filter(
        id__in=friend_ids,
        games__id=game_id
    ).distinct()

    serializer = UserSerializer(friends, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request):
    to_user_id = request.data.get("to_user")
    content = request.data.get("message")

    if not to_user_id or not content:
        return Response({"error": "Missing fields"}, status=400)

    try:
        receiver = User.objects.get(id=to_user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    # Optional: Ensure they are friends
    is_friend = FriendRequest.objects.filter(
        (Q(from_user=request.user, to_user=receiver) | Q(from_user=receiver, to_user=request.user)) &
        Q(status="accepted")
    ).exists()
    if not is_friend:
        return Response({"error": "You can only message accepted friends."}, status=403)

    msg = Message.objects.create(sender=request.user, receiver=receiver, content=content)
    return Response(MessageSerializer(msg).data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recent_conversations(request):
    user = request.user
    messages = Message.objects.filter(
        Q(sender=user) | Q(receiver=user)
    ).order_by('-timestamp')

    latest_by_user = {}
    for msg in messages:
        friend = msg.receiver if msg.sender == user else msg.sender
        if friend.id not in latest_by_user:
            latest_by_user[friend.id] = msg

    return Response(MessageSerializer(list(latest_by_user.values()), many=True).data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_history(request, user_id):
    user = request.user
    try:
        friend = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)

    messages = Message.objects.filter(
        Q(sender=user, receiver=friend) | Q(sender=friend, receiver=user)
    ).order_by('timestamp')

    return Response(MessageSerializer(messages, many=True).data)
