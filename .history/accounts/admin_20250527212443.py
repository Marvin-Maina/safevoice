from django.contrib import admin
from .models import User, UserProfile, UserPlan

admin.site.register(User, UserProfile, UserPlan)
# Register your models here.
