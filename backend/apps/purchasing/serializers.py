from rest_framework import serializers
from .models import Manufacturer, PurchaseOrder, PurchaseOrderItem, GoodsReceipt, GoodsReceiptItem

class ManufacturerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Manufacturer
        fields = [
            "id", "name", "country", "contact_person", "email",
            "phone", "address", "is_active", "notes"
        ]

class PurchaseOrderItemSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = PurchaseOrderItem
        fields = [
            "id", "product", "product_sku", "product_name",
            "quantity_ordered", "quantity_received", "unit_cost", "line_total"
        ]

class PurchaseOrderSerializer(serializers.ModelSerializer):
    items = PurchaseOrderItemSerializer(many=True, read_only=True)
    manufacturer_name = serializers.CharField(source="manufacturer.name", read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = [
            "id", "po_number", "manufacturer", "manufacturer_name",
            "order_date", "expected_date", "status", "notes",
            "created_by", "total_amount", "items", "created_at"
        ]

class GoodsReceiptItemSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source="product.sku", read_only=True)

    class Meta:
        model = GoodsReceiptItem
        fields = ["id", "product", "product_sku", "batch", "location", "quantity_received", "notes"]

class GoodsReceiptSerializer(serializers.ModelSerializer):
    items = GoodsReceiptItemSerializer(many=True, read_only=True)
    po_number = serializers.CharField(source="purchase_order.po_number", read_only=True)

    class Meta:
        model = GoodsReceipt
        fields = [
            "id", "receipt_number", "purchase_order", "po_number",
            "warehouse", "receipt_date", "received_by", "notes", "items", "created_at"
        ]