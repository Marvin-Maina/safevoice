from django.contrib import admin
from .models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'location', 'submitted_by', 'created_at')
    search_fields = ('title', 'description', 'location')
    list_filter = ('created_at',)
