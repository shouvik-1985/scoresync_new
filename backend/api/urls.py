from django.urls import path, include
from . import views
from .views import get_current_user, health_check

urlpatterns = [
    path('', health_check, name='health_check'),
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('google-signin/', views.google_signin, name='google_signin'),
    path('health/', health_check, name='health_check'),

    # Profile
    path("profile/", views.get_own_profile, name="get-own-profile"),
    path("profile/update/", views.update_profile, name="update-profile"),
    path("users/<int:user_id>/", views.get_profile, name="get-profile"),
    path("users/", views.list_users, name="list-users"),

    # Include other apps
    path('matches/', include('matches.urls')),
    path("challenges/", include("challenges.urls")),
    path("games/", include("games.urls")),
    path('auth/me/', get_current_user),
]
