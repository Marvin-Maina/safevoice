from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from django.utils.timezone import now, timedelta
from .models import Report
from .serializers import ReportSerializer

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
        serializer.save(submitted_by=user, is_anonymous=False)

    def perform_update(self, serializer):
        report = self.get_object()
        user = self.request.user

        # Only allow update if status is pending
        if report.status != 'pending':
            raise ValidationError("Cannot update report once it is under review or resolved.")

        # For free users, no priority flag updates allowed
        if user.role == 'free' and serializer.validated_data.get('priority_flag', False):
            raise ValidationError("Only premium users can set priority flags.")

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user

        # Free users can delete only pending reports
        if user.tier == 'free' and instance.status != 'pending':
            raise ValidationError("Cannot delete reports that are under review or resolved.")

        # Premium users can delete anytime (flex)
        instance.delete()
