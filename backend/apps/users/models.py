from django.db import models
from django.contrib.auth.models import AbstractUser


class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    roles = models.ManyToManyField(Role, blank=True, related_name="users")
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    def __str__(self):
        return self.email or self.username

    def has_role(self, role_name: str) -> bool:
        return self.roles.filter(name=role_name).exists()

    @property
    def is_super_admin(self) -> bool:
        return self.has_role("Super Admin")

    @property
    def is_admin_user(self) -> bool:
        return self.has_role("Admin") or self.is_super_admin

    @property
    def is_director(self) -> bool:
        return self.has_role("Director")

    @property
    def is_warehouse(self) -> bool:
        return self.has_role("Warehouse")

    @property
    def is_sales(self) -> bool:
        return self.has_role("Sales")

    @property
    def is_finance(self) -> bool:
        return self.has_role("Finance") 

    @property
    def is_sales_agent(self) -> bool:
        return self.has_role("Sales Agent")

    @property
    def is_customer(self) -> bool:
        return self.has_role("Customer")    