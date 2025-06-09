# reports/serializers.py

from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Organization, AdminAccessRequest, Report, Notification, ReportComment
from django.utils import timezone # Import timezone for potential use, keep for consistency if needed

# REGISTER SERIALIZER
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)

        # Safe defaults
        user.role = 'user'
        user.plan = 'free'

        user.set_password(password)
        user.save()
        return user


# OPTIONAL LOGIN SERIALIZER (if you want manual login, though CustomTokenObtainPairSerializer is used for JWT)
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        data['user'] = user
        return data


# USER PROFILE SERIALIZER
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'role', 'plan')
        read_only_fields = ('role', 'plan') # Users should not change their role/plan directly


# CUSTOM JWT TOKEN SERIALIZER WITH ADDITIONAL CLAIMS
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        token['plan'] = user.plan
        return token


# ADMIN ACCESS REQUEST SERIALIZER
class AdminAccessRequestSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = AdminAccessRequest
        fields = ['id', 'user', 'username', 'email', 'request_type', 'organization_name', 'organization_description', 'status', 'submitted_at', 'reviewed_at', 'reviewed_by']
        read_only_fields = ['user', 'status', 'submitted_at', 'reviewed_at', 'reviewed_by']


# REPORT SERIALIZER (for users to submit/view their reports)
class ReportSerializer(serializers.ModelSerializer):
    file_upload = serializers.FileField(required=False, allow_null=True)
    # Add a read-only field for the username of the submitter
    submitted_by_username = serializers.CharField(source='submitted_by.username', read_only=True)

    class Meta:
        model = Report
        fields = [
            'id', 'title', 'description', 'category', 'status', 'submitted_at',
            'is_anonymous', 'priority_flag', 'file_upload', 'token', 'submitted_by',
            'submitted_by_username', 'last_status_update', 'reviewed_by'
        ]
        read_only_fields = ['id', 'status', 'submitted_at', 'token', 'submitted_by',  'last_status_update', 'reviewed_by']

    def create(self, validated_data):
        file_upload = validated_data.pop('file_upload', None)
        report = Report.objects.create(**validated_data)
        if file_upload:
            report.file_upload = file_upload
            report.save()
        return report

    def update(self, instance, validated_data):
        file_upload = validated_data.pop('file_upload', None)
        if file_upload is not None:
            instance.file_upload = file_upload
        elif 'file_upload' in validated_data and file_upload is None:
            instance.file_upload = None
        return super().update(instance, validated_data)

class UserReportAnalyticsSerializer(serializers.Serializer):
    """
    Serializer for displaying user-specific report analytics.
    This includes counts of reports by status, category, and monthly trends
    for reports submitted by the current user.
    """
    total_reports = serializers.IntegerField(help_text="Total number of reports submitted by the user.")
    
    status_counts = serializers.ListField(
        child=serializers.DictField(
            child=serializers.IntegerField(), # Expecting structure like [{'status': 'pending', 'count': 5}]
            help_text="Counts of reports by their current status."
        ),
        help_text="A list of dictionaries, each containing a report status and its count."
    )
    
    priority_count = serializers.IntegerField(help_text="Number of reports flagged as high priority by the user.")
    
    category_counts = serializers.ListField(
        child=serializers.DictField(
            child=serializers.IntegerField(), # Expecting structure like [{'category': 'environmental', 'count': 3}]
            help_text="Counts of reports by their category."
        ),
        help_text="A list of dictionaries, each containing a report category and its count."
    )
    
    reports_by_day = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField(), # Day will be a string (e.g., '2023-01-15')
            help_text="Daily report submission counts for the last 30 days.",
        ),
        help_text="A list of dictionaries, each containing a date (day) and the count of reports submitted on that day."
    )
    
    monthly_trends = serializers.ListField(
        child=serializers.DictField(
            child=serializers.IntegerField(), # Count will be an integer
            help_text="Monthly report submission counts for the last 6 months.",
        ),
        help_text="A list of dictionaries, each containing a month (YYYY-MM) and the count of reports submitted in that month."
    )


# NOTIFICATION SERIALIZER
class NotificationSerializer(serializers.ModelSerializer):
    report_title = serializers.CharField(source='report.title', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'is_read', 'created_at', 'report', 'report_title']
        read_only_fields = ['user', 'created_at', 'report']


# REPORT COMMENT SERIALIZER
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
        if obj.is_internal:
            return "Admin (Internal Note)"
        elif obj.sender.is_admin():
            return obj.sender.username
        elif obj.sender == obj.report.submitted_by:
            return "Anonymous User"
        return obj.sender.username # Fallback

    def get_is_sender_admin(self, obj):
        return obj.sender.is_admin()
