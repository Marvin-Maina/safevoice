from rest_framework.permissions import BasePermission

class IsPremiumWhistleblower(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_premium() and request.user.is_whistleblower()
        # Check if the user is authenticated and has the 'premium_whistleblower' role
    