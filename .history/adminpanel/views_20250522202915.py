from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from reports.models import Report
from .serializers import AdminReportSerializer
from .permissions import IsAdminOrPremiumAdmin

class AdminReportListView(generics.ListAPIView):
    queryset = Report.objects.all()
    serializer_class = AdminReportSerializer
    permission_classes = [IsAuthenticated, IsAdfm]

# Create your views here.
