from django.db import models
from django.conf import settings
from decouple import config
import uuid
import os
import re
from encrypted_model_fields.fields import EncryptedTextField
from .validators import validate_upload_file
from django.utils import timezone
from django.contrib.auth.models import AbstractUser


def clean_filename(filename):
    name, ext = os.path.splitext(filename)
    safe_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', name)
    return f"{safe_name}{ext}"

def user_report_path(instance, filename):
    user_id = instance.submitted_by_id or 'anonymous'
    clean_name = clean_filename(filename)
    return f"reports/{user_id}/{uuid.uuid4()}_{clean_name}"

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
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='admin_access_reviews')


class Report(models.Model):
    CATEGORY_CHOICES = [
        ('abuse', 'Abuse'),
        ('corruption', 'Corruption'),
        ('harassment', 'Harassment'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_review', 'Under Review'),
        ('resolved', 'Resolved'),
        ('escalated', 'Escalated'),  # Added for critical reports
    ]

    EVIDENCE_TYPE_CHOICES = [ # New field
        ('image', 'Image'),
        ('video', 'Video'),
        ('document', 'Document'),
        ('audio', 'Audio'),
        ('none', 'None'),
    ]

    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports',
        null=True,
        blank=True
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = EncryptedTextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_anonymous = models.BooleanField(default=False) # Added
    is_premium = models.BooleanField(default=False) # Added
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    last_status_update = models.DateTimeField(auto_now=True) # New field

    file_upload = models.FileField(
        upload_to=user_report_path,
        blank=True,
        null=True,
        validators=[validate_upload_file]
    )
    evidence_type = models.CharField(max_length=20, choices=EVIDENCE_TYPE_CHOICES, default='none') # Replaced is_image/is_video

    priority_flag = models.BooleanField(default=False)  # Admins can toggle


    # New Admin Fields
    reviewed_by = models.ForeignKey(  # Optional: track which admin reviewed it
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_reports'
    )

    internal_notes = models.TextField(blank=True)  # Admin-only notes
    resolution_notes = models.TextField(blank=True) # New field for resolution details


    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.title} ({self.category}) - {self.status} - Token: {self.token}"

    def get_certificate_qr_data(self):
        frontend_url = config('FRONTEND_BASE_URL', default='https://yourapp.com')
        return f"{frontend_url}/reports/{self.token}/verify"


class Notification(models.Model): # New Model
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    report = models.ForeignKey(Report, on_delete=models.SET_NULL, null=True, blank=True, related_name='notifications')

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification for {self.user.username}: {self.message[:50]}"


class ReportComment(models.Model): # New Model
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='comments')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_comments')
    message = models.TextField()
    sent_at = models.DateTimeField(auto_now_add=True)
    is_internal = models.BooleanField(default=False) # True for admin-only notes/communication

    class Meta:
        ordering = ['sent_at']

    def __str__(self):
        return f"Comment on {self.report.title} by {self.sender.username}"