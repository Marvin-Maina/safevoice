from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Report
from .serializers import ReportSerializer

class SubmitReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ReportSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Report submitted successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MyReportsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        reports = Report.objects.filter(submitted_by=request.user)
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)

from rest_framework.permissions import IsAdminUser

class AllReportsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        reports = Report.objects.all()
        serializer = ReportSerializer(reports, many=True)
        return Response(serializer.data)
