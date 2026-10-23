import os
import uuid
from django.db import models
from django.db.models.signals import post_delete
from django.dispatch import receiver


def user_avatar_path(instance, filename):
    """Sanitizes filename and extension to lowercase to prevent 404 routing errors."""
    ext = filename.split('.')[-1].lower()
    # Generates a clean random unique filename with a lowercase extension
    new_filename = f"{uuid.uuid4().hex[:12]}.{ext}"
    return os.path.join('avatars', new_filename)


def _delete_storage_file(field_file):
    """Best-effort delete of a media file (missing file = no-op)."""
    if not field_file:
        return
    try:
        name = field_file.name
        if name and field_file.storage.exists(name):
            field_file.storage.delete(name)
    except Exception:
        pass


class Account(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    phone = models.CharField(max_length=32, blank=True, default="")
    
    # Updated upload_to to use our sanitization function
    avatar = models.ImageField(upload_to=user_avatar_path, null=True, blank=True)
    
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        old_avatar = None
        if self.pk:
            try:
                old_avatar = Account.objects.get(pk=self.pk).avatar
            except Account.DoesNotExist:
                old_avatar = None
        super().save(*args, **kwargs)
        if old_avatar and (not self.avatar or old_avatar.name != self.avatar.name):
            _delete_storage_file(old_avatar)

    def delete(self, *args, **kwargs):
        avatar = self.avatar
        super().delete(*args, **kwargs)
        _delete_storage_file(avatar)

    @property
    def is_authenticated(self):
        return True

    def is_anonymous(self):
        return False

    def __str__(self):
        return self.email


@receiver(post_delete, sender=Account)
def delete_avatar_on_account_delete(sender, instance, **kwargs):
    _delete_storage_file(instance.avatar)