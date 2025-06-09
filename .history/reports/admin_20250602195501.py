from django.contrib import admin
from .models import User, Report, Organization, AdminAccessRequest, Notification, ReportComment # Import all models

# Register your models here.
admin.site.register(User)
admin.site.register(Organization)
admin.site.register(AdminAccessRequest)
admin.site.register(Notification)
admin.site.register(ReportComment)


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'category', 'status', 'is_premium', 'priority_flag',
        'submitted_at', 'last_status_update', 'is_anonymous_display', 'reviewed_by'
    )
    list_filter = ('category', 'status', 'is_premium', 'priority_flag', 'is_anonymous', 'submitted_at')
    search_fields = ('title', 'description', 'token', 'submitted_by__username')
    raw_id_fields = ('submitted_by', 'reviewed_by') # Use raw_id_fields for FKs to User
    date_hierarchy = 'submitted_at'
    readonly_fields = ('token', 'submitted_at', 'last_status_update') # Make token read-only

    fieldsets = (
        (None, {
            'fields': ('title', 'category', 'description', 'file_upload', 'evidence_type', 'is_anonymous')
        }),
        ('Status and Priority', {
            'fields': ('status', 'priority_flag', 'submitted_by', 'is_premium', 'token', 'submitted_at', 'last_status_update'),
            'classes': ('collapse',)
        }),
        ('Admin Review', {
            'fields': ('reviewed_by', 'internal_notes', 'resolution_notes'),
            'classes': ('collapse',)
        }),
    )

    actions = ['mark_as_resolved', 'mark_as_escalated', 'set_priority_flag'] # Add admin actions

    def is_anonymous_display(self, obj):
        return obj.is_anonymous
    is_anonymous_display.short_description = "Anonymous"
    is_anonymous_display.boolean = True # Shows a nice checkmark/cross icon


    def mark_as_resolved(self, request, queryset):
        updated_count = queryset.update(status='resolved', reviewed_by=request.user, resolution_notes=f"Resolved by admin {request.user.username}")
        self.message_user(request, f'{updated_count} reports marked as resolved.')
    mark_as_resolved.short_description = "Mark selected reports as Resolved"

    def mark_as_escalated(self, request, queryset):
        updated_count = queryset.update(status='escalated', reviewed_by=request.user, priority_flag=True)
        self.message_user(request, f'{updated_count} reports marked as escalated and priority flagged.')
    mark_as_escalated.short_description = "Mark selected reports as Escalated (and Priority)"

    def set_priority_flag(self, request, queryset):
        updated_count = queryset.update(priority_flag=True)
        self.message_user(request, f'{updated_count} reports marked as high priority.')
    set_priority_flag.short_description = "Set priority flag for selected reports"