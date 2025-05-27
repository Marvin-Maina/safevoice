from django.db import models
from django.conf import settings
from decouple import config
import uuid
import os
import re
from encrypted_model_fields.fields import EncryptedTextField
from .validators import validate_upload_file

def clean_filename(filename):
    name, ext = os.path.splitext(filename)
    safe_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', name)
    return f"{safe_name}{ext}"

def user_report_path(instance, filename):
    user_id = instance.submitted_by_id or 'anonymous'
    clean_name = clean_filename(filename)
    return f"reports/{user_id}/{uuid.uuid4()}_{clean_name}"

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

    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports',
        null=True,
        blank=True
    )

    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    description = EncryptedTextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_premium = models.BooleanField(default=False)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    file_upload = models.FileField(
        upload_to=user_report_path,
        blank=True,
        null=True,
        validators=[validate_upload_file]
    )
    is_image = models.BooleanField(default=False)
    is_video = models.BooleanField(default=False)

    priority_flag = models.BooleanField(default=False)  # Admins can toggle
    

    # ✨ New Admin Fields Below ✨
    reviewed_by = models.ForeignKey(  # Optional: track which admin reviewed it
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_reports'
    )

    internal_notes = models.TextField(blank=True)  # Admin-only notes

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.title} ({self.category}) - {self.status} - Token: {self.token}"

    def get_certificate_qr_data(self):
        frontend_url = config('FRONTEND_BASE_URL', default='https://yourapp.com')
        return f"{frontend_url}/reports/{self.token}/verify"

    def save(self, *args, **kwargs):
        if self.file_upload:
            ext = os.path.splitext(self.file_upload.name)[1].lower()
            self.is_image = ext in ['.jpg', '.jpeg', '.png', '.gif']
            self.is_video = ext in ['.mp4', '.mov', '.avi']
        super().save(*args, **kwargs)
