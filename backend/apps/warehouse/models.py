from django.db import models
from apps.sales.models import SalesOrder, SalesOrderItem
from apps.inventory.models import Product, Batch, Warehouse
from apps.users.models import User

class Shipment(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("IN_TRANSIT", "In Transit"),
        ("DELIVERED", "Delivered"),
        ("CANCELLED", "Cancelled"),
    ]

    shipment_number = models.CharField(max_length=50, unique=True)
    sales_order = models.ForeignKey(
        SalesOrder,
        on_delete=models.PROTECT,
        related_name="shipments"
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.PROTECT,
        related_name="shipments"
    )
    carrier = models.CharField(max_length=100, blank=True, null=True)
    tracking_number = models.CharField(max_length=100, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="shipments_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.shipment_number

class ShipmentItem(models.Model):
    shipment = models.ForeignKey(
        Shipment,
        on_delete=models.CASCADE,
        related_name="items"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="shipment_items"
    )
    batch = models.ForeignKey(
        Batch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="shipment_items"
    )
    quantity = models.PositiveIntegerField()
    sales_order_item = models.ForeignKey(
        SalesOrderItem,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="shipment_items"
    )

    def __str__(self):
        return f"{self.shipment.shipment_number} - {self.product.sku}"