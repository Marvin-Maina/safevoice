from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('whistleblower', 'Whistleblower'),
        ('organization_free', 'Org - Free'),
        ('organization_premium', 'Org - Premium'),
        ('admin', 'Admin'),
    )
    user_type = models.CharField(max_length=30, choices=USER_TYPE_CHOICES, default='whistleblower')

    def is_whistleblower(self):
        return self.user_type == 'whistleblower'

    def is_org(self):
        return self.user_type in ['organization_free', 'organization_premium']

    def is_premium(self):
        return self.user_type == 'organization_premium'

    def is_admin(self):
        return self.user_type == 'admin'
