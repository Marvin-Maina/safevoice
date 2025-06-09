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
import os # Make sure os is imported for file path operations

# Imports from the current app's models
from .models import User, Organization, AdminAccessRequest, Report, Notification, ReportComment

# Imports from the current app's serializers
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    AdminAccessRequestSerializer,
    ReportSerializer,
    NotificationSerializer,
    ReportCommentSerializer
)

# Imports from the adminpanel app's serializers (Crucial for admin views)
from adminpanel.serializers import AdminReportSerializer, AdminUserSerializer, ReportAnalyticsSerializer

# Imports for custom permissions
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
class LogoutView(views.APIView): # Changed to views.APIView for consistency
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
class ProfileView(views.APIView): # Changed to views.APIView for consistency
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
            raise ValidationError({"error": "You already have a pending admin access request."}) # Use ValidationError for DRF
        serializer.save(user=self.request.user)

# Admin Access Request Review View (Admin only)
class AdminAccessRequestReviewView(views.APIView): # Changed to views.APIView for consistency
    permission_classes = [IsAuthenticated, IsAdminOrPremiumAdmin] # Only admins can review requests

    def get(self, request):
        # Admins can see all pending requests
        pending_requests = AdminAccessRequest.objects.filter(status='pending')
        serializer = AdminAccessRequestSerializer(pending_requests, many=True)
        return Response(serializer.data)

    def post(self, request, request_id):
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
            # Notify the user
            Notification.objects.create(
                user=user,
                message=f"Your admin access request has been approved!",
                report=None # Not related to a report
            )
        else:
            admin_request.status = 'rejected'
            # Notify the user
            Notification.objects.create(
                user=admin_request.user, # Notify the user who made the request
                message=f"Your admin access request has been rejected.",
                report=None # Not related to a report
            )

        admin_request.reviewed_by = request.user
        admin_request.reviewed_at = timezone.now()
        admin_request.save()

        return Response({"message": f"Request {action}d successfully."})


# Premium Plan Upgrade View (Admin only)
class UpgradeUserPlanView(views.APIView): # Changed to views.APIView for consistency
    permission_classes = [IsAuthenticated, IsPremiumAdmin] # Only premium admins can upgrade plans

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
class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filters reports: admins see all, regular users see only their own.
        """
        if self.request.user.is_admin():
            return Report.objects.all()
        return Report.objects.filter(submitted_by=self.request.user)

    def perform_create(self, serializer):
        """
        Handles creation of new reports, applying free tier limits and setting premium status.
        """
        user = self.request.user
        # Apply free tier limits if the user is on the free plan
        if user.plan == 'free':
            one_month_ago = timezone.now() - timezone.timedelta(days=30)
            recent_reports_count = Report.objects.filter(submitted_by=user, submitted_at__gte=one_month_ago).count()
            if recent_reports_count >= 3: # Example limit: 3 reports per month for free tier
                raise ValidationError("Free tier limit reached: max 3 reports/month. Upgrade to premium for unlimited.")

        # Set is_premium_report based on user's current plan at the time of submission
        serializer.save(submitted_by=user, is_premium_report=user.is_premium())

    @action(detail=False, methods=['get'], url_path='by-token/(?P<token>[^/.]+)', permission_classes=[AllowAny])
    def by_token(self, request, token=None):
        """
        Allows public access to basic report status by token for verification.
        """
        try:
            report = Report.objects.get(token=token)
            # Use a basic serializer or manually construct response to avoid sensitive data
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


# --- Notification ViewSet (for users to manage their notifications) ---
class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Ensures users only see their own notifications.
        """
        return Notification.objects.filter(user=self.request.user).order_by('-created_at')

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """
        Marks a specific notification as read.
        """
        try:
            notification = self.get_object()
            if notification.user != request.user: # Ensure user can only mark their own notification
                raise permissions.PermissionDenied("You do not have permission to mark this notification as read.")
            notification.is_read = True
            notification.save()
            return Response({'status': 'notification marked as read'})
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


# --- ReportComment ViewSet (for communication between users and admins on reports) ---
class ReportCommentViewSet(viewsets.ModelViewSet):
    queryset = ReportComment.objects.all()
    serializer_class = ReportCommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """
        Filters comments for a specific report and hides internal comments from non-admi