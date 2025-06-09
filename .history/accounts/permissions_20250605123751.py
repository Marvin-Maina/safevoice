from rest_framework.permissions import BasePermission, IsAuthenticated, AllowAny


class AllowAnyPermission(BasePermission):
    """
    Just a wrapper for AllowAny to use in custom permission configs if needed.
    """
    def has_permission(self, request, view):
        return True


class IsPremiumUser(BasePermission):
    """
    Allows access only to authenticated users with role='user' and plan='premium'.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user and
            user.is_authenticated and
            getattr(user, 'role', None) == 'user' and
            getattr(user, 'plan', None) == 'premium'
        )


class IsPremiumAdmin(BasePermission):
    """
    Allows access only to authenticated users with role='admin' and plan='premium'.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user and
            user.is_authenticated and
            getattr(user, 'role', None) == 'admin' and
            getattr(user, 'plan', None) == 'premium'
        )


class IsAnyAuthenticatedUser(BasePermission):
    """
    Allows access to any authenticated user regardless of role/plan.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated


class IsFreeOrPremiumAdmin(BasePermission):
    """
    Allows access to any authenticated user with role='admin', regardless of plan.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user and
            user.is_authenticated and
            getattr(user, 'role', None) == 'admin'
        )


class IsFreeOrPremiumUser(BasePermission):
    """
    Allows access to any authenticated user with role='user', regardless of plan.
    """
    def has_permission(self, request, view):
        user = request.user
        return (
            user and
            user.is_authenticated and
            getattr(user, 'role', None) == 'user'
        )

class IsSuperUser(BasePermission):
    """
    Allows access only to superusers.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)