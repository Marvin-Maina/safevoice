from rest_framework import viewsets, permissions, views
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from django.utils.timezone import now, timedelta
from django.db.models import Count
from django.http import HttpResponse
from .models import Report
from .serializers import ReportSerializer, ReportAnalyticsSerializer
import qrcode
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from io import BytesIO
from PIL import Image
from mimetypes import guess_type
from decouple import config
import os 
from rest_framework.permissions import IsAuthenticated


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions allowed to owners only
        if request.method in permissions.SAFE_METHODS:
            return obj.submitted_by == request.user
        # Write permissions only if owner
        return obj.submitted_by == request.user


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        return Report.objects.filter(submitted_by=self.request.user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'free':
            # Enforce 3 reports/month limit
            one_month_ago = now() - timedelta(days=30)
            recent_reports = Report.objects.filter(submitted_by=user, submitted_at__gte=one_month_ago).count()
            if recent_reports >= 3:
                raise ValidationError("Free tier limit reached: max 3 reports/month. Upgrade to premium for unlimited.")
        serializer.save(submitted_by=user)

    def perform_update(self, serializer):
        report = self.get_object()
        user = self.request.user

        # Only allow update if status is pending
        if report.status != 'pending':
            raise ValidationError("Cannot update report once it is under review or resolved.")

        # For free users, no priority flag updates allowed
        if user.plan == 'free' and serializer.validated_data.get('priority_flag', False):
            raise ValidationError("Only premium users can set priority flags.")

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        # Free users can delete only pending reports
        if user.plan == 'free' and instance.status != 'pending':
            raise ValidationError("Cannot delete reports that are under review or resolved.")

        # Premium users can delete anytime (flex)
        instance.delete()


# New premium-only analytics endpoint
class ReportAnalyticsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user. != 'premium':
            return Response({"detail": "Upgrade to premium to access analytics."}, status=403)

        user_reports = Report.objects.filter(submitted_by=user)
        total_reports = user_reports.count()
        reports_by_category = user_reports.values('category').annotate(count=Count('id'))
        reports_by_status = user_reports.values('status').annotate(count=Count('id'))
        priority_reports = user_reports.filter(priority_flag=True).count()

        category_counts = {item['category']: item['count'] for item in reports_by_category}
        status_counts = {item['status']: item['count'] for item in reports_by_status}

        data = {
            'total_reports': total_reports,
            'reports_by_category': category_counts,
            'reports_by_status': status_counts,
            'priority_reports': priority_reports,
        }

        serializer = ReportAnalyticsSerializer(data)
        return Response(serializer.data)


# New premium-only PDF certificate endpoint
class ReportCertificateView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, report_id):
        user = request.user
        try:
            report = Report.objects.get(id=report_id, submitted_by=user)
        except Report.DoesNotExist:
            return Response({"detail": "Report not found."}, status=404)

        if user.role != 'premium':
            return Response({"detail": "Only premium users can download certificates."}, status=403)

        frontend_url = config("FRONTEND_URL", default="https://yourfrontend.com")
        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        # Report details
        p.drawString(100, 750, "Report Certificate")
        p.drawString(100, 730, f"Title: {report.title}")
        p.drawString(100, 710, f"Category: {report.category}")
        p.drawString(100, 690, f"Status: {report.status}")
        p.drawString(100, 670, f"Priority: {'Yes' if report.priority_flag else 'No'}")
        p.drawString(100, 650, f"Submitted: {report.submitted_at.strftime('%Y-%m-%d %H:%M:%S')}")
        p.drawString(100, 630, f"Token: {report.token}")

        # File info
        if report.file_upload:
            filename = os.path.basename(report.file_upload.name)
            mime_type, _ = guess_type(report.file_upload.url)
            file_url = request.build_absolute_uri(report.file_upload.url)
            p.drawString(100, 610, f"Attachment: {filename}")
            p.drawString(100, 590, f"File Type: {mime_type or 'Unknown'}")
            p.drawString(100, 570, f"File URL: {file_url[:80]}")
        else:
            p.drawString(100, 610, "Attachment: None")

        # QR Code using decoupled frontend URL
        qr_data = f"{frontend_url}/reports/{report.token}/"
        qr = qrcode.make(qr_data)
       
        p.drawInlineImage(qr, 400, 650, 100, 100)

        p.showPage()
        p.save()
        buffer.seek(0)

        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename=report_{report.id}_certificate.pdf'
        return response