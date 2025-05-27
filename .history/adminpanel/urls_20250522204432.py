# adminpanel/urls.py
from django.urls import path
from .views import (
    AdminReportListView,
    AdminReportDetailView,
    AdminReportUpdateView
)

urlpatterns = [
    path('reports/', AdminReportListView.as_view(), name='admin-report-list'),
    path('reports/<int:id>/', AdminReportDetailView.as_view(), name='admin-report-detail'),
    path('reports/<int:id>/update/', AdminReportUpdateView.as_view(), name='admin-report-update'),
]
