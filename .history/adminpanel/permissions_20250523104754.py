from rest_framework.permissions import BasePermission

class IsAdminOrPremiumAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role == 'admin' and request.user.plan in ['free', 'premium']
        )
