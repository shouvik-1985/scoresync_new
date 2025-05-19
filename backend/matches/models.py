from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Match(models.Model):
    GAME_CHOICES = [
        ('tennis', 'Tennis'),
        ('badminton', 'Badminton'),
        ('chess', 'Chess'),
        ('tt', 'Table Tennis'),
        ('cricket', 'Cricket'),
        ('football', 'Football'),
    ]
    is_guest = models.BooleanField(default=False)
    sets = models.JSONField(default=list, blank=True, null=True) 
    player1 = models.ForeignKey(User, related_name='matches_as_player1', on_delete=models.CASCADE, null=True, blank=True)
    player2 = models.ForeignKey(User, related_name='matches_as_player2', on_delete=models.CASCADE, null=True, blank=True)
    player1_points = models.IntegerField(default=0)
    player2_points = models.IntegerField(default=0)
    winner = models.ForeignKey(User, related_name='matches_won', on_delete=models.CASCADE, null=True, blank=True)
    winner_name = models.CharField(max_length=100, blank=True, null=True)
    game_type = models.CharField(max_length=50, choices=GAME_CHOICES)
    score = models.CharField(max_length=50, blank=True, null=True)
    played_at = models.DateTimeField(null=True, blank=True)

    player1_name = models.CharField(max_length=100, blank=True, null=True)
    player2_name = models.CharField(max_length=100, blank=True, null=True)
    guest_players = models.JSONField(blank=True, null=True)
    match_type = models.CharField(max_length=20, default="singles")
    status = models.CharField(max_length=30, default="not_started")
    extra_stats = models.JSONField(default=dict, blank=True, null=True)

    def __str__(self):
        if self.player1_name and self.player2_name:
            return f"{self.player1_name} vs {self.player2_name} ({self.game_type})"
        return f"{self.player1} vs {self.player2} ({self.game_type})"
