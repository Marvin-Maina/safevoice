from rest_framework import serializers
from reports.models import Report

class AdminReportSerializer(serializers.ModelSerializer):
    status = serializers.ChoiceField(choices=Report.STATUS_CHOICES, required=False)
    internal_notes = serializers.CharField(required=False, allow_blank=True)
    submitted_at = serializers.DateTimeField(read_only=True)
    evidence_file = serializers.FileField(read_only=True)
    is_resolved = serializers.BooleanField(read_only=True)

    class Meta:
        model = Report
        fields = [
            'id',
            'title',
            'description',
            'category',
            'status',
            'internal_notes',
            'evidence_file',
            'location',
            'submitted_at',
            'is_resolved',
            'priority_level',
            'submitted_by',  # Optional: may be null for anonymous
        ]
        read_only_fields = ['id', 'submitted_at', 'evidence_file', 'submitted_by']
