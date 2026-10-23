import os
from pathlib import Path
from datetime import timedelta

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY: Use environment variables for secret keys in production
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-5gd^30=ef!w-94k()m!9xd&m7l65)fs=w9)&d8ow_959i663a(')

# SECURITY: Disable DEBUG mode in production
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = [
    'api.nextfashiontextile.com',
    'django_backend',  # Internal Docker communication
    'localhost',
    '127.0.0.1',
]

# ------------------------------------------------------------------------------
# CLOUDFLARE PROXY & SECURITY SETTINGS
# ------------------------------------------------------------------------------
# Trust Cloudflare's HTTPS header
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "https://nextfashiontextile.com",
    "https://www.nextfashiontextile.com",
]
CORS_ALLOW_CREDENTIALS = True

# CSRF Configuration
CSRF_TRUSTED_ORIGINS = [
    "https://nextfashiontextile.com",
    "https://www.nextfashiontextile.com",
    "https://api.nextfashiontextile.com",
]

# ------------------------------------------------------------------------------
# CROSS-SUBDOMAIN COOKIE CONFIGURATION
# ------------------------------------------------------------------------------
# Essential for sharing cookies between nextfashiontextile.com & api.nextfashiontextile.com
SESSION_COOKIE_DOMAIN = ".nextfashiontextile.com"
CSRF_COOKIE_DOMAIN = ".nextfashiontextile.com"

# Cookie Security & SameSite Attributes
CSRF_COOKIE_HTTPONLY = False  # Set to True if reading CSRF token strictly via headers
CSRF_COOKIE_SECURE = True     # Required for SameSite='None' over HTTPS
CSRF_COOKIE_SAMESITE = 'None' # Required for cross-subdomain requests

SESSION_COOKIE_SECURE = True
SESSION_COOKIE_SAMESITE = 'None'


# Application definition

INSTALLED_APPS = [
    'corsheaders',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'accounts',
    'rest_framework',
    'designer',
    'rest_framework_simplejwt',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must stay at the top
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'accounts.authentication.CustomJWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    )
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Dhaka'
USE_I18N = True
USE_TZ = True

# Static & Media Files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'