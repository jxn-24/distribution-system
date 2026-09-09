from rest_framework import serializers
from .models import Shipment, ShipmentItem

class ShipmentItemSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = ShipmentItem
        fields = ["id", "product", "product_sku", "batch", "quantity"]

class ShipmentSerializer(serializers.ModelSerializer):
    items = ShipmentItemSerializer(many=True, read_only=True)
    order_number = serializers.CharField(source="sales_order.order_number", read_only=True)
    warehouse_code = serializers.CharField(source="warehouse.code", read_only=True)

    class Meta:
        model = Shipment
        fields = [
            "id", "shipment_number", "sales_order", "order_number",
            "warehouse", "warehouse_code", "carrier", "tracking_number",
            "status", "shipped_at", "delivered_at", "notes", "items", "created_at"
        ]
        
