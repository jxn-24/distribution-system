import importlib
from unittest.mock import Mock

from django.apps import apps as global_apps
from django.contrib.admin.sites import AdminSite
from django.contrib.auth.models import Permission
from django.core.cache import cache
from django.test import RequestFactory, SimpleTestCase, TestCase, override_settings
from django.urls import Resolver404, resolve
from rest_framework.test import APIClient

from apps.sales.models import Customer
from apps.users.admin import StaffCreationForm, UserAdmin
from apps.users.models import Role, User
from apps.users.permissions import RoleAccessPermission

LOGIN_URL = "/api/auth/login/"


class RoleAccessPermissionTests(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.permission = RoleAccessPermission()
        self.view = type("View", (), {
            "action": "list",
            "role_access": {
                "read": {"Director", "Warehouse", "Sales Agent"},
                "write": {"Admin", "Warehouse"},
                "create": {"Sales Agent"},
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

    def test_action_specific_role_can_create_but_not_update(self):
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


class LoginTestCase(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = User.objects.create_user(username="clerk", password="right-password")
        self.user.roles.add(Role.objects.get_or_create(name="Sales")[0])

    def login(self, password, ip="10.0.0.1", username="clerk"):
        return self.client.post(
            LOGIN_URL, {"username": username, "password": password}, format="json", REMOTE_ADDR=ip
        )


class LoginRateLimitTests(LoginTestCase):
    def test_staff_can_log_in(self):
        response = self.login("right-password")
        self.assertEqual(response.status_code, 200)
        self.assertIn("access", response.data)

    def test_sixth_attempt_in_a_minute_from_one_ip_is_throttled(self):
        # Different usernames each time so the per-username lockout is not what trips.
        for n in range(5):
            self.assertNotEqual(self.login("wrong", username=f"nobody{n}").status_code, 429)
        self.assertEqual(self.login("right-password").status_code, 429)

    def test_throttle_is_per_ip(self):
        for n in range(5):
            self.login("wrong", username=f"nobody{n}", ip="10.0.0.9")
        self.assertEqual(self.login("right-password", ip="10.0.0.2").status_code, 200)


class LoginLockoutTests(LoginTestCase):
    # Each attempt comes from a different IP so the per-IP throttle stays out of the way.
    def fail(self, times):
        return [self.login("wrong", ip=f"10.1.0.{n}") for n in range(times)]

    def test_account_locks_after_five_failures_and_refuses_right_password(self):
        responses = self.fail(5)
        self.assertEqual([r.status_code for r in responses[:4]], [400] * 4)
        self.assertEqual(responses[4].status_code, 429)
        self.assertIn("Retry-After", responses[4])

        locked = self.login("right-password", ip="10.2.0.1")
        self.assertEqual(locked.status_code, 429)
        self.assertNotIn("access", locked.data)

    def test_successful_login_resets_failure_count(self):
        self.fail(4)
        self.assertEqual(self.login("right-password", ip="10.2.0.1").status_code, 200)
        self.fail(4)
        self.assertEqual(self.login("right-password", ip="10.2.0.2").status_code, 200)

    def test_lockout_ignores_username_case(self):
        for n in range(5):
            self.login("wrong", ip=f"10.3.0.{n}", username="CLERK")
        self.assertEqual(self.login("right-password", ip="10.2.0.1").status_code, 429)

    @override_settings(LOGIN_LOCKOUT_DURATION=0)
    def test_lock_expires(self):
        self.fail(5)
        self.assertEqual(self.login("right-password", ip="10.2.0.1").status_code, 200)


class CustomerRoleRetiredTests(TestCase):
    def setUp(self):
        cache.clear()
        self.customer_role = Role.objects.get_or_create(name="Customer")[0]
        self.portal_user = User.objects.create_user(username="shopkeeper", password="pw-123456")
        self.portal_user.roles.add(self.customer_role)
        self.record = Customer.objects.create(company_name="Corner Shop", user=self.portal_user)
        self.staff = User.objects.create_user(username="seller", password="pw-123456")
        self.staff.roles.add(Role.objects.get_or_create(name="Sales")[0])

    def test_migration_deactivates_customer_users_without_deleting_data(self):
        migration = importlib.import_module("apps.users.migrations.0005_retire_customer_role")
        migration.retire_customer_role(global_apps, None)

        self.portal_user.refresh_from_db()
        self.staff.refresh_from_db()
        self.record.refresh_from_db()
        self.assertFalse(self.portal_user.is_active)
        self.assertTrue(self.portal_user.roles.filter(name="Customer").exists())
        self.assertTrue(self.staff.is_active)
        self.assertEqual(self.record.user, self.portal_user)
        self.assertTrue(Role.objects.filter(name="Customer").exists())

    def test_customer_record_does_not_need_a_user(self):
        record = Customer.objects.create(company_name="Walk-in Wholesaler")
        self.assertIsNone(record.user)

    def test_active_customer_role_user_cannot_log_in(self):
        response = APIClient().post(
            LOGIN_URL, {"username": "shopkeeper", "password": "pw-123456"}, format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertNotIn("access", response.data)

    def test_customer_role_has_no_api_access(self):
        client = APIClient()
        client.force_authenticate(self.portal_user)
        for url in (
            "/api/sales/sales-orders/",
            "/api/sales/customers/",
            "/api/finance/invoices/",
            "/api/finance/receipts/",
            "/api/warehouse/shipments/",
            "/api/inventory/categories/",
            "/api/inventory/batches/",
            "/api/inventory/locations/",
        ):
            self.assertEqual(client.get(url).status_code, 403, url)

    def test_there_is_no_public_registration_endpoint(self):
        for path in ("/api/auth/register/", "/api/auth/signup/", "/api/auth/users/"):
            with self.assertRaises(Resolver404):
                resolve(path)

    def test_admin_cannot_assign_retired_customer_role(self):
        admin_user = User.objects.create_superuser(username="boss", password="pw")
        request = RequestFactory().get("/admin/users/user/add/")
        request.user = admin_user
        form_class = UserAdmin(User, AdminSite()).get_form(request, None)
        self.assertTrue(issubclass(form_class, StaffCreationForm))
        form = form_class(data={
            "username": "newperson",
            "password1": "a-Long-pass-9981",
            "password2": "a-Long-pass-9981",
            "usable_password": "true",
            "roles": [self.customer_role.pk],
        })
        self.assertFalse(form.is_valid())
        self.assertIn("roles", form.errors)


class StaffCreationPermissionTests(TestCase):
    def setUp(self):
        self.model_admin = UserAdmin(User, AdminSite())
        self.factory = RequestFactory()
        self.add_user = Permission.objects.get(codename="add_user")

    def request_as(self, *role_names, superuser=False):
        user = User.objects.create_user(
            username="-".join(role_names) or "superuser", password="pw", is_staff=True, is_superuser=superuser
        )
        user.user_permissions.add(self.add_user)
        for name in role_names:
            user.roles.add(Role.objects.get_or_create(name=name)[0])
        request = self.factory.get("/admin/users/user/add/")
        request.user = User.objects.get(pk=user.pk)
        return request

    def test_super_admin_and_admin_can_create_staff(self):
        self.assertTrue(self.model_admin.has_add_permission(self.request_as("Super Admin")))
        self.assertTrue(self.model_admin.has_add_permission(self.request_as("Admin")))

    def test_other_staff_cannot_create_staff_even_with_django_permission(self):
        for role in ("Director", "Finance", "Sales", "Warehouse"):
            self.assertFalse(self.model_admin.has_add_permission(self.request_as(role)), role)
