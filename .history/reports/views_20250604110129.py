from django.shortcuts import render
from rest_framework import generics, status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from django.db.models import Count
from django.utils import timezone
import csv
from django.http import HttpResponse

# Assuming these imports are correct based on your project structure
from .models import Report, Notification, ReportComment
from accounts.models import User
from adminpanel.serializers import AdminReportSerializer, AdminUserSerializer, ReportAnalyticsSerializer # Make sure these are imported from adminpanel.serializers
from .serializers import ReportSerializer, NotificationSerializer, ReportCommentSerializer # Make sure these are imported from .serializers (reports app)
from adminpanel.permissions import IsAdminOrPremiumAdmin, IsPremiumAdmin # Import custom permissions


# --- Existing ViewSets (keep them as they are) ---

# Report ViewSet (for users to submit and manage their reports)
class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin():
            return Report.objects.all()
        return Report.objects.filter(submitted_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(submitted_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='by-token/(?P<token>[^/.]+)', permission_classes=[AllowAny])
    def by_token(self, request, token=None):
        try:
            report = Report.objects.get(token=token)
            serializer = self.get_serializer(report) # get_serializer automatically passes context
            return Response({
                'id': report.id,
                'title': report.title,
                'category': report.category,
                'status': report.status,
                'submitted_at': report.submitted_at,
                'is_anonymous': report.is_anonymous,
                'priority_flag': report.priority_flag,
                'file_upload_url': report.file_upload.url if report.file_upload else None,
            })
        except Report.DoesNotExist:
            return Response({"detail": "Report not found."}, status=status.HTTP_404_NOT_FOUND)

# Notification ViewSet (for users to manage their notifications)
class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        try:
            notification = self.get_object()
            notification.is_read = True
            notification.save()
            return Response({'status': 'notification marked as read'})
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

# ReportComment ViewSet (for communication between users and admins on reports)
class ReportCommentViewSet(viewsets.ModelViewSet):
    queryset = ReportComment.objects.all()
    serializer_class = ReportCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        report_id = self.kwargs['report_id']
        queryset = self.queryset.filter(report_id=report_id)
        if not self.request.user.is_admin():
            queryset = queryset.filter(is_internal=False)
        return queryset.order_by('sent_at')

    # Override list method to ensure context is passed for list view
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        # IMPORTANT: Pass context={'request': request} to the serializer
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    # Override retrieve method to ensure context is passed for detail view
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # IMPORTANT: Pass context={'request': request} to the serializer
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    def perform_create(self, serializer):
        report_id = self.kwargs['report_id']
        report = generics.get_object_or_404(Report, id=report_id)

        is_report_submitter = (report.submitted_by == self.request.user)

        if not (self.request.user.is_admin() or is_report_submitter):
            raise permissions.PermissionDenied("You do not have permission to add comments to this report.")

        is_internal_from_request = self.request.data.get('is_internal', False)
        is_internal_comment = self.request.user.is_admin() and is_internal_from_request

        serializer.save(report=report, sender=self.request.user, is_internal=is_internal_comment)

    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_comment(self, request, pk=None, report_id=None):
        comment = self.get_object()
        serializer = self.get_serializer(comment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        if not (comment.sender == request.user or request.user.is_admin()):
            raise permissions.PermissionDenied("You do not have permission to update this comment.")

        if 'is_internal' in request.data and not request.user.is_admin():
            raise permissions.PermissionDenied("Only admins can modify the internal status of comments.")

        serializer.save()
        return Response(serializer.data)

# --- Admin Panel Views (keep them as they are) ---

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
    permission_classes = [IsAuthenticated, IsAdminOrPremiumAdmin]
    serializer_class = ReportAnalyticsSerializer

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
        if hasattr(Report, 'is_premium'):
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
class ExportReportsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsPremiumAdmin]

    def get(self, request):
        reports = Report.objects.all()
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="reports.csv"'
        writer = csv.writer(response)
        writer.writerow(['ID', 'Title', 'Category', 'Status', 'Submitted At', 'Is Anonymous', 'Priority Flag', 'Submitted By', 'Reviewed By'])

        for report in reports:
            submitted_by = report.submitted_by.username if report.submitted_by else 'Anonymous'
            reviewed_by = report.reviewed_by.username if report.reviewed_by else 'N/A'
            writer.writerow([
                report.id,
                report.title,
                report.category,
                report.status,
                report.submitted_at.strftime('%Y-%m-%d %H:%M:%S'),
                'Yes' if report.is_anonymous else 'No',
                'Yes' if report.priority_flag else 'No',
                submitted_by,
                reviewed_by,
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
