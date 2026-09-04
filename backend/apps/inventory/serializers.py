from rest_framework import serializers
from .models import Category, Product, Batch, Warehouse, StockLocation, Inventory, StockMovement

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "description", "is_active"]

class BatchSerializer(serializers.ModelSerializer):
    is_expired = serializers.BooleanField(read_only=True)

    class Meta:
        model = Batch
        fields = [
            "id", "product", "batch_number", "manufacture_date",
            "expiry_date", "quantity", "notes", "is_expired"
        ]

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    batches = BatchSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "sku", "name", "description", "category", "category_name",
            "unit", "cost_price", "selling_price", "track_batches",
            "min_stock_level", "is_active", "image", "batches"
        ]

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ["id", "name", "code", "address", "is_active"]

class StockLocationSerializer(serializers.ModelSerializer):
    warehouse_name = serializers.CharField(source="warehouse.name", read_only=True)

    class Meta:
        model = StockLocation
        fields = ["id", "warehouse", "warehouse_name", "name", "description", "is_active"]

class InventorySerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    product_name = serializers.CharField(source="product.name", read_only=True)
    batch_number = serializers.CharField(source="batch.batch_number", read_only=True)
    warehouse_code = serializers.CharField(source="warehouse.code", read_only=True)
    quantity_available = serializers.IntegerField(read_only=True)

    class Meta:
        model = Inventory
        fields = [
            "id", "product", "product_sku", "product_name", "batch", "batch_number",
            "warehouse", "warehouse_code", "location",
            "quantity_on_hand", "quantity_reserved", "quantity_available", "updated_at"
        ]

class StockMovementSerializer(serializers.ModelSerializer):
    product_sku = serializers.CharField(source="product.sku", read_only=True)
    created_by_name = serializers.CharField(source="created_by.username", read_only=True)

    class Meta:
        model = StockMovement
        fields = [
            "id", "product", "product_sku", "batch", "warehouse", "location",
            "movement_type", "quantity", "reference", "notes",
            "created_by", "created_by_name", "created_at"
        ]
        