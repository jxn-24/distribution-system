from rest_framework import serializers
from .models import Invoice, Receipt


class InvoiceSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.company_name", read_only=True)
    payment_reference = serializers.CharField(read_only=True)
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
            "payment_reference",
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
        ]
        read_only_fields = ["created_by", "created_at", "paayment_reference"]
        extra_kwargs = {
            "invoice_number": {"required": False},
            "invoice_date": {"required": False},
        }

        


class ReceiptItemSerializer(serializers.Serializer):
    product_sku = serializers.CharField()
    product_name = serializers.CharField()
    quantity = serializers.IntegerField()
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2)


class ReceiptSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source="invoice.invoice_number", read_only=True)
    order_number = serializers.CharField(source="invoice.sales_order.order_number", read_only=True)
    customer_name = serializers.CharField(source="customer.company_name", read_only=True)
    items = serializers.SerializerMethodField()

    class Meta:
        model = Receipt
        fields = [
            "id",
            "receipt_number",
            "invoice",
            "invoice_number",
            "order_number",
            "customer",
            "customer_name",
            "amount",
            "payment_method",
            "payment_date",
            "reference",
            "notes",
            "received_by",
            "created_at",
            "items",
        ]
        read_only_fields = ["receipt_number", "customer", "received_by", "created_at"]

    def get_items(self, obj):
        order = getattr(obj.invoice, "sales_order", None)
        if not order:
            return []
        rows = []
        for line in order.items.select_related("product").all():
            rows.append({
                "product_sku": line.product.sku,
                "product_name": line.product.name,
                "quantity": line.quantity,
                "unit_price": line.unit_price,
                "line_total": line.line_total,
            })
        return rows