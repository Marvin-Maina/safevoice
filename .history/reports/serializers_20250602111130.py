from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            'id', 'title', 'category', 'description', 'status',
            'submitted_at', 'file_upload', 'token',
            'is_premium', 'priority_flag'
        ]
        read_only_fields = ['status', 'submitted_at', 'token', 'is_premium']

    def validate_priority_flag(self, value):
        user = self.context['request'].user
        if value and getattr(user, 'plan', 'free') != 'premium': # Check user's plan for premium
            raise serializers.ValidationError("Priority flag is only available to premium users")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['submitted_by'] = user # Link report to the logged-in user
        validated_data['is_premium'] = user.plan == 'premium' # Set is_premium based on user's plan
        return super().create(validated_data)

class ReportAnalyticsSerializer(serializers.Serializer):
    total_reports = serializers.IntegerField()
    reports_by_category = serializers.DictField(child=serializers.IntegerField())
    reports_by_status = serializers.DictField(child=serializers.IntegerField())
    reports_by_priority = serializers.DictField(child=serializers.IntegerField())