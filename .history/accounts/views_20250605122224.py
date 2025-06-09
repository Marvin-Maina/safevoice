from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Organization, AdminAccessRequest
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    CustomTokenObtainPairSerializer,
    AdminAccessRequestSerializer,
)
from django.utils import timezone

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

# Admin-only: Upgrade User Plan to Premium
class UpgradeUserPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Only admins can upgrade users."}, status=status.HTTP_403_FORBIDDEN)

        target_user_id = request.data.get('user_id')
        try:
            target_user = User.objects.get(id=target_user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        target_user.plan = 'premium'
        target_user.save()
        return Response({"message": f"{target_user.username}'s plan upgraded to premium."})

# User submits Admin Access Request
class AdminAccessRequestView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if AdminAccessRequest.objects.filter(user=request.user, status='pending').exists():
            return Response({"error": "You already have a pending admin access request."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = AdminAccessRequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "Admin access request submitted."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Admin reviews admin access requests
class AdminAccessRequestReviewView(APIView):
    permission_classes = [IsAuthenticated, ]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Admins only."}, status=status.HTTP_403_FORBIDDEN)

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
        else:
            admin_request.status = 'rejected'

        admin_request.reviewed_by = request.user
        admin_request.reviewed_at = timezone.now()
        admin_request.save()

        return Response({"message": f"Request {action}d successfully."})
