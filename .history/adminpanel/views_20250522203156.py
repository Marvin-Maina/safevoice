from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from reports.models import Report
from .serializers import AdminReportSerializer
from .permissions import IsAdminOrPremiumAdmin
from rest_framework import generics
class AdminReportListView(generics.ListAPIView):
    queryset = Report.objects.all()
    serializer_class = AdminReportSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPremiumAdmin]
    
class AdminReportDetailView(generics.RetrieveAPIView):
    queryset = Report.objects.all()
    serializer_class = AdminReportSerializer
    permission_classes =[IsAuthenticated, IsAdminOrPremiumAdmin]
    loo
# Create your views here.
