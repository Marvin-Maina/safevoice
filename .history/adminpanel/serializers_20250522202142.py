from rest_framework import serializers
from reports.models import Report

class AdminReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'