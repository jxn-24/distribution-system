from unittest.mock import Mock

from django.test import RequestFactory, SimpleTestCase

from apps.users.permissions import RoleAccessPermission


class RoleAccessPermissionTests(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.permission = RoleAccessPermission()
        self.view = type("View", (), {
            "action": "list",
            "role_access": {
                "read": {"Director", "Warehouse", "Customer Portal"},
                "write": {"Admin", "Warehouse"},
                "create": {"Customer Portal"},
            },
        })()

    def make_user(self, allowed):
        user = Mock()
        user.is_authenticated = True
        user.is_super_admin = False
        user.is_superuser = False
        user.roles.filter.return_value.exists.return_value = allowed
        return user

    def test_allowed_roles_can_read(self):
        request = self.factory.get("/")
        request.user = self.make_user(True)

        self.assertTrue(self.permission.has_permission(request, self.view))

    def test_role_without_access_is_denied(self):
        request = self.factory.get("/")
        request.user = self.make_user(False)

        self.assertFalse(self.permission.has_permission(request, self.view))

    def test_customer_portal_can_create_but_not_update(self):
        user = self.make_user(True)
        create_request = self.factory.post("/")
        create_request.user = user
        self.view.action = "create"

        self.assertTrue(self.permission.has_permission(create_request, self.view))

        update_request = self.factory.patch("/")
        update_request.user = user
        self.view.action = "partial_update"
        user.roles.filter.return_value.exists.return_value = False

        self.assertFalse(self.permission.has_permission(update_request, self.view))
