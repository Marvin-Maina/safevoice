from django.contrib import admin
from .models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'status', 'is_premium', 'priority_flag', 'submitted_at')
    list_filter = ('category', 'status', 'is_premium', 'priority_flag')
