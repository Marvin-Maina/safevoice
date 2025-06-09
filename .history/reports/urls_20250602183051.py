# reports/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReportViewSet, ReportCertificateView, ReportAnalyticsView,
    NotificationListView, NotificationMarkReadView, ReportCommentViewSet # Added
)
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report') # Changed r'' to r'reports' for clarity
# Register ReportCommentViewSet nested under reports
router.register(r'reports/(?P<report_id>\d+)/comments', ReportCommentViewSet, basename='report-comment')


urlpatterns = [
    path('', include(router.urls)),
    path('reports/<int:report_id>/certificate/', ReportCertificateView.as_view(), name='report-pdf'),
    path('reports/analytics/', ReportAnalyticsView.as_view(), name='report-analytics'), # Changed path for clarity
    path('notifications/', NotificationListView.as_view(), name='notification-list'), # New
    path('notifications/<int:notification_id>/mark-read/', NotificationMarkReadView.as_view(), name='notification-mark-read'), # New
]

# + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) # This might be in main urls.py