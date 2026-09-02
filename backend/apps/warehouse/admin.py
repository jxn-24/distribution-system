from django.contrib import admin
from .models import Shipment, ShipmentItem

class ShipmentItemInline(admin.TabularInline):
    model = ShipmentItem
    extra = 1
    fields = ("product", "batch", "quantity", "sales_order_item")

@admin.register(Shipment)
class ShipmentAdmin(admin.ModelAdmin):
    list_display = ("shipment_number", "sales_order", "warehouse", "carrier", "tracking_number", "status", "shipped_at")
    list_filter = ("status", "warehouse", "shipped_at")
    search_fields = ("shipment_number", "tracking_number", "sales_order__order_number")
    inlines = [ShipmentItemInline]
    readonly_fields = ("created_at", "updated_at")
