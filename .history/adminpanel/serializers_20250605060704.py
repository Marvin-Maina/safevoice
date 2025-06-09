# adminpanel/serializers.py

from rest_framework import serializers
from reports.models import Report, Notification, ReportComment # Assuming these models are accessible from adminpanel
from django.contrib.auth import get_user_model
from django.utils import timezone # Added for last_status_update

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

    def update(self, instance, validated_data):
        # Update last_status_update and reviewed_by when status changes
        if 'status' in validated_data and validated_data['status'] != instance.status:
            validated_data['last_status_update'] = timezone.now()
            validated_data['reviewed_by'] = self.context['request'].user
        return super().update(instance, validated_data)


class AdminUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    is_active = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'role',
            'plan',
            'is_active',
            'organization', # Assuming organization is a field on User
        ]
        read_only_fields = ['id', 'email'] # ID and email should not be changeable via this serializer

class MonthlyTrendSerializer(serializers.Serializer):
    month = serializers.CharField()
    count = serializers.IntegerField()

class ReportAnalyticsSerializer(serializers.Serializer):
    total_reports = serializers.IntegerField()
    reports_by_status = serializers.DictField(child=serializers.IntegerField())
    reports_by_category = serializers.DictField(child=serializers.IntegerField())
    monthly_trends = MonthlyTrendSerializer(many=True)  
    priority_reports_count = serializers.IntegerField()