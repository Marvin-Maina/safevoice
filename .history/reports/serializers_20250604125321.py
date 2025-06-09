from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Organization, AdminAccessRequest, Report, Notification, ReportComment # Ensure all models are imported
from django.db import models # Import models for choices if needed
from django.conf import settings # For accessing AUTH_USER_MODEL if needed

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


# CUSTOM JWT TOKEN SERIALIZER (for login)
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

# USER PROFILE SERIALIZER
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'role', 'plan')
        read_only_fields = ('role', 'plan') # Users should not change their role/plan directly

# ADMIN ACCESS REQUEST SERIALIZER
class AdminAccessRequestSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True) # To display username

    class Meta:
        model = AdminAccessRequest
        fields = [
            'id', 'user', 'user_username', 'request_type', 'organization_name',
            'organization_description', 'status', 'submitted_at', 'reviewed_at',
            'reviewed_by'
        ]
        read_only_fields = ['user', 'status', 'submitted_at', 'reviewed_at', 'reviewed_by']

# REPORT SERIALIZER (for regular users)
class ReportSerializer(serializers.ModelSerializer):
    # Make file_upload optional for updates, but required for creation
    file_upload = serializers.FileField(required=False, allow_null=True)
    submitted_by_username = serializers.CharField(source='submitted_by.username', read_only=True)
    is_anonymous = serializers.BooleanField(read_only=True) # Read-only, set by model logic
    is_premium_report = serializers.BooleanField(read_only=True) # Read-only, set by view logic

    class Meta:
        model = Report
        fields = [
            'id', 'title', 'description', 'category', 'status', 'priority_flag',
            'submitted_at', 'file_upload', 'token', 'submitted_by',
            'submitted_by_username', 'is_anonymous', 'is_premium_report'
        ]
        read_only_fields = ['id', 'status', 'submitted_at', 'token', 'submitted_by', 'submitted_by_username', 'is_anonymous', 'is_premium_report']

    def create(self, validated_data):
        # Ensure file_upload is optional at creation if not provided
        file_upload = validated_data.pop('file_upload', None)
        report = Report.objects.create(**validated_data)
        if file_upload:
            report.file_upload = file_upload
            report.save()
        return report

    def update(self, instance, validated_data):
        # Allow file_upload to be updated or cleared
        file_upload = validated_data.pop('file_upload', None)
        if file_upload is not None: # If a new file is provided or explicitly set to null
            instance.file_upload = file_upload
        elif 'file_upload' in validated_data and file_upload is None: # If file_upload was explicitly set to null
            instance.file_upload = None

        return super().update(instance, validated_data)


# NOTIFICATION SERIALIZER
class NotificationSerializer(serializers.ModelSerializer):
    report_title = serializers.CharField(source='report.title', read_only=True) # Display report title if linked

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
        # 1. If the comment is an internal admin note, display "Admin (Internal Note)"
        if obj.is_internal:
            return "Admin (Internal Note)"
        # 2. If the sender is an admin (and not an internal note), display their username
        elif obj.sender.is_admin():
            return obj.sender.username
        # 3. If the sender is the original report submitter, display "Anonymous User"
        # This covers both anonymous reports and identified users who are the report submitter.
        elif obj.sender == obj.report.submitted_by:
            return "Anonymous User"
        # 4. Fallback for any other sender (shouldn't typically happen in this context)
        else:
            return "Unknown User"

    def get_is_sender_admin(self, obj):
        return obj.sender.is_admin()
