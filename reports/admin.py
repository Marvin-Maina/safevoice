from django.contrib import admin
from .models import Report

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'status', 'is_premium', 'priority_flag', 'submitted_at', 'is_anonymous_display')
    
    def is_anonymous_display(self, obj):
        return True  # or some logic if partial anonymity applies
    is_anonymous_display.short_description = "Anonymous"

