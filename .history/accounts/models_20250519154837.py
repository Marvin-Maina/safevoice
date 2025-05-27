from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('whistleblower', 'Whistleblower'),
        ('organization', 'Organization')
    )
    ROLE_CHOICES = (
        ('free', 'Free'),
        ('premium', 'Premium'),
        ('admin', 'Admin')
    )
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, de)

# Create your models here.
