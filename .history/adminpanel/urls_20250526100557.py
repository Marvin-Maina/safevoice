from django.urls import path
from .views import (
    AdminReportListView,
    AdminReportDetailView,
    AdminReportUpdateView,
    AdminAnalyticsView,
    ExportReportsView,
    UserListView,
    UserUpdateView,
    UserDeleteView,
)

urlpatterns = [
    #  Report management
    path('reports/', AdminReportListView.as_view(), name='admin-report-list'),
    path('reports/<int:id>/', AdminReportDetailView.as_view(), name='admin-report-detail'),
    path('reports/<int:id>/update/', AdminReportUpdateView.as_view(), name='admin-report-update'),

    #  Analytics + Export
    path('analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('export-reports/', ExportReportsView.as_view(), name='admin-export-reports'),

    #  User management (premium only)
    path('users/', UserListView.as_view(), name='admin-user-list'),
    path('users/<int:id>/update/', UserUpdateView.as_view(), name='admin-user-update'),
    path('users/<int:id>/delete/', UserDeleteView.as_view(), name='admin-user-delete'),
]
