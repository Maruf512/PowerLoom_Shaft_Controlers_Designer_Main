from django.db import models


class Account(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    phone = models.CharField(max_length=32, blank=True, default="")
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


    @property
    def is_authenticated(self):
        return True
    
    def is_anonymous(self):
        return False
    
    def __str__(self):
        return self.email
