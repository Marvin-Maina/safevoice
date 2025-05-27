import uuid
from django.db import models

class Report(models.Model):
    REPORT_TYPE_CHOICES = [
        ('abuse', 'Abuse'),
        ('corruption', 'Corruption'),
        ('harassment', 'Harassment'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES)
    status = models.CharField(max_length=20, default='pending')
    attached_files = models.FileField(upload_to='reports/', blank=True, null=True)
    token = models.CharField(max_length=36, unique=True, default=uuid.uuid4)
    is_anonymous = models.BooleanField(default=True)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} - {'Anonymous' if self.is_anonymous else self.submitted_by.username}"
zz