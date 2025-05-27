from django.contrib import admin
from .models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'report_type', 'is_anonymous', 'submitted_by', 'submitted_at', 'is_resolved')
    search_fields = ('title', 'description', 'report_type')
    list_filter = ('report_type', 'is_anonymous', 'is_resolved', 'submitted_at')
