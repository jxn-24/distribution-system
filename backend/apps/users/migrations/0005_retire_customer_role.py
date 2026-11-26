"""Retire the customer login role.

Customers are now business records only (sales.Customer), managed by staff. Any user
account that carries a customer role is deactivated, not deleted, so its history and
any link from sales.Customer.user stay intact. The role rows are kept and marked as
retired so existing assignments remain visible to admins.
"""

from django.db import migrations


RETIRED_CUSTOMER_ROLES = (
    "Customer",
    "Customer Portal",
    "Customer Portal (Wholesaler / Retailer)",
    "Retailer",
    "Wholesaler",
)
RETIRED_NOTE = "Retired: customer login accounts and the customer portal were removed."


def retire_customer_role(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    User = apps.get_model("users", "User")

    User.objects.filter(roles__name__in=RETIRED_CUSTOMER_ROLES, is_active=True).update(is_active=False)
    Role.objects.filter(name__in=RETIRED_CUSTOMER_ROLES).update(description=RETIRED_NOTE)


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0004_seed_distribution_roles"),
    ]

    operations = [
        # Not reversible on purpose: reactivating customer logins must be a deliberate
        # admin decision, so reversing only steps the migration history back.
        migrations.RunPython(retire_customer_role, migrations.RunPython.noop),
    ]
