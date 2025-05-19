from django.urls import path
from .views import GameListAPIView, MatchListCreateAPIView, EnterMatchByChallengeView, UpdateScoreView, JoinMatchView, SubmitPointView, CompleteMatchView, MatchByChallengeView, debug_join, MatchHistoryView, LeaderboardView, SidebarStatsView, UserMatchStatsView, ChallengeMatchDetailView

urlpatterns = [
    path('', GameListAPIView.as_view(), name='game-list'),
    path('matches/', MatchListCreateAPIView.as_view(), name='match-list-create'),
    #path('matches/<int:match_id>/enter/', EnterMatchView.as_view(), name='enter-match'),
    path('<int:match_id>/score/', UpdateScoreView.as_view(), name='update-score'),
    path('matches/<int:match_id>/join/', JoinMatchView.as_view(), name='match-join'),
    path('matches/<int:match_id>/point/', SubmitPointView.as_view(), name='match-submit-point'),
    path('matches/<int:match_id>/complete/', CompleteMatchView.as_view(), name='match-complete'),
    path('matches/by-challenge/<int:challenge_id>/', MatchByChallengeView.as_view(), name='match-by-challenge'),
    path('start-match/<int:challenge_id>/', EnterMatchByChallengeView.as_view(), name='start-match'),
    path("matches/history/", MatchHistoryView.as_view(), name="match-history"),
    path("leaderboard/", LeaderboardView.as_view(), name="leaderboard"),
    path("sidebar-stats/", SidebarStatsView.as_view(), name="sidebar-stats"),
    path("matches/users/<int:user_id>/stats/", UserMatchStatsView.as_view()),
    path("matches/challenge-match/<int:match_id>/", ChallengeMatchDetailView.as_view(), name="challenge-match-detail"),



    path('matches/<int:match_id>/debug/', debug_join),

]
