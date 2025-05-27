from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from reports.models import Report
from .serializers import AdminReportSerializer


# Create your views here.
