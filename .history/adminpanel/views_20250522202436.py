from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from reports.models import Report
from .serializers import AdminReportSerializer
from .permissions import IsAdminOrPremiumAdmin

class AdminReportListView

# Create your views here.
