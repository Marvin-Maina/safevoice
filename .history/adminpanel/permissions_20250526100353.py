from rest_framework.permissions import BasePermission

# Constants for roles (less error-prone, easier to reuse)
ADMIN = 'admin'
PREMIUM_ADMIN = 'premium_admin'

class IsAdminOrPremiumAdmin(BasePermission):
    """
    Allows access to users with either 'admin' or 'premium_admin' role.
    """
    message = "Admin or Premium Admin access required."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in [ADMIN, PREMIUM_ADMIN]


class IsPremiumAdminOnly(BasePermission):
    """
    Allows access only to users with the 'premium_admin' role.
    """
    message = "Premium Admin access required."

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == PREMIUM_ADMIN
