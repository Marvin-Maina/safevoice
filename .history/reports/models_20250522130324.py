from django.db import models
from django.conf import settings
import uuid
from encrypted_model_fields.fields import EncryptedTextField
from .validators import validate_upload_file

def clean_filename(filename):
    
def user_report_path(instance, filename):
    user_id = instance.submitted_by_id or 'anonymous'
    return f"reports/{user_id}/{uuid.uuid4()}_{filename}"

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
        related_name='reports',
        null=True,  # if anonymous allowed
        blank=True
    )
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    description = EncryptedTextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_premium = models.BooleanField(default=False)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    file_upload = models.FileField(upload_to=user_report_path, blank=True, null=True, validators=[validate_uplaod_file])  
    priority_flag = models.BooleanField(default=False)
    is_anonymous = models.BooleanField(default=False)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.title} ({self.category}) - {self.status} - Token: {self.token}"

    def get_certificate_qr_data(self):
        # This URL can be used to generate QR codes for certificates
        return f"https://yourapp.com/reports/{self.token}/verify"
