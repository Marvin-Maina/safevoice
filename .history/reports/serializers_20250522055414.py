from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            'id', 'title', 'category', 'description', 'status',
            'submitted_at', 'file_upload', 'token', 
            'is_premium', 'priority_flag', 'is_anonymous'
        ]
        read_only_fields = ['status', 'submitted_at', 'token', 'is_premium']

    def validate_priority_flag(self, value):
        user = self.context['request'].user
        if value and getattr(user, 'role', 'free') != 'premium':
            raise serializers.ValidationError("Priority flag is only available to premium users")
        return value
    
    def validate_is_anonymous(self, value):
        # Example validation: only premium users can submit anonymous reports
        user = self.context['request'].user
        if value and getattr(user, 'role', 'free') != 'premium':
            raise serializers.ValidationError("Anonymous reports are only available to premium users")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['submitted_by'] = user
        validated_data['is_premium'] = user.role == 'premium'
        return super().create(validated_data)
