from rest_framework.permissions import BasePermission


class IsAdminOrPremiumAdmin(BasePermission):
    """
    Allows access to users with role 'admin' regardless of plan.
    """
    message = "Admin access required."

    def has_permission(self, request, view):
        # Ensure user is authenticated and has 'admin' role
        return (
            request.user.is_authenticated and 
            request.user.role == 'admin'
        )


class IsPremiumAdmin(BasePermission):
    """
    Allows access only to users with role 'admin' and plan 'premium'.
    """
    message = "Premium Admin access required."

    def has_permission(self, request, view):
        # Ensure user is authenticated, has 'admin' role, and 'premium' plan
        return (
            request.user.is_authenticated and
            request.user.role == 'admin' and
            request.user.plan == 'premium'
        )


class IsSuperUser(BasePermission):
    """
    Allows access only to Django superusers.
    """
    message = "Superuser access required."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser
