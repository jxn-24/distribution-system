from rest_framework import serializers
from .models import Customer, SalesOrder, SalesOrderItem

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id", "company_name", "customer_type", "contact_person",
            "email", "phone", "address", "credit_limit", "is_active", "notes"
        ]

class SalesOrderItemSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = SalesOrderItem
        fields = [
            "id", "product", "product_sku", "product_name", "batch",
            "quantity", "quantity_reserved", "quantity_shipped",
            "unit_price", "line_total"
        ]

class SalesOrderSerializer(serializers.ModelSerializer):
    items = SalesOrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source="customer.company_name", read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = SalesOrder
        fields = [
            "id", "order_number", "customer", "customer_name", "sales_agent",
            "order_date", "status", "warehouse", "notes",
            "created_by", "total_amount", "items", "created_at"
        ]