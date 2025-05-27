from rest_framework.permissions import BasePermission

class IsPremiumWhistleblower(BasePermission):
    """
    Custom permission to only allow premium whistleblowers to access certain views.
    """
    def has_permission(self, request, view):
        # Check if the user is authenticated and has the 'premium' role
        return request.user.is_authenticated and request.user.role == 'premium'