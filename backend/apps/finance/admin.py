from django.contrib import admin
from .models import Invoice, Receipt

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ("invoice_number", "sales_order", "customer", "invoice_date", "status", "total_amount", "amount_paid", "balance_due")
    list_filter = ("status", "invoice_date")
    search_fields = ("invoice_number", "customer__company_name", "sales_order__order_number")
    readonly_fields = ("created_at", "updated_at")

@admin.register(Receipt)
class ReceiptAdmin(admin.ModelAdmin):
    list_display = ("receipt_number", "invoice", "customer", "amount", "payment_method", "payment_date", "received_by")
    list_filter = ("payment_method", "payment_date")
    search_fields = ("receipt_number", "invoice__invoice_number", "customer__company_name", "reference")
    readonly_fields = ("created_at",)