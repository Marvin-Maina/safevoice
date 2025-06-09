# reports/views.py

from django.shortcuts import render
from rest_framework import generics, status, viewsets, permissions, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import action
from django.db.models import Count
from django.utils import timezone
import csv
from django.http import HttpResponse
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO
from mimetypes import guess_type
from decouple import config
import os

# Imports from the current app's models
from .models import User, Organization, AdminAccessRequest, Report, Notification, ReportComment

# Imports from the current app's serializers (reports app)
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    AdminAccessRequestSerializer,
    ReportSerializer,
    NotificationSerializer,
    ReportCommentSerializer
)

# IMPORTANT: Imports from the adminpanel app's serializers
from adminpanel.serializers import AdminReportSerializer, AdminUserSerializer, ReportAnalyticsSerializer

# Imports for custom permissions (assuming these are in adminpanel/permissions.py)
from adminpanel.permissions import IsAdminOrPremiumAdmin, IsPremiumAdmin


# --- Authentication & User Management Views ---

# Register View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

# Custom JWT Login View
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Logout (Blacklist Refresh Token)
class LogoutView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"message": "Logged out successfully"})
        except Exception:
            return Response({"error": "Invalid token or already blacklisted."}, status=status.HTTP_400_BAD_REQUEST)

# Profile View (Get/Update User Info)
class ProfileView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Admin Access Request View
class AdminAccessRequestView(generics.CreateAPIView):
    queryset = AdminAccessRequest.objects.all()
    serializer_class = AdminAccessRequestSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        if AdminAccessRequest.objects.filter(user=self.request.user, status='pending').exists():
            raise ValidationError({"error": "You already have a pending admin access request."})
        serializer.save(user=self.request.user)

