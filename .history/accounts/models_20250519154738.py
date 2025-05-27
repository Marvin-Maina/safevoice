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
        
    )

# Create your models here.
