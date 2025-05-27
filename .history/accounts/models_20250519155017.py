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
    
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='whistleblower')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='free')
    
    def is_premium(self):
        return self.role == 'premium'
    
    def is_organization(self)
# Create your models here.
