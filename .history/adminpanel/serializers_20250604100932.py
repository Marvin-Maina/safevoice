from rest_framework import serializers
from reports.models import Report, Notification, ReportComment
from django.contrib.auth import get_user_model

User = get_user_model()

class AdminReportSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=Report.STATUS_CHOICES, required=False)
    internal_notes = serializers.CharField(required=False, allow_blank=True)
    submitted_at = serializers.DateTimeField(read_only=True)
    file_upload = serializers.FileField(read_only=True)
    is_resolved = serializers.BooleanField(read_only=True)
    priority_flag = serializers.BooleanField(required=False)
    submitted_by_username = serializers.CharField(source='submitted_by.username', read_only=True)
    is_anonymous = serializers.BooleanField(read_only=True)
    is_premium_report = serializers.BooleanField(read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'title', 'description', 'category', 'status', 'internal_notes',
            'file_upload', 'submitted_at', 'is_resolved', 'priority_flag',
            'submitted_by', 'submitted_by_username', 'is_anonymous', 'is_premium_report'
        ]
        read_only_fields = ['id', 'submitted_at', 'file_upload', 'submitted_by', 'is_resolved', 'is_anonymous', 'is_premium_report']

class AdminUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    is_active = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'role', 'plan', 'is_active',
            'date_joined', 'last_login',
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'last_login']

class ReportAnalyticsSerializer(serializers.Serializer):
    total_reports = serializers.IntegerField()
    reports_by_category = serializers.DictField(child=serializers.IntegerField())
    reports_by_status = serializers.DictField(child=serializers.IntegerField())
    reports_by_month = serializers.ListField(child=serializers.DictField())
    premium_vs_free_reports = serializers.DictField(child=serializers.IntegerField())
    anonymous_vs_identified_reports = serializers.DictField(child=serializers.IntegerField())
    priority_reports_count = serializers.IntegerField()

class NotificationSerializer(serializers.ModelSerializer):
    report_title = serializers.CharField(source='report.title', read_only=True)
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'is_read', 'created_at', 'report', 'report_title']
        read_only_fields = ['user', 'created_at', 'report']

class ReportCommentSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    is_current_user_sender = serializers.SerializerMethodField()
    display_sender_name = serializers.SerializerMethodField()
    is_sender_admin = serializers.SerializerMethodField()

    class Meta:
        model = ReportComment
        fields = ['id', 'report', 'sender', 'sender_username', 'message', 'sent_at', 'is_internal', 'is_current_user_sender', 'display_sender_name', 'is_sender_admin']
        read_only_fields = ['id', 'report', 'sender', 'sent_at', 'sender_username']

    def get_is_current_user_sender(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sender == request.user
        return False

    def get_display_sender_name(self, obj):
        # 1. If the comment is an internal admin note, display "Admin (Internal Note)"
        if obj.is_internal:
            return "Admin (Internal Note)"
        # 2. If the sender is an admin (and not an internal note), display their username
        elif obj.sender.is_admin():
            # If the admin is the current user, we can still show their username
            # If it's another admin, we show their username
            return obj.sender.username
        # 3. If the sender is the original report submitter, display "Anonymous User"
        # This covers both anonymous reports and identified users who are the report submitter.
        elif obj.sender == obj.report.submitted_by:
            return "Anonymous User"
        # 4. Fallback for any other sender (shouldn't typically happen in this context)
        else:
            return "Unknown User" # Or a generic "Participant" if preferred

    def get_is_sender_admin(self, obj):
        return obj.sender.is_admin()
