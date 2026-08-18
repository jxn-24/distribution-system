from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Role

@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "description")
    search_fields = ("name",)
    

@admin.register(User)
class UserAdmin(BaseUserAdmin):
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

    

