from django.urls import path
from .views import *


# Default registration id {"email": "example3@gmail.com", "password": "11111111"} (already exists in db)

urlpatterns = [
    path('refresh/', CookieTokenObtainView.as_view(), name='refresh_Token'),
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', profileView.as_view(), name='profile'),
    path('password/change/', PasswordChangeView.as_view(), name='password-change'),
    path('admin/stats/', AdminStatsView.as_view(), name='admin-stats'),
    path('admin/users/', AdminUserListView.as_view(), name='admin-users'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/designs/', AdminDesignListView.as_view(), name='admin-designs'),
    path('admin/designs/<int:pk>/', AdminDesignDetailView.as_view(), name='admin-design-detail'),
    path('admin/colors/', AdminColorListView.as_view(), name='admin-colors'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('login/', LoginView.as_view(), name='login'),
]
