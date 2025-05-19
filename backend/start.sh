#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Initialize games if they don't exist
python -c "
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()
from games.models import Game
games = ['Tennis', 'Badminton', 'Table Tennis', 'Cricket', 'Football', 'Chess']
for game_name in games:
    Game.objects.get_or_create(name=game_name)
    print(f'Created game: {game_name}')
"

# Collect static files
python manage.py collectstatic --noinput

# Start gunicorn
gunicorn backend.wsgi:application 