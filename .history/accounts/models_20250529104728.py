from django.contrib.auth.models import AbstractUser
from django.db import models

class Organization(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    website = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

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

    # Optional FK for org this user belongs to (only admins representing orgs)
    organization = models.ForeignKey(Organization, null=True, blank=True, on_delete=models.SET_NULL)

    def is_user(self):
        return self.role == 'user'

    def is_admin(self):
        return self.role == 'admin'

    def is_premium(self):
        return self.plan == 'premium'
