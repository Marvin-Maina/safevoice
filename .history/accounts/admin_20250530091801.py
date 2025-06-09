from django.contrib import admin
from .models import User, AdminAccessRequest # Import AdminAccessRequest

admin.site.register(User)
admin.site.register(AdminAccessRequest) # Register AdminAccessRequest