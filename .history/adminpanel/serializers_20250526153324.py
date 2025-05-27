from rest_framework import serializers
from reports.models import Report
from django.contrib.auth import get_user_model

User = get_user_model()

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
            '
            'submitted_at',
            'is_resolved',
            'priority_flag',
            'submitted_by',
        ]
        read_only_fields = ['id', 'submitted_at', 'evidence_file', 'submitted_by']

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
            'date_joined',
            'last_login',
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'last_login']
