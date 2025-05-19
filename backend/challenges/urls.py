from django.urls import path
from .views import (
    ChallengeListView,
    SentChallengeListView,
    ChallengeCreateView,
    ChallengeRespondView,
    TennisMatchView
)

urlpatterns = [
    path('', ChallengeListView.as_view(), name='challenge-inbox'),               # Received challenges
    path('sent/', SentChallengeListView.as_view(), name='challenge-sent'),       # Sent challenges
    path('create/', ChallengeCreateView.as_view(), name='challenge-create'),     # Create challenge
    path('<int:challenge_id>/respond/', ChallengeRespondView.as_view(), name='challenge-respond'),  # Accept/decline
    path('<int:challenge_id>/tennis-match/', TennisMatchView.as_view()),
]
