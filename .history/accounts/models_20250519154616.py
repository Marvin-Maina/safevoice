from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('whistleblower', 'Whistleblower'),
        ()
    )

# Create your models here.
