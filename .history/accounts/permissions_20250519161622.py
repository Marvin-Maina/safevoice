from rest_framework.permissions import BasePermission

class IsPremiumWhistleblower(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
                request.user.user_type == 'whistleblower' and \
                request.user.role == 'premium'
                
class IsPremiumOrg(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and \
                request.user.user_type == 'organization' a
        # Check if the user is authenticated and has the 'premium_whistleblower' role
    