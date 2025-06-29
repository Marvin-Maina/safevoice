from django.db import models
from django.conf import settings
import uuid
from encrypted_model_fields.fields import EncryptedTextField, EncryptedFileField

def user_report_path(instance, filename):
    return f"reports/{instance.submitted_by_id}/{uuid.uuid4()}_{filename}"

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
    ]

    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    description = EncryptedTextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_premium = models.BooleanField(default=False)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    file_upload = EncryptedFileField(upload_to=user_report_path, blank=True, null=True)
    priority_flag = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} - {self.token}"

# decorators.py
from rest_framework.exceptions import PermissionDenied

def require_premium(view_func):
    def wrapped_view(self, request, *args, **kwargs):
        if not hasattr(request.user, 'tier') or request.user.tier != 'premium':
            raise PermissionDenied("This feature is available to premium users only.")
        return view_func(self, request, *args, **kwargs)
    return wrapped_view
