from rest_framework.routers import DefaultRouter
from accounts.urls import urlpatterns as   accounts_urls
from reports.urls import urlpatterns as reports_urls
from adminpanel.urls import urlpatterns as adminpanel_urls
from django.urls import path, include

router = DefaultRouter()

router.register
