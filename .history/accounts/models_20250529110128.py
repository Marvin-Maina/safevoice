from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class Organization(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
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


class AdminAccessRequest(models.Model):
    REQUEST_TYPE_CHOICES = (
        ('individual', 'Individual'),
        ('organization', 'Organization'),
    )

    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHOICES)
    organization_name = models.CharField(max_length=255, blank=True, null=True)
    organization_description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_requests')

    def __str__(self):
        return f"{self.user.username} - {self.request_type} - {self.status}"
