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
        
    def validate_pri