from rest_framework import serializers
from .models import Invoice, Receipt


class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    order_number = serializers.CharField(
        source="sales_order.order_number", read_only=True
    )
    balance_due = serializers.DecimalField(
        max_digits=12, decimal_places=2, read_only=True
    )

    class Meta:
        model = Invoice
        fields = [
            "id",
            "invoice_number",
            "sales_order",
            "order_number",
            "customer",
            "customer_name",
            "invoice_date",
            "due_date",
            "status",
            "subtotal",
            "tax_amount",
            "total_amount",
            "amount_paid",
            "balance_due",
            "notes",
            "created_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]


class ReceiptSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(
        source="invoice.invoice_number", read_only=True
    )
    customer_name = serializers.CharField(source="customer.name", read_only=True)

    class Meta:
        model = Receipt
        fields = [
            "id",
            "receipt_number",
            "invoice",
            "invoice_number",
            "customer",
            "customer_name",
            "amount",
            "payment_method",
            "payment_date",
            "reference",
            "received_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]