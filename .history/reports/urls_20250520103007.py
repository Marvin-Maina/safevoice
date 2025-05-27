
from django.urls import path
from .views import SubmitReportView, MyReportsView, AllReportsView

urlpatterns = [
    path('reports/submit/', SubmitReportView.as_view(), name='submit-report'),
    path('reports/my/', MyReportsView.as_view(), name='my-reports'),
    path('reports/all/', AllReportsView.as_view(), name='all-reports'),
]
