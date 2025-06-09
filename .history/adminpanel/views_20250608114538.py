from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from reports.models import Report
from accounts.models import User  # Adjust if your user model is elsewhere
from .serializers import AdminReportSerializer, AdminUserSerializer, ReportAnalyticsSerializer
from .permissions import IsAdminOrPremiumAdmin, IsPremiumAdmin
from rest_framework import generics, views, status
from rest_framework.response import Response
from django.db.models import Count
from django.http import HttpResponse
import csv
from collections import defaultdict

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
    permission_classes = [IsAuthenticated, IsAdminOrPremiumAdmin]

    def get(self, request):
        reports_by_status_qs = Report.objects.values("status").annotate(count=Count("id"))
        reports_by_status = {entry["status"]: entry["count"] for entry in reports_by_status_qs}

        reports_by_category_qs = Report.objects.values("category").annotate(count=Count("id"))
        reports_by_category = {entry["category"]: entry["count"] for entry in reports_by_category_qs}

        monthly_trends_qs = Report.objects.extra(
            select={'month': "DATE_TRUNC('month', submitted_at)"}
        ).values('month').annotate(count=Count('id')).order_by('month')

        monthly_trends = [
            {"month": entry["month"].strftime("%Y-%m"), "count": entry["count"]}
            for entry in monthly_trends_qs
        ]

        data = {
            "total_reports": Report.objects.count(),
            "reports_by_status": reports_by_status,
            "reports_by_category": reports_by_category,
            "monthly_trends": monthly_trends,
            "priority_reports_count": Report.objects.filter(priority_flag=True).count(),
        }

        
        serializer = ReportAnalyticsSerializer(instance=data)
        return Response(serializer.data)


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
                report.description,
                report.category,
                report.status,
                report.submitted_at.strftime('%Y-%m-%d %H:%M:%S')])
        return response

# PREMIUM ONLY: View all users
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, Is]

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
