from django.urls import path
from .views import (
    RegisterView,
    MyTokenObtainPairView,
    LogoutView,
    ProfileView,
    UpgradeUserPlanView,
    AdminAccessRequestView,
    AdminAccessRequestReviewView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', MyTokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),

    # Admin Access Flow
    path('admin-access-request/', AdminAccessRequestView.as_view(), name='admin_access_request'),
    path('admin-access-review/', AdminAccessRequestReviewView.as_view(), name='admin_access_review_list'),
    path('admin-access-review/<int:request_id>/', AdminAccessRequestReviewView.as_view(), name='admin_access_review_detail'),

    # Premium Plan Upgrade (admin only)
    path('upgrade-plan/', UpgradeUserPlanView.as_view(), name='upgrade_plan'),
]
