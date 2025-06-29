from rest_framework.permissions import BasePermission
from
class IsPremiumUser(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'user' and
            request.user.plan == 'premium'
        )

class IsPremiumAdmin(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'admin' and
            request.user.plan == 'premium'
        )

class AdminPlanUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['plan']  # Only allow plan to be updated
