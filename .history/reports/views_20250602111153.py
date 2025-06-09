from rest_framework import viewsets, permissions, views, status
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
from mimetypes import guess_type
from decouple import config
import os
from rest_framework.permissions import IsAuthenticated # Ensure users are authenticated

class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated] # Changed back to IsAuthenticated

    def get_queryset(self):
        user = self.request.user
        if user.is_authenticated and user.role == 'admin':
            return Report.objects.all() # Admins can view all reports
        return Report.objects.filter(submitted_by=user) # Regular users view only their reports

    def perform_create(self, serializer):
        user = self.request.user
        # Re-introduce free tier limit logic as reports are now linked to users
        if user.plan == 'free':
            one_month_ago = now() - timedelta(days=30)
            recent_reports = Report.objects.filter(submitted_by=user, submitted_at__gte=one_month_ago).count()
            if recent_reports >= 3:
                raise ValidationError("Free tier limit reached: max 3 reports/month. Upgrade to premium for unlimited.")
        serializer.save(submitted_by=user) # Link report to the logged-in user

    def perform_update(self, serializer):
        report = self.get_object()
        user = self.request.user
        # Only the submitting user or an admin can update
        if report.submitted_by != user and user.role != 'admin':
            raise ValidationError("You do not have permission to update this report.")
        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        # Only the submitting user or an admin can delete
        if instance.submitted_by != user and user.role != 'admin':
            raise ValidationError("You do not have permission to delete this report.")
        instance.delete()


from reportlab.lib.utils import ImageReader # Import ImageReader for QR code

class ReportCertificateView(views.APIView):
    permission_classes = [permissions.AllowAny] # Certificates can be viewed publicly by token

    def get(self, request, token):
        try:
            report = Report.objects.get(token=token)
        except Report.DoesNotExist:
            return Response({"error": "Report not found or invalid token."}, status=status.HTTP_404_NOT_FOUND)

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        p.drawString(100, 750, "Report Certificate")
        p.drawString(100, 730, f"Title: {report.title}")
        p.drawString(100, 710, f"Category: {report.category}")
        p.drawString(100, 690, f"Status: {report.status}")
        p.drawString(100, 670, f"Priority: {'Yes' if report.priority_flag else 'No'}")
        p.drawString(100, 650, f"Submitted: {report.submitted_at.strftime('%Y-%m-%d %H:%M:%S')}")
        p.drawString(100, 630, f"Token: {report.token}")

        # Generate QR Code
        qr_data = report.get_certificate_qr_data()
        img = qrcode.make(qr_data)
        img_buffer = BytesIO()
        img.save(img_buffer, format="PNG")
        img_buffer.seek(0)
        p.drawImage(ImageReader(img_buffer), 400, 600, width=100, height=100) # Adjust position as needed

        if report.file_upload:
            filename = os.path.basename(report.file_upload.name)
            mime_type, _ = guess_type(report.file_upload.url)
            file_url = request.build_absolute_uri(report.file_upload.url)
            p.drawString(100, 610, f"Attachment: {filename}")
            p.drawString(100, 590, f"File Type: {mime_type or 'Unknown'}")
            p.drawString(100, 570, f"File URL: {file_url[:80]}{'...' if len(file_url) > 80 else ''}")

        p.showPage()
        p.save()
        buffer.seek(0)
        return HttpResponse(buffer, content_type='application/pdf')


class ReportAnalyticsView(views.APIView):
    permission_classes = [IsAuthenticated] # Only authenticated users (admins) can view analytics

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"error": "Admins only."}, status=status.HTTP_403_FORBIDDEN)

        total_reports = Report.objects.count()
        reports_by_category = Report.objects.values('category').annotate(count=Count('category'))
        reports_by_status = Report.objects.values('status').annotate(count=Count('status'))
        reports_by_priority = Report.objects.values('priority_flag').annotate(count=Count('priority_flag'))

        # Convert to dictionary for serializer
        reports_by_category_dict = {item['category']: item['count'] for item in reports_by_category}
        reports_by_status_dict = {item['status']: item['count'] for item in reports_by_status}
        reports_by_priority_dict = {str(item['priority_flag']): item['count'] for item in reports_by_priority}

        data = {
            "total_reports": total_reports,
            "reports_by_category": reports_by_category_dict,
            "reports_by_status": reports_by_status_dict,
            "reports_by_priority": reports_by_priority_dict,
        }

        serializer = ReportAnalyticsSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)