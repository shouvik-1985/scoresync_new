from django.db import models
from django.conf import settings
from django.db.models import JSONField
from challenges.models import Challenge

class Game(models.Model):
    name = models.CharField(max_length=255)
    icon = models.CharField(max_length=10, blank=True)
    players = models.IntegerField(default=0)
    matches = models.IntegerField(default=0)

    def __str__(self):
        return self.name

class Match(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    player1 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='player1_matches', on_delete=models.CASCADE)
    player2 = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='player2_matches', on_delete=models.CASCADE)

    player1_score = models.IntegerField(default=0)  # Total points or final set count
    player2_score = models.IntegerField(default=0)

    player1_points = models.IntegerField(default=0)  # Game-level point count
    player2_points = models.IntegerField(default=0)
    
    winner = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='won_matches', on_delete=models.CASCADE, null=True, blank=True)

    #sets = JSONField(default=list)  # [{"player1":6, "player2":4}, ...]
    status = models.CharField(
        max_length=20,
        choices=[("not_started", "Not Started"), ("in_progress", "In Progress"), ("completed", "Completed")],
        default="not_started"
    )
    started_at = models.DateTimeField(null=True, blank=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    extra_stats = models.JSONField(blank=True, null=True, default=dict)

    # Optional challenge link
    challenge = models.OneToOneField(Challenge, on_delete=models.SET_NULL, null=True, blank=True, related_name='match')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.player1.username} vs {self.player2.username} ({self.game.name})"
    

class TennisSet(models.Model):
    match = models.ForeignKey(Match, related_name='sets', on_delete=models.CASCADE)
    set_number = models.IntegerField()
    player1_games = models.IntegerField(default=0)
    player2_games = models.IntegerField(default=0)

    class Meta:
        unique_together = ('match', 'set_number')
        ordering = ['set_number']

    def __str__(self):
        return f"Set {self.set_number} - {self.match}"