from django.db import migrations


ROLE_NAMES = [
    "Super Admin",
    "Director",
    "Admin",
    "Warehouse",
    "Sales / Account Managers",
    "Sales Agent",
    "Finance",
    "Customer Portal (Wholesaler / Retailer)",
    "Manufacturer Portal",
]


def create_roles(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    for name in ROLE_NAMES:
        Role.objects.get_or_create(name=name)


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0003_rename_role_user_roles"),
    ]

    operations = [
        migrations.RunPython(create_roles, migrations.RunPython.noop),
    ]