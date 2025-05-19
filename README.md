1. create virtual environment python -m venv venv
2. activate it .\venv\Scripts\Activate.ps1

BACKEND:
- cd backend
- pip install -r requirements.txt
- run these
    python manage.py shell

from games.models import Game

Game.objects.create(name="Tennis")
Game.objects.create(name="Badminton")
Game.objects.create(name="Table Tennis")

exit

-python manage.py makemigrations
python manage.py migrate

- python manage.py runserver

FRONTEND:
dont foreget to activate venv
-npm install
- npm run dev
