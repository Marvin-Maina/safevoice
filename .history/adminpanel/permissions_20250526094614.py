from rest_framework.permissions import BasePermission

class IsAdminOrPremiumAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.role in ['admin', 'premium_admin']
            
        )
        
class IsPremiumAdminOnly(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'premium_admin'