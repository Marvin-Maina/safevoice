from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Organization, AdminAccessRequest, Report, Notification, ReportComment # Added Notification, ReportComment
FR
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


# OPTIONAL LOGIN SERIALIZER (if you want manual login)
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


# CUSTOM JWT TOKEN SERIALIZER WITH CUSTOM CLAIMS
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        token['plan'] = user.plan
        return token


# ADMIN ACCESS REQUEST SERIALIZER
class AdminAccessRequestSerializer(serializers.ModelSerializer):
    justification = serializers.CharField(source='organization_description', required=True)
    organization_name = serializers.CharField(required=False, allow_blank=True)
    organization_type = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = AdminAccessRequest
        fields = [
            'id', 'request_type', 'organization_name',
            'organization_type', 'justification', 'status', 'submitted_at'
        ]
        read_only_fields = ['id', 'status', 'submitted_at']

    def validate(self, attrs):
        req_type = attrs.get('request_type')
        if req_type == 'organization':
            if not attrs.get('organization_name'):
                raise serializers.ValidationError("Organization name is required for organization requests.")
            if not attrs.get('organization_type'):
                raise serializers.ValidationError("Organization type is required for organization requests.")
        return attrs


class ReportSerializer(serializers.ModelSerializer):
    # Add new fields to fields list
    class Meta:
        model = Report
        fields = [
            'id', 'title', 'category', 'description', 'status',
            'submitted_at', 'last_status_update', 'file_upload', 'evidence_type', 'token',
            'is_anonymous', 'is_premium', 'priority_flag',
            'reviewed_by', 'internal_notes', 'resolution_notes' # Added admin fields
        ]
        read_only_fields = [
            'status', 'submitted_at', 'last_status_update', 'token',
            'is_premium', 'reviewed_by', 'internal_notes', 'resolution_notes'
        ]

    def validate_priority_flag(self, value):
        user = self.context['request'].user
        # Only admins can set priority_flag
        if value and not user.is_admin(): # Assumes is_admin() method on User model
            raise serializers.ValidationError("Only admins can set priority flag.")
        return value

    def validate_is_anonymous(self, value):
        user = self.context['request'].user
        # Example validation: only premium users or admins can submit anonymous reports
        if value and not (user.is_premium() or user.is_admin()):
            raise serializers.ValidationError("Anonymous reports are only available to premium users or admins.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['submitted_by'] = user
        validated_data['is_premium'] = user.is_premium() # Use is_premium() method

        # Determine evidence_type based on file_upload if present
        file = validated_data.get('file_upload')
        if file:
            ext = file.name.split('.')[-1].lower()
            from django.conf import settings # Import settings here to avoid circular dependency
            import mimetypes

            mime_type, _ = mimetypes.guess_type(file.name)
            if mime_type and 'image' in mime_type:
                validated_data['evidence_type'] = 'image'
            elif mime_type and 'video' in mime_type:
                validated_data['evidence_type'] = 'video'
            elif mime_type and 'pdf' in mime_type: # Assuming PDF is a document type
                validated_data['evidence_type'] = 'document'
            else:
                validated_data['evidence_type'] = 'other' # Or a more specific 'file' type

        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Admin-specific fields can only be updated by admins
        user = self.context['request'].user
        if not user.is_admin():
            # Filter out fields that only admins can modify
            admin_only_fields = ['status', 'priority_flag', 'reviewed_by', 'internal_notes', 'resolution_notes']
            for field in admin_only_fields:
                if field in validated_data:
                    validated_data.pop(field) # Remove the field if not admin

        # If status changes, update last_status_update
        if 'status' in validated_data and instance.status != validated_data['status']:
            instance.last_status_update = timezone.now()
            # Optionally, create a notification here
            # Notification.objects.create(user=instance.submitted_by, report=instance, message=f"Your report '{instance.title}' status changed to {validated_data['status']}")


        return super().update(instance, validated_data)

class AdminReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            'id', 'title', 'category', 'description', 'status',
            'submitted_at', 'last_status_update', 'file_upload', 'evidence_type', 'token',
            'is_anonymous', 'is_premium', 'priority_flag',
            'reviewed_by', 'internal_notes', 'resolution_notes'
        ]
        read_only_fields = ['submitted_at', 'token', 'is_premium']

    def update(self, instance, validated_data):
        validated_data['last_status_update'] = timezone.now()
        validated_data['reviewed_by'] = self.context['request'].user
        return super().update(instance, validated_data)

class ReportAnalyticsSerializer(serializers.Serializer):
    total_reports = serializers.IntegerField()
    reports_by_category = serializers.DictField(child=serializers.IntegerField())
    reports_by_status = serializers.DictField(child=serializers.IntegerField())
    reports_by_month = serializers.ListField(child=serializers.DictField())
    premium_vs_free_reports = serializers.DictField(child=serializers.IntegerField())
    anonymous_vs_identified_reports = serializers.DictField(child=serializers.IntegerField()) # Added
    priority_reports_count = serializers.IntegerField() # Added

class NotificationSerializer(serializers.ModelSerializer): # New Serializer
    report_title = serializers.CharField(source='report.title', read_only=True)
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'is_read', 'created_at', 'report', 'report_title']
        read_only_fields = ['user', 'created_at', 'report']

class ReportCommentSerializer(serializers.ModelSerializer): # New Serializer
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    class Meta:
        model = ReportComment
        fields = ['id', 'report', 'sender', 'sender_username', 'message', 'sent_at', 'is_internal']
        read_only_fields = ['report', 'sender', 'sent_at']