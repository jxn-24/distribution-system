from rest_framework import serializers
from .models import Invoice, Receipt


class InvoiceSerializer(serializers.ModelSerializer):
    balance_due = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            "id", "invoice_number", "sales_order", "customer", "invoice_date",
            "due_date", "status", "subtotal", "tax_amount", "total_amount",
            "amount_paid", "balance_due", "notes", "created_by", "created_at",
        ]
        read_only_fields = ["created_by", "created_at"]


class ReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Receipt
        fields = [
            "id", "receipt_number", "invoice", "customer", "amount",
            "payment_method", "payment_date", "reference", "notes",
            "received_by", "created_at",
        ]
        read_only_fields = ["received_by", "created_at"]
