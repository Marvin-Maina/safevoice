from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from reports.models import Report
from accounts.models import User  # Adjust if your user model is elsewhere
from .serializers import AdminReportSerializer, AdminUserSerializer
from .permissions import IsAdminOrPremiumAdmin, IsPremiumAdmin
from rest_framework import generics, views, status
from rest_framework.response import Response
from django.db.models import Count
from django.http import HttpResponse
import csv

# FREE + PREMIUM: View & filter reports
class AdminReportListView(generics.ListAPIView):
    serializer_class = AdminReportSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPremiumAdmin]

    def get_queryset(self):
        queryset = Report.objects.all()
        status_param = self.request.query_params.get('status')
        category_param = self.request.query_params.get('category')
        if status_param:
            queryset = queryset.filter(status=status_param)
        if category_param:
            queryset = queryset.filter(category=category_param)
        return queryset

# FREE + PREMIUM: View report detail
class AdminReportDetailView(generics.RetrieveAPIView):
    queryset = Report.objects.all()
    serializer_class = AdminReportSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPremiumAdmin]
    lookup_field = 'id'

# FREE + PREMIUM: Update report status
class AdminReportUpdateView(generics.UpdateAPIView):
    queryset = Report.objects.all()
    serializer_class = AdminReportSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPremiumAdmin]
    lookup_field = 'id'

# PREMIUM ONLY: Analytics endpoint
class AdminAnalyticsView(views.APIView):
    permission_classes = [IsAuthenticated, IsPremiumAdmin]

    def get(self, request):
        data = {
            "reports_by_status": Report.objects.values("status").annotate(count=Count("id")),
            "reports_by_category": Report.objects.values("category").annotate(count=Count("id")),
        }
        return Response(data)

# PREMIUM ONLY: Export reports (CSV)
class ExportReportsView(views.APIView):
    permission_classes = [IsAuthenticated, IsPremiumAdmin]

    def get(self, request):
        reports = Report.objects.all()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="reports.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'Title', 'Category', 'Status', 'Created'])

        for report in reports:
            writer.writerow([
                report.id,
                report.title,
                report.category,
                report.status,
                report.created_at
            ])
        return response

# PREMIUM ONLY: View all users
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsPremiumAdmin]

# PREMIUM ONLY: Update user role/plan
class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsPremiumAdmin]
    lookup_field = 'id'

# PREMIUM ONLY: Soft delete user
class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsPremiumAdmin]
    lookup_field = 'id'

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
