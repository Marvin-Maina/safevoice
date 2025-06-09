# reports/models.py

from django.db import models
from django.conf import settings
from decouple import config
import uuid
import os
import re
from encrypted_model_fields.fields import EncryptedTextField
from .validators import validate_upload_file
from django.utils import timezone # Make sure this is imported if using timezone.now()

# ... (rest of your existing code, e.g., clean_filename, user_report_path, Organization, User, etc.)

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
        ('escalated', 'Escalated'),
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
    description = EncryptedTextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
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

    priority_flag = models.BooleanField(default=False)

    # Add the missing fields here:
    is_premium = models.BooleanField(default=False) # Used in admin.py list_display and list_filter
    last_status_update = models.DateTimeField(null=True, blank=True) # Used in admin.py list_display, readonly_fields, fieldsets
    evidence_type = models.CharField(max_length=50, blank=True, null=True) # Used in admin.py fieldsets. Adjust max_length/choices as needed.

    # New Admin Fields Below
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_reports'
    )
    internal_notes = models.TextField(blank=True)
    # ... (Add any other fields you intend to have in your Report model)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.title} ({self.category}) - {self.status} - Token: {self.token}"

    def get_certificate_qr_data(self):
        frontend_url = config('FRONTEND_BASE_URL', default='https://yourapp.com')
        return f"{frontend_url}/reports/{self.token}/verify"

# ... (rest of your existing models, e.g., Notification, ReportComment, etc.)