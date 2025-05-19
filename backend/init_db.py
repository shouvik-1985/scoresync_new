import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from games.models import Game

def init_games():
    games = [
        "Tennis",
        "Badminton",
        "Table Tennis",
        "Cricket",
        "Football",
        "Chess"
    ]
    
    for game_name in games:
        Game.objects.get_or_create(name=game_name)
        print(f"Created game: {game_name}")

if __name__ == "__main__":
    print("Initializing database...")
    init_games()
    print("Database initialization complete!") 