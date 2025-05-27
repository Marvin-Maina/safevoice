from rest_framework import serializers
from .models import Report

class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            'id',
            'title',
            'description',
            'report_type',
            'is_anonymous',
            'submitted_at',
            'is_resolved',
            'resolution_notes',
        ]
        read_only_fields = ['id', 'submitted_at', 'is_resolved', 'resolution_notes']
    
    def create(self, validated_data):
        request = self.context.get('request')
        user = request.user if request and not validated_data.get('is_anonymous') else None
        return Report.objects.create(submitted_by=user, **validated_data)
