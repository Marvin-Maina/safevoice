from django.urls import path
from .views import SubmitReportView, MyReportsView, AllReportsView

urlpatterns = [
    path('submit/', SubmitReportView.as_view(), name='submit-report'),
    path('my/', MyReportsView.as_view(), name='my-reports'),
    path('all/', AllReportsView.as_view(), name='all-reports'),  
]
