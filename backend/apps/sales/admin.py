from django.contrib import admin
from .models import Customer, SalesOrder, SalesOrderItem


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ("company_name", "customer_type", "contact_person", "email", "phone", "is_active")
    list_filter = ("customer_type", "is_active")
    search_fields = ("company_name", "contact_person", "email")

class SalesOrderItemInline(admin.TabularInline):
    model = SalesOrderItem
    extra = 1
    fields = ("product", "batch", "quantity", "quantity_reserved", "quantity_shipped", "unit_price")

@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ("order_number", "customer", "order_date", "status", "warehouse", "sales_agent", "created_by")
    list_filter = ("status", "warehouse", "order_date")
    search_fields = ("order_number", "customer__company_name")
    inlines = [SalesOrderItemInline]
    readonly_fields = ("created_at", "updated_at")
