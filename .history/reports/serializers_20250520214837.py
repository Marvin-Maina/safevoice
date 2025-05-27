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
        if value and getattr(user, 'tier', 'free' ) != 'premium':
            raise serializers.ValidationError("Priority flag is only available to premium users")
        return value
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['submitted_by'] = user
        validated_data['is_premium'] = user.tier == 'premium'
        return super().create