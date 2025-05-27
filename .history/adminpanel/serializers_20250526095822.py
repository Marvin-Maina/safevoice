from rest_framework import serializers
from reports.models import Report

class AdminReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'
        read_only_fields = [
            'id', 
            'title', 
            'description', 
            'evidence_file', 
            'submitter_token', 
            'encrypted', 
            'created_at',
            'region',
            'category'
        ]

    def update(self, instance, validated_data):
        # Only allow admins to update the following fields:
        allowed_updates = ['status', 'internal_notes']
        for field in allowed_updates:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()
        return instance
