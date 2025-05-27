from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('user', 'User'),         # Submits reports
        ('admin', 'Admin'),       # Reviews reports
    )

    PLAN_CHOICES = (
        ('free', 'Free'),
        ('premium', 'Premium'),
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    plan = models.CharField(max_length=10, choices=PLAN_CHOICES, default='free')

    def is_user(self):
        return self.role == 'user'

    def is_admin(self):
        return self.role == 'admin'

    def is_premium(self):
        return self.plan == 'premium'