# Admin Access Request Review View (Admin only)
class AdminAccessRequestReviewView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pending_requests = AdminAccessRequest.objects.filter(status='pending')
        serializer = AdminAccessRequestSerializer(pending_requests, many=True)
        return Response(serializer.data)

    def post(self, request, request_id):
        action = request.data.get('action')
        if action not in ['approve', 'reject']:
            return Response({"error": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            admin_request = AdminAccessRequest.objects.get(id=request_id, status='pending')
        except AdminAccessRequest.DoesNotExist:
            return Response({"error": "Request not found or already processed."}, status=status.HTTP_404_NOT_FOUND)

        if action == 'approve':
            admin_request.status = 'approved'
            user = admin_request.user
            user.role = 'admin'

            if admin_request.request_type == 'organization':
                org, created = Organization.objects.get_or_create(
                    name=admin_request.organization_name,
                    defaults={'description': admin_request.organization_description}
                )
                user.organization = org

            user.save()
            Notification.objects.create(
                user=user,
                message=f"Your admin access request has been approved!",
                report=None
            )
        else:
            admin_request.status = 'rejected'
            Notification.objects.create(
                user=admin_request.user,
                message=f"Your admin access request has been rejected.",
                report=None
            )

        admin_request.reviewed_by = request.user
        admin_request.reviewed_at = timezone.now()
        admin_request.save()

        return Response({"message": f"Request {action}d successfully."})


# Premium Plan Upgrade View (Admin only)
class UpgradeUserPlanView(views.APIView):
    permission_classes = [IsAuthenticated, IsPremiumAdmin]

    def post(self, request):
        user_id = request.data.get('user_id')
        plan_type = request.data.get('plan_type')

        if not user_id or plan_type not in ['free', 'premium']:
            return Response({"error": "Invalid user ID or plan type."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_to_upgrade = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        user_to_upgrade.plan = plan_type
        user_to_upgrade.save()

        return Response({"message": f"User {user_to_upgrade.username} plan upgraded to {plan_type}."})


# --- Report Management ViewSet (for users to submit and manage their reports) ---
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_admin():
            return Report.objects.all()
        return Report.objects.filter(submitted_by=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        # Removed is_anonymous toggle as you requested earlier
        serializer.save(submitted_by=user)

    @action(detail=False, methods=['get'], url_path='by-token/(?P<token>[^/.]+)', permission_classes=[AllowAny])
    def by_token(self, request, token=None):
        try:
            report = Report.objects.get(token=token)
            return Response({
                'id': report.id,
                'title': report.title,
                'category': report.category,
                'status': report.status,
                'submitted_at': report.submitted_at,
                'priority_flag': report.priority_flag,
                'file_upload_url': report.file_upload.url if report.file_upload else None,
            })
        except Report.DoesNotExist:
            return Response({"detail": "Report not found."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel(self, request, pk=None):
        report = self.get_object()
        if report.submitted_by != request.user:
            return Response({"error": "You can only cancel your own reports."}, status=403)

        if report.status == 'cancelled':
            return Response({"message": "Report is already cancelled."})

        report.status = 'cancelled'
        report.save()
        return Response({"message": "Report cancelled successfully."})

    def destroy(self, request, *args, **kwargs):
        report = self.get_object()
        if report.submitted_by != request.user:
            return Response({"error": "You can only delete your own reports."}, status=403)

        if report.status == 'resolved':
            return Response({"error": "You can't delete a resolved report."}, status=400)

        report.delete()
        return Response({"message": "Report permanently deleted."}, status=204)

        @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
        def analytics(self, request):
            user = request.user

        # Filter reports for this user
        reports = Report.objects.filter(submitted_by=user)

        total_reports = reports.count()
        status_counts = reports.values('status').annotate(count=Count('id'))
        priority_count = reports.filter(priority_flag=True).count()
        category_counts = reports.values('category').annotate(count=Count('id'))

        # Reports in last 30 days grouped by day
        thirty_days_ago = now() - timedelta(days=30)
        recent_reports = reports.filter(submitted_at__gte=thirty_days_ago)
        reports_by_day = recent_reports.extra({
            'day': "date(submitted_at)"
        }).values('day').annotate(count=Count('id')).order_by('day')

        data = {
            'total_reports': total_reports,
            'status_counts': list(status_counts),
            'priority_count': priority_count,
            'category_counts': list(category_counts),
            'reports_by_day': list(reports_by_day),
        }
        return Response(data)
    
    
    from django.core.mail import send_mail

class ReportViewSet(viewsets.ModelViewSet):
    # ... your existing code ...

    def perform_update(self, serializer):
        # Get current status before update
        instance = self.get_object()
        old_status = instance.status

        serializer.save()

        # Check if status changed
        new_status = serializer.instance.status
        if old_status != new_status:
            self.send_status_update_email(serializer.instance)

    def send_status_update_email(self, report):
        subject = f"Your report '{report.title}' status has been updated!"
        message = (
            f"Hey,\n\n"
            f"Your report titled '{report.title}' has changed status.\n"
            f"New status: {report.status}\n\n"
            f"Thanks for keeping us informed!\n"
            f"— The SafeVoice Team"
        )
        recipient = [report.submitted_by.email]

        # Send the email
        send_mail(subject, message, 'no-reply@safevoice.com', recipient)

        
        
# --- Notification ViewSet (for users to manage their notifications) ---
from django.http import Http404
from rest_framework.decorators import action
from rest_framework import permissions, status
from rest_framework.response import Response

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_read(self, request, pk=None):
        try:
            notification = self.get_object()
        except Http404:
            return Response({"detail": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)

        if notification.user != request.user:
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        notification.is_read = True
        notification.save()
        return Response({'status': 'Notification marked as read'}, status=status.HTTP_200_OK)

# --- ReportComment ViewSet (for communication between users and admins on reports) ---
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

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
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

        comment_instance = serializer.save(report=report, sender=self.request.user, is_internal=is_internal_comment)

        response_serializer = self.get_serializer(comment_instance, context={'request': self.request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

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


# --- Report Certificate View ---
class ReportCertificateView(views.APIView):
    permission_classes = [AllowAny]

    def get(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Report Certificate")
        p.drawString(100, 730, f"Title: {report.title}")
        p.drawString(100, 710, f"Category: {report.category}")
        p.drawString(100, 690, f"Status: {report.status}")
        p.drawString(100, 670, f"Priority: {'Yes' if report.priority_flag else 'No'}")
        p.drawString(100, 650, f"Submitted: {report.submitted_at.strftime('%Y-%m-%d %H:%M:%S')}")
        p.drawString(100, 630, f"Token: {report.token}")

        if report.file_upload:
            filename = os.path.basename(report.file_upload.name)
            mime_type, _ = guess_type(report.file_upload.url)
            file_url = request.build_absolute_uri(report.file_upload.url)
            p.drawString(100, 610, f"Attachment: {filename}")
            p.drawString(100, 590, f"File Type: {mime_type or 'Unknown'}")
            p.drawString(100, 570, f"File URL: {file_url[:80]}...")

        qr_data = report.get_certificate_qr_data()
        qr_img = qrcode.make(qr_data)
        img_buffer = BytesIO()
        qr_img.save(img_buffer, format="PNG")
        img_buffer.seek(0)

        from reportlab.lib.utils import ImageReader
        qr_image_reader = ImageReader(img_buffer)
        p.drawImage(qr_image_reader, 400, 600, width=100, height=100)

        p.showPage()
        p.save()

        buffer.seek(0)
        return HttpResponse(buffer.getvalue(), content_type='application/pdf')


# --- Admin Panel Views ---

# FREE + PREMIUM ADMINS: View & filter reports
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

# FREE + PREMIUM ADMINS: View report detail
class AdminReportDetailView(generics.RetrieveAPIView):
    queryset = Report.objects.all()
    serializer_class = AdminReportSerializer
    permission_classes = [IsAuthenticated, IsAdminOrPremiumAdmin]
    lookup_field = 'id'

# FREE + PREMIUM ADMINS: Update report status
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

# FREE + PREMIUM ADMINS: Analytics (basic summary for free tier)
class AdminAnalyticsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, IsAdminOrPremiumAdmin]
    serializer_class = ReportAnalyticsSerializer

    def get(self, request, *args, **kwargs):
        # >>> START DEBUG PRINTS <<<
        print(f"\n--- Entering AdminAnalyticsView.get() ---")
        print(f"Request user: {request.user}")
        print(f"Is user authenticated? {request.user.is_authenticated}")
        if request.user.is_authenticated:
            print(f"User role: {request.user.role}")
            print(f"User plan: {request.user.plan}")
        else:
            print("User is NOT authenticated in AdminAnalyticsView.")
        # >>> END DEBUG PRINTS (for initial check) <<<

        total_reports = Report.objects.count()
        reports_by_status_query = Report.objects.values('status').annotate(count=Count('status')).order_by('status')
        reports_by_status = {item['status']: item['count'] for item in reports_by_status_query}

        reports_by_category_query = Report.objects.values('category').annotate(count=Count('category')).order_by('category')
        reports_by_category = {item['category']: item['count'] for item in reports_by_category_query}

        today = timezone.now()
        months_data = []
        for i in range(6):
            month_start = (today - timezone.timedelta(days=30*i)).replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if month_start.month == 12:
                next_month_start = month_start.replace(year=month_start.year + 1, month=1)
            else:
                next_month_start = month_start.replace(month=month_start.month + 1)
            month_end = next_month_start - timezone.timedelta(microseconds=1)
            
            reports_in_month = Report.objects.filter(submitted_at__gte=month_start, submitted_at__lt=month_end).count()
            months_data.append({
                'month': month_start.strftime('%Y-%m'),
                'count': reports_in_month
            })
        months_data.reverse()

        premium_vs_free_reports = {}
        # Corrected: Use 'is_premium' field from Report model.
        # Serializer expects keys True (for premium) and False (for free)
        premium_reports_count = Report.objects.filter(is_premium=True).count()
        # total_reports is already calculated
        free_reports_count = total_reports - premium_reports_count

        premium_vs_free_reports = {
            True: premium_reports_count,  # True represents premium reports
            False: free_reports_count     # False represents non-premium (free) reports
        }
        anonymous_vs_identified_reports = dict(Report.objects.values('is_anonymous').annotate(count=Count('is_anonymous')).order_by('is_anonymous').values_list('is_anonymous', 'count'))

        priority_reports_count = Report.objects.filter(priority_flag=True).count()

        data = {
            'total_reports': total_reports,
            'reports_by_category': reports_by_category,
            'reports_by_status': reports_by_status,
            'monthly_trends': months_data, # Match ReportAnalyticsSerializer field name
            'premium_vs_free_reports': premium_vs_free_reports,
            'anonymous_vs_identified_reports': anonymous_vs_identified_reports,
            'priority_reports_count': priority_reports_count,
        }

        # >>> START DEBUG PRINTS FOR SERIALIZER <<<
        print(f"Data prepared for serializer: {data}")
        serializer = ReportAnalyticsSerializer(data=data)
        
        if not serializer.is_valid():
            print(f"Serializer validation FAILED!")
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            print(f"Serializer validation PASSED.")
        # >>> END DEBUG PRINTS FOR SERIALIZER <<<

        return Response(serializer.data)

# PREMIUM ADMINS ONLY: View all users
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsPremiumAdmin]

# PREMIUM ADMINS ONLY: Update user role/plan
class UserUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsPremiumAdmin]
    lookup_field = 'id'

# PREMIUM ADMINS ONLY: Soft delete user
class UserDeleteView(generics.DestroyAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAuthenticated, IsPremiumAdmin]
    lookup_field = 'id'