import os
import dj_database_url

MIDDLEWARE = [
    'whitenoise.middleware.WhiteNoiseMiddleware',
]
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'your-backend.onrender.com',  # Replace with your Render backend domain
]

CORS_ALLOWED_ORIGINS = [
    'https://your-frontend.vercel.app',  # Replace with your Vercel frontend domain
]

DATABASES = {
    'default': dj_database_url.config(conn_max_age=600, ssl_require=True)
} 