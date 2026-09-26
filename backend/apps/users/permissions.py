from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_super_admin

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin_user

class IsDirector(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_director

class IsWarehouseUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_warehouse or request.user.is_admin_user
        )

class IsSalesUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_sales or request.user.is_admin_user
        )

class IsFinanceUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_finance or request.user.is_admin_user
        )

class IsSalesAgent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_sales_agent or request.user.is_admin_user
        )

class IsCustomerUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_customer

class ReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in SAFE_METHODS

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.is_admin_user


class RoleAccessPermission(BasePermission):
    """Enforce role lists declared by a view as ``read`` and ``write`` access."""

    message = "Your role does not have access to this action."

    def has_permission(self, request, view):
        user = request.user
        if not user.is_authenticated:
            return False

        if user.is_super_admin or user.is_superuser:
            return True

        access = getattr(view, "role_access", {})
        action = getattr(view, "action", None)
        access_type = "read" if request.method in SAFE_METHODS else "write"
        allowed_roles = access.get(action, access.get(access_type, set()))
        return user.roles.filter(name__in=allowed_roles).exists()