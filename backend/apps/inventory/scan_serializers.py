from rest_framework import serializers

from .models import Batch, Product, StockLocation, Warehouse


class StockScanSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=100, trim_whitespace=True)
    quantity = serializers.IntegerField(min_value=1)
    warehouse = serializers.PrimaryKeyRelatedField(queryset=Warehouse.objects.filter(is_active=True))
    location = serializers.PrimaryKeyRelatedField(
        queryset=StockLocation.objects.filter(is_active=True), required=False, allow_null=True
    )
    batch = serializers.PrimaryKeyRelatedField(queryset=Batch.objects.all(), required=False, allow_null=True)
    reference = serializers.CharField(max_length=100, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    movement_type = serializers.ChoiceField(
        choices=["RECEIVE", "ADJUST_IN", "PICK", "SHIP", "ADJUST_OUT"], required=False
    )

    def validate(self, attrs):
        direction = self.context["direction"]
        movement_type = attrs.get("movement_type")
        inbound_types = {"RECEIVE", "ADJUST_IN"}
        if movement_type and ((direction == "in") != (movement_type in inbound_types)):
            raise serializers.ValidationError({"movement_type": "Movement type does not match scan direction."})

        location = attrs.get("location")
        if location and location.warehouse_id != attrs["warehouse"].id:
            raise serializers.ValidationError({"location": "Location must belong to the selected warehouse."})

        product = Product.objects.filter(is_active=True, sku__iexact=attrs["code"]).only("id", "track_batches").first()
        if product is None:
            product = Product.objects.filter(is_active=True, barcode__iexact=attrs["code"]).only("id", "track_batches").first()
        batch = attrs.get("batch")
        if batch and product and batch.product_id != product.id:
            raise serializers.ValidationError({"batch": "The selected batch does not belong to this product."})
        if product and product.track_batches and not batch:
            raise serializers.ValidationError({"batch": "Select a batch for this batch-tracked product."})

        return attrs
