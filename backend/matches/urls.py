from django.urls import path
from .views import user_stats, user_rank, create_guest_match, join_guest_match, end_guest_match, point_guest_match, submit_guest_point, guest_match_history, guest_match_detail

urlpatterns = [
    path('users/<int:user_id>/stats/', user_stats),
    path('matches/users/<int:user_id>/rank/', user_rank),
    path('guest-match/create/', create_guest_match),
    path('<int:match_id>/join/', join_guest_match),      # ✅ ADD THIS
    path('<int:match_id>/end/', end_guest_match), 
    path("<int:match_id>/point/", point_guest_match), 
    path('<int:match_id>/point/', submit_guest_point),
    path("guest-match/history/", guest_match_history),
    path('guest-match/<int:match_id>/', guest_match_detail, name='guest-match-detail'),


]
