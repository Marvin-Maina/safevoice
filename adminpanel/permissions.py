from rest_framework.permissions import BasePermission

class IsAdminOrPremiumAdmin(BasePermission):
    """
    Allows access to users with role 'admin' regardless of plan.
    """
    message = "Admin access required."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsPremiumAdmin(BasePermission):
    """
    Allows access only to users with role 'admin' and plan 'premium'.
    """
    message = "Premium Admin access required."

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role == 'admin' and
            request.user.plan == 'premium'
        )
8