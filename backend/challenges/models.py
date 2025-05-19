from django.db import models
#from api.models import User
#from games.models import Game
from django.contrib.auth import get_user_model
#User = get_user_model()


class Challenge(models.Model):
    CHALLENGE_STATUS = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
        ('completed', 'Completed'),
        ('expired', 'Expired'),
    ]

    sender = models.ForeignKey('api.User', related_name='sent_challenges', on_delete=models.CASCADE)
    receiver = models.ForeignKey('api.User', related_name='received_challenges', on_delete=models.CASCADE)
    game = models.ForeignKey('games.Game', on_delete=models.CASCADE)
    scheduled_time = models.DateTimeField()
    status = models.CharField(max_length=10, choices=CHALLENGE_STATUS, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sender.username} → {self.receiver.username} ({self.status})"


# challenges/models.py

# challenges/models.py

class TennisMatch(models.Model):
    challenge = models.OneToOneField(Challenge, on_delete=models.CASCADE, related_name='tennismatch')
    player1_score = models.JSONField(default=dict)
    player2_score = models.JSONField(default=dict)
    winner = models.ForeignKey('api.User', null=True, blank=True, on_delete=models.SET_NULL)

    def save(self, *args, **kwargs):
        from games.models import Match  # Avoid circular import

        # ✅ Robust check: Find or create Match linked to this challenge
        match, created = Match.objects.get_or_create(
            challenge=self.challenge,
            defaults={
                'game': self.challenge.game,
                'player1': self.challenge.sender,
                'player2': self.challenge.receiver,
                'status': 'scheduled'
            }
        )

        # ✅ If winner is set, update status
        if self.winner and self.challenge.status != 'completed':
            self.challenge.status = 'completed'
            self.challenge.save()
            match.status = 'completed'
            match.winner = self.winner
            match.save()

        super().save(*args, **kwargs)
