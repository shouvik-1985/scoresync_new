import jwt
import firebase_admin
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework import authentication, exceptions
from rest_framework.exceptions import AuthenticationFailed
from firebase_admin import auth, credentials

User = get_user_model()

class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            raise AuthenticationFailed('Invalid token')

        try:
            user = User.objects.get(id=payload['user_id'])
        except User.DoesNotExist:
            raise AuthenticationFailed('User not found')

        return (user, None)
    
if not firebase_admin._apps:
    cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_KEY)
    firebase_admin.initialize_app(cred)


class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]

        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token.get('uid')
        except Exception:
            raise AuthenticationFailed('Invalid Firebase token')

        try:
            user = User.objects.get(firebase_uid=uid)
        except User.DoesNotExist:
            # Optionally create the user if not found
            user = User.objects.create(
                firebase_uid=uid,
                email=decoded_token.get('email', ''),
                username=decoded_token.get('email', '').split('@')[0],
                full_name=decoded_token.get('name', ''),
                profile_picture=decoded_token.get('picture', ''),
            )

        return (user, None)