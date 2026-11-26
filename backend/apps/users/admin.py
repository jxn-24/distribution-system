from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import AdminUserCreationForm, UserChangeForm
from .models import RETIRED_CUSTOMER_ROLES, User, Role


class NoRetiredRolesMixin:
    """Refuse to add a retired customer role; roles a user already has are left alone."""

    def clean_roles(self):
        roles = self.cleaned_data.get("roles")
        if roles is None:
            return roles
        existing = set(self.instance.roles.values_list("pk", flat=True)) if self.instance.pk else set()
        added = [role.name for role in roles if role.name in RETIRED_CUSTOMER_ROLES and role.pk not in existing]
        if added:
            raise forms.ValidationError(
                "Customer login roles are retired and cannot be assigned: " + ", ".join(added)
            )
        return roles


class StaffChangeForm(NoRetiredRolesMixin, UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = User


class StaffCreationForm(NoRetiredRolesMixin, AdminUserCreationForm):
    class Meta(AdminUserCreationForm.Meta):
        model = User

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description")
    search_fields = ("name",)
    

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    form = StaffChangeForm
    add_form = StaffCreationForm
    list_display = ("id", "username", "email", "is_active", "is_staff")
    list_filter = ("is_active", "is_staff", "roles")
    search_fields = ("username", "email")
    filter_horizontal = ("roles", "groups", "user_permissions")

    fieldsets = BaseUserAdmin.fieldsets + (
        ("Additional Info", {
            "fields": ("phone", "roles"),
        }),
    )

    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ("Additional Info", {
            "fields": ("phone", "roles"),
        }),
    )

    def has_add_permission(self, request):
        # Staff accounts can only be created by a Super Admin or an Admin.
        return request.user.is_active and request.user.is_admin_user and super().has_add_permission(request)
