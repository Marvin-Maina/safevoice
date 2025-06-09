from rest_framework import generics, status, viewsets, permissions, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from django.utils.timezone import now, timedelta
from django.db.models import Count
from django.http import HttpResponse
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO
from mimetypes import guess_type
from decouple import config
import os
from rest_framework.decorators import action
from .serializers import AdminReportSerializer

# Assuming these imports are correct based on your project structure
from reports.models import Report, Notification, ReportComment
from accounts.models import User
from .serializers import AdminReportSerializer, AdminUserSerializer, ReportAnalyticsSerializer # Ensure these are correctly imported
from .permissions import IsAdminOrPremiumAdmin, IsPremiumAdmin # Import both custom permissions


# --- Existing ViewSets (keep them as they are) ---
# Report ViewSet (for users to submit and manage their reports)
# ... (your existing ReportViewSet, NotificationViewSet, ReportCommentViewSet) ...


# FREE + PREMIUM: View & filter reports
class AdminReportListView(generics.ListAPIView):
    serializer_class = AdminReportSerializer # Changed to AdminReportSerializer for consistency
    permission_classes = [IsAuthenticated, IsAdminOrPremiumAdmin] # Correct permission for all admins

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
    permission_classes = [IsAuthenticated, IsAdminOrPremiumAdmin] # Correct permission for all admins
    lookup_field = 'id'

# FREE + PREMIUM: Update report status
class AdminReportUpdateView(generics.UpdateAPIView):
    queryset = Report.objects.all()
    serializer_class = AdminReportSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPremiumAdmin] # Correct permission for all admins
    lookup_field = 'id'

    def perform_update(self, serializer):
        if 'status' in serializer.validated_data and serializer.validated_data['status'] != serializer.instance.status:
            serializer.validated_data['last_status_update'] = timezone.now()
            serializer.validated_data['reviewed_by'] = self.request.user
            if serializer.instance.submitted_by:
                Notification.objects.create(
                    user=serializer.instance.submitted_by,
                    report=serializer.instance,
                    message=f"Your report '{serializer.instance.title}' status changed to {serializer.validated_data['status']}"
                )
        super().perform_update(serializer)

# FREE + PREMIUM: Analytics (basic for free tier)
class AdminAnalyticsView(generics.GenericAPIView):
    # CHANGE THIS LINE: Allow all admins access to basic analytics
    permission_classes = [IsAuthenticated, IsAdminOrPremiumAdmin]
    serializer_class = ReportAnalyticsSerializer # Ensure this is correctly set

    def get(self, request, *args, **kwargs):
        total_reports = Report.objects.count()
        reports_by_status = dict(Report.objects.values('status').annotate(count=Count('status')).order_by('status').values_list('status', 'count'))

        today = timezone.now()
        months_data = []
        for i in range(6):
            month_start = (today - timezone.timedelta(days=30*i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            month_end = (month_start + timezone.timedelta(days=30)).replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timezone.timedelta(microseconds=1)
            
            reports_in_month = Report.objects.filter(submitted_at__gte=month_start, submitted_at__lt=month_end).count()
            months_data.append({
                'month': month_start.strftime('%Y-%m'),
                'count': reports_in_month
            })
        months_data.reverse()

        premium_vs_free_reports = {}
        if hasattr(Report, 'is_premium'): # Assuming 'is_premium' field on Report model
            premium_vs_free_reports = dict(Report.objects.values('is_premium').annotate(count=Count('is_premium')).order_by('is_premium').values_list('is_premium', 'count'))
        
        anonymous_vs_identified_reports = dict(Report.objects.values('is_anonymous').annotate(count=Count('is_anonymous')).order_by('is_anonymous').values_list('is_anonymous', 'count'))

        priority_reports_count = Report.objects.filter(priority_flag=True).count()

        data = {
            'total_reports': total_reports,
            'reports_by_status': reports_by_status,
            'reports_by_category': dict(Report.objects.values('category').annotate(count=Count('category')).order_by('category').values_list('category', 'count')),
            'reports_by_month': months_data,
            'premium_vs_free_reports': premium_vs_free_reports,
            'anonymous_vs_identified_reports': anonymous_vs_identified_reports,
            'priority_reports_count': priority_reports_count,
        }
        return Response(data)


# PREMIUM ONLY: Export reports (CSV)
class ExportReportsView(views.APIView): # Changed to views.APIView for consistency with your file
    permission_classes = [IsAuthenticated, IsPremiumAdmin] # This remains for Premium Admins only

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
                report.submitted_at.strftime('%Y-%m-%d %H:%M:%S')])
        return response

# PREMIUM ONLY: View all users
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer # Ensure this is AdminUserSerializer
    permission_classes = [IsAuthenticated, IsPremiumAdmin] # This remains for Premium Admins only

# PREMIUM ONLY: Update user role/plan
class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer # Ensure this is AdminUserSerializer
    permission_classes = [IsAuthenticated, IsPremiumAdmin] # This remains for Premium Admins only
    lookup_field = 'id'

# PREMIUM ONLY: Soft delete user
class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsPremiumAdmin] # This remains for Premium Admins only
    lookup_field = 'id'
