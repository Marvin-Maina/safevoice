# reports/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReportViewSet, ReportCertificateView, AdminAnalyticsView,
      ReportCommentViewSet
      
)

router = DefaultRouter()
# CHANGE THIS LINE: Remove 'reports' here. It will be added by the main urls.py
router.register(r'', ReportViewSet, basename='report')


# For nested comments, it's often clearer to define these explicitly
# rather than relying on nested routers, especially with the r'' change above.
# The `report_id` parameter will be correctly passed from the main router's URL structure.
urlpatterns = [
    path('', include(router.urls)), # This now makes ReportViewSet available at the root of reports.urls

    # Explicitly define paths for comments, relative to the base 'reports' path
    # These will become /api/reports/<int:report_id>/comments/ and /api/reports/<int:report_id>/comments/<int:pk>/
    path('<int:report_id>/comments/', ReportCommentViewSet.as_view({'get': 'list', 'post': 'create'}), name='report-comment-list'),
    path('<int:report_id>/comments/<int:pk>/', ReportCommentViewSet.as_view({'patch': 'update_comment'}), name='report-comment-detail'),


    path('reports/<int:report_id>/certificate/', ReportCertificateView.as_view(), name='report-pdf'),
    path('reports/analytics/', AdminAnalyticsView.as_view(), name='report-analytics'),
    
]

