from mimetypes import guess_type
import os
from decouple import config
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from rest_framework import views
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import HttpResponse
from io import BytesIO
import qrcode
from .models import Report

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
        qr_buffer = BytesIO()
        qr.save(qr_buffer)
        qr_buffer.seek(0)
        p.drawInlineImage(qr_buffer, 400, 650, 100, 100)

        p.showPage()
        p.save()
        buffer.seek(0)

        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename=report_{report.id}_certificate.pdf'
        return response
