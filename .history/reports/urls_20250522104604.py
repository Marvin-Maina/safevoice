from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReportViewSet, ReportCertificateView, ReportAnalyticsView
from django.conf import settings
from django.conf.urls.static import static


router = DefaultRouter()
router.register(r'reports', ReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
    path('reports/<int:report_id>/certificate/',ReportCertificateView.as_view(), name='report-pdf')
    
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
