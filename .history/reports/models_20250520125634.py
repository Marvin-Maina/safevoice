from django.db import models
from django.conf import settings

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
    is_anonymous = models.BooleanField(default=True)
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)
    resolution_notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.title} - {'Anonymous' if self.is_anonymous else self.submitted_by.username}"

# Create your models here.
