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