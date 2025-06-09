from rest_framework import generics, status, viewsets, permissions, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.exceptions import ValidationError 

from .models import User, Organization, AdminAccessRequest, Report, Notification, ReportComment # Added Report, Notification, ReportComment
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    AdminAccessRequestSerializer,
    ReportSerializer, # Added
    ReportAnalyticsSerializer, # Added
    NotificationSerializer, # Added
    ReportCommentSerializer # Added
)
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
from rest_framework.decorators import action # Added


# Register View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

# Custom JWT Login View
class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Logout (Blacklist Refresh Token)
class LogoutView(APIView):
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
class ProfileView(APIView):
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
        # Ensure a user can only have one pending request
        if AdminAccessRequest.objects.filter(user=self.request.user, status='pending').exists():
            raise status.HTTP_400_BAD_REQUEST({"error": "You already have a pending admin access request."})
        serializer.save(user=self.request.user)

# Admin Access Request Review View (Admin only)
class AdminAccessRequestReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Admins only."}, status=status.HTTP_403_FORBIDDEN)
        
        # Admins can see all pending requests
        pending_requests = AdminAccessRequest.objects.filter(status='pending')
        serializer = AdminAccessRequestSerializer(pending_requests, many=True)
        return Response(serializer.data)

    def post(self, request, request_id):
        if request.user.role != 'admin':
            return Response({"error": "Admins only."}, status=status.HTTP_403_FORBIDDEN)

        action = request.data.get('action')  # approve or reject
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
            # Optionally notify the user
            Notification.objects.create(
                user=user,
                message=f"Your admin access request has been approved!",
                report=None # Not related to a report
            )
        else:
            admin_request.status = 'rejected'
            # Optionally notify the user
            Notification.objects.create(
                user=user,
                message=f"Your admin access request has been rejected.",
                report=None # Not related to a report
            )

        admin_request.reviewed_by = request.user
        admin_request.reviewed_at = timezone.now()
        admin_request.save()

        return Response({"message": f"Request {action}d successfully."})


# Premium Plan Upgrade View (Admin only)
class UpgradeUserPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not request.user.is_admin():
            return Response({"error": "Only administrators can upgrade user plans."}, status=status.HTTP_403_FORBIDDEN)

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


# Report Management Views
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

        # Save the comment
        comment_instance = serializer.save(report=report, sender=self.request.user, is_internal=is_internal_comment)

        # Re-serialize the instance with context to ensure all SerializerMethodFields are computed for the response
        # This is the key part to ensure is_sender_admin is correct in the response data
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


class ReportCertificateView(views.APIView):
    permission_classes = [AllowAny] # Certificates can be public for verification

    def get(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            return Response({"error": "Report not found."}, status=status.HTTP_404_NOT_FOUND)

        # Generate a simple PDF certificate using ReportLab
        # This is a basic example; for complex PDFs, consider django-weasyprint or xhtml2pdf with templates.
        
        # Updated to use ReportLab directly as xhtml2pdf was in utils.py
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
            p.drawString(100, 570, f"File URL: {file_url[:80]}...") # Truncate long URLs

        # Add QR code for verification
        qr_data = report.get_certificate_qr_data()
        qr_img = qrcode.make(qr_data)
        img_buffer = BytesIO()
        qr_img.save(img_buffer, format="PNG")
        img_buffer.seek(0)

        # Draw QR code on PDF
        from reportlab.lib.utils import ImageReader
        qr_image_reader = ImageReader(img_buffer)
        p.drawImage(qr_image_reader, 400, 600, width=100, height=100) # Position QR code

        p.showPage()
        p.save()

        buffer.seek(0)
        return HttpResponse(buffer.getvalue(), content_type='application/pdf')

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


class ReportAnalyticsView(views.APIView):
    permission_classes = [IsAuthenticated] # Changed to IsAuthenticated
    def get(self, request):
        # Only admins can access analytics
        if not request.user.is_admin():
            return Response({"error": "You do not have permission to view analytics."}, status=status.HTTP_403_FORBIDDEN)

        total_reports = Report.objects.count()
        reports_by_category = Report.objects.values('category').annotate(count=Count('id'))
        reports_by_status = Report.objects.values('status').annotate(count=Count('id'))

        # Aggregate by month
        reports_by_month = Report.objects.extra(select={'month': "strftime('%%Y-%%m', submitted_at)"}).values('month').annotate(count=Count('id')).order_by('month')
        
        # Premium vs Free reports
        premium_vs_free = Report.objects.values('is_premium').annotate(count=Count('id'))
        premium_vs_free_dict = {
            'premium': next((item['count'] for item in premium_vs_free if item['is_premium']), 0),
            'free': next((item['count'] for item in premium_vs_free if not item['is_premium']), 0)
        }

        # Anonymous vs Identified reports
        anonymous_vs_identified = Report.objects.values('is_anonymous').annotate(count=Count('id'))
        anonymous_vs_identified_dict = {
            'anonymous': next((item['count'] for item in anonymous_vs_identified if item['is_anonymous']), 0),
            'identified': next((item['count'] for item in anonymous_vs_identified if not item['is_anonymous']), 0)
        }

        # Priority reports count
        priority_reports_count = Report.objects.filter(priority_flag=True).count()


        data = {
            'total_reports': total_reports,
            'reports_by_category': {item['category']: item['count'] for item in reports_by_category},
            'reports_by_status': {item['status']: item['count'] for item in reports_by_status},
            'reports_by_month': list(reports_by_month),
            'premium_vs_free_reports': premium_vs_free_dict,
            'anonymous_vs_identified_reports': anonymous_vs_identified_dict,
            'priority_reports_count': priority_reports_count,
        }
        serializer = ReportAnalyticsSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)


class NotificationListView(generics.ListAPIView): # New View
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')


class NotificationMarkReadView(APIView): # New View
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found or not yours."}, status=status.HTTP_404_NOT_FOUND)


class ReportCommentViewSet(viewsets.ModelViewSet): # New ViewSet
    serializer_class = ReportCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        report_id = self.kwargs['report_id']
        report = generics.get_object_or_404(Report, id=report_id)

        # Users can see their own report comments (if they submitted the report)
        # Admins can see all comments on any report
        if self.request.user.is_admin():
            return ReportComment.objects.filter(report=report)
        else:
            # Only show comments if the user is the submitter AND it's not an internal comment
            return ReportComment.objects.filter(report=report, report__submitted_by=self.request.user, is_internal=False)

    def perform_create(self, serializer):
        report_id = self.kwargs['report_id']
        report = generics.get_object_or_404(Report, id=report_id)
        
        # Only admins or the report submitter can add comments
        if not (self.request.user.is_admin() or report.submitted_by == self.request.user):
            raise permissions.PermissionDenied("You do not have permission to add comments to this report.")
        
        # Admins can set is_internal
        is_internal = self.request.data.get('is_internal', False)
        if is_internal and not self.request.user.is_admin():
            raise permissions.PermissionDenied("Only admins can create internal comments.")

        serializer.save(report=report, sender=self.request.user, is_internal=is_internal)

    # Allow partial updates for comments (e.g., admin marking a comment as read if that were a field)
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_comment(self, request, pk=None, report_id=None):
        comment = self.get_object()
        serializer = self.get_serializer(comment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        # Only sender can update their own comment, or admin can update any comment
        if not (comment.sender == request.user or request.user.is_admin()):
            raise permissions.PermissionDenied("You do not have permission to update this comment.")
        
        serializer.save()
        return Response(serializer.data)