from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allows access to Account users flagged as admin,
    plus Django superusers / staff (so `createsuperuser` accounts
    can manage the app before the first Account admin exists)."""

    def has_permission(self, request, view):
        user = getattr(request, 'user', None)
        if not user or not getattr(user, 'is_authenticated', False):
            return False
        # Django auth superuser / staff (django.contrib.auth User)
        if getattr(user, 'is_superuser', False) or getattr(user, 'is_staff', False):
            return True
        # App account admin flag (accounts.Account)
        return bool(getattr(user, 'is_admin', False))
