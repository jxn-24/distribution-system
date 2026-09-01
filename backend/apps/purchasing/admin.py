from django.contrib import admin
from .models import (Manufacturer, PurchaseOrder, PurchaseOrderItem, GoodsReceipt, GoodsReceiptItem)

@admin.register(Manufacturer)
class ManufacturerAdmin(admin.ModelAdmin):
    list_display = ("name", "country", "contact_person", "email", "phone", "is_active")
    list_filter = ("is_active", "country")
    search_fields = ("name", "contact_person", "email")

class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1
    fields = ("product", "quantity_ordered", "quantity_received", "unit_cost")

@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ("po_number", "manufacturer", "order_date", "expected_date", "status", "created_by")
    list_filter = ("status", "manufacturer", "order_date")
    search_fields = ("po_number", "manufacturer__name")
    inlines = [PurchaseOrderItemInline]
    readonly_fields = ("created_at", "updated_at")

class GoodsReceiptItemInline(admin.TabularInline):
    model = GoodsReceiptItem
    extra = 1
    fields = ("product", "batch", "location", "quantity_received", "notes")

@admin.register(GoodsReceipt)
class GoodsReceiptAdmin(admin.ModelAdmin):
    list_display = ("receipt_number", "purchase_order", "warehouse", "receipt_date", "received_by")
    list_filter = ("warehouse", "receipt_date")
    search_fields = ("receipt_number", "purchase_order__po_number")
    inlines = [GoodsReceiptItemInline]
    readonly_fields = ("created_at",)

