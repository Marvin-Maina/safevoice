from rest_framework import serializers
from reports.models import Report, Notification, ReportComment # Assuming Notification, ReportComment are in reports.models
from django.contrib.auth import get_user_model

User = get_user_model()

# Admin Report Serializer
class AdminReportSerializer(serializers.ModelSerializer):
    # Ensure these fields match your Report model and are appropriate for admin view
    status = serializers.ChoiceField(choices=Report.STATUS_CHOICES, required=False)
    internal_notes = serializers.CharField(required=False, allow_blank=True)
    submitted_at = serializers.DateTimeField(read_only=True)
    file_upload = serializers.FileField(read_only=True)
    # Assuming these fields exist on your Report model or are properties
    is_resolved = serializers.BooleanField(read_only=True)
    priority_flag = serializers.BooleanField(required=False)
    submitted_by_username = serializers.CharField(source='submitted_by.username', read_only=True) # To display submitter's username
    is_anonymous = serializers.BooleanField(read_only=True) # To indicate if report is anonymous
    is_premium_report = serializers.BooleanField(read_only=True) # To indicate if it's a premium report

    class Meta:
        model = Report
        fields = [
            'id', 'title', 'description', 'category', 'status', 'internal_notes',
            'file_upload', 'submitted_at', 'is_resolved', 'priority_flag',
            'submitted_by', 'submitted_by_username', 'is_anonymous', 'is_premium_report'
        ]
        read_only_fields = ['id', 'submitted_at', 'file_upload', 'submitted_by', 'is_resolved', 'is_anonymous', 'is_premium_report']


# Admin User Serializer (for managing users in the admin panel)
class AdminUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    is_active = serializers.BooleanField(required=False)
    # Add other fields you want admins to see/update for users
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'plan', 'is_active',
            'date_joined', 'last_login' # Example additional fields
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'last_login'] # Admins can update role/plan/is_active

# Report Analytics Serializer (for the analytics data structure)
class ReportAnalyticsSerializer(serializers.Serializer):
    total_reports = serializers.IntegerField()
    reports_by_category = serializers.DictField(child=serializers.IntegerField())
    reports_by_status = serializers.DictField(child=serializers.IntegerField())
    reports_by_month = serializers.ListField(child=serializers.DictField())
    premium_vs_free_reports = serializers.DictField(child=serializers.IntegerField())
    anonymous_vs_identified_reports = serializers.DictField(child=serializers.IntegerField())
    priority_reports_count = serializers.IntegerField()

# Notification Serializer (for notifications to users)
class NotificationSerializer(serializers.ModelSerializer):
    report_title = serializers.CharField(source='report.title', read_only=True) # Display associated report title
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'is_read', 'created_at', 'report', 'report_title']
        read_only_fields = ['user', 'created_at', 'report']

# Report Comment Serializer (for the communication feature)
class ReportCommentSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    is_current_user_sender = serializers.SerializerMethodField()
    display_sender_name = serializers.SerializerMethodField() # For anonymous display

    class Meta:
        model = ReportComment
        fields = ['id', 'report', 'sender', 'sender_username', 'message', 'sent_at', 'is_internal', 'is_current_user_sender', 'display_sender_name']
        read_only_fields = ['id', 'report', 'sender', 'sent_at', 'sender_username']

    def get_is_current_user_sender(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sender == request.user
        return False

    def get_display_sender_name(self, obj):
        # If the report is anonymous and the sender is the original submitter,
        # or if the sender is an anonymous user, display "Anonymous User".
        # Otherwise, display the sender's username.
        request = self.context.get('request')
        if request and obj.report.is_anonymous and obj.sender == obj.report.submitted_by:
            return "Anonymous User"
        elif request and obj.sender.is_admin(): # Admins should always show their username
            return obj.sender.username
        elif request and obj.sender == request.user: # Current user's name
            return obj.sender.username
        elif obj.report.is_anonymous and obj.sender == obj.report.submitted_by:
             return "Anonymous User"
        else: # For other users not the current user, show username
            return obj.sender.username
