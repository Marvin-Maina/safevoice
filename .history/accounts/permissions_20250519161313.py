from rest_framework.permissions import BasePermission

class IsPremiumWhistleblower(BasePermission):
    def has_permission(self, request, view):
        return requ
        # Check if the user is authenticated and has the 'premium_whistleblower' role
    