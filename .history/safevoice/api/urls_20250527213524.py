from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/accounts/', include('accounts.urls')),      # JWT auth, profile
    path('api/reports/', include('reports.urls')),        # ReportViewSet + extras
    path('api/adminpanel/', include('adminpanel.urls')),  # Admin-level report/user mgmt
]

# Serve media files in dev
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
