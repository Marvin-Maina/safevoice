from rest_framework.permissions import BasePermission

class IsAdminOrPremiumAdmin(BasePermission):
    def has