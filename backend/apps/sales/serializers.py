from rest_framework import serializers
from django.utils import timezone
from uuid import uuid4
from .models import Customer, SalesOrder, SalesOrderItem

class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            "id", "company_name", "customer_type", "contact_person",
            "email", "phone", "address", "credit_limit", "is_active", "notes",
            "account_manager",
        ]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and (request.user.is_customer or request.user.is_sales_agent or request.user.is_sales):
            fields.pop("credit_limit", None)
            fields.pop("notes", None)
        if request and (request.user.is_customer or request.user.is_sales_agent):
            fields.pop("account_manager", None)
        return fields

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
        read_only_fields = ["quantity_reserved", "quantity_shipped", "line_total"]

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and (request.user.is_customer or request.user.is_sales_agent):
            fields["unit_price"].read_only = True
        return fields

class SalesOrderSerializer(serializers.ModelSerializer):
    items = SalesOrderItemSerializer(many=True, required=False)
    customer_name = serializers.CharField(source="customer.company_name", read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    def get_fields(self):
        fields = super().get_fields()
        request = self.context.get("request")
        if request and request.user.is_customer:
            fields.pop("created_by", None)
            fields["sales_agent"].read_only = True
            fields["order_number"].required = False
            fields["order_number"].read_only = True
            fields["order_date"].required = False
            fields["status"].read_only = True
            fields["customer"].required = False
        return fields

    def validate(self, attrs):
        request = self.context.get("request")
        if request and request.user.is_customer and not attrs.get("items"):
            raise serializers.ValidationError({"items": "Add at least one product to your order."})
        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        validated_data.setdefault(
            "order_number",
            f"SO-{timezone.localdate():%Y%m%d}-{uuid4().hex[:8].upper()}",
        )
        validated_data.setdefault("order_date", timezone.localdate())
        request = self.context.get("request")
        is_customer_order = request and (request.user.is_customer or request.user.is_sales_agent)
        order = SalesOrder.objects.create(**validated_data)
        for item_data in items_data:
            product = item_data["product"]
            if is_customer_order:
                item_data["unit_price"] = product.selling_price
            SalesOrderItem.objects.create(sales_order=order, **item_data)
        return order

    class Meta:
        model = SalesOrder
        fields = [
            "id", "order_number", "customer", "customer_name", "sales_agent",
            "order_date", "status", "warehouse", "notes",
            "created_by", "total_amount", "items", "created_at"
        ]
        read_only_fields = ["created_by", "created_at"]