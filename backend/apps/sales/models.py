from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal
from apps.inventory.models import Product, Warehouse, Batch, Inventory
from apps.users.models import User
from django.core.exceptions import ValidationError

class Customer(models.Model):
    CUSTOMER_TYPES = [
        ("WHOLESALER", "Wholesaler"),
        ("RETAILER", "Retailer"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="customer_profile"
    )
    account_manager = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="managed_customers",
    )
    company_name = models.CharField(max_length=200)
    customer_type = models.CharField(max_length=20, choices=CUSTOMER_TYPES, default="RETAILER")
    contact_person = models.CharField(max_length=150, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=30, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    credit_limit = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00")
    )
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["company_name"]

    def __str__(self):
        return self.company_name

class SalesOrder(models.Model):
    STATUS_CHOICES = [
        ("DRAFT", "Draft"),
        ("CONFIRMED", "Confirmed"),
        ("PAID", "Paid"),
        ("READY_TO_PACK", "Ready to Pack"),
        ("PICKING", "Picking"),
        ("PACKED", "Packed"),
        ("SHIPPED", "Shipped"),
        ("DELIVERED", "Delivered"),
        ("CANCELLED", "Cancelled"),
    ]

    order_number = models.CharField(max_length=50, unique=True)
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="sales_orders",
    )
    sales_agent = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="agent_orders",
        help_text="Optional sales agent who closed the deal",
    )
    sales_person_name = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Name of the person who closed or took the order (free text)",
    )
    order_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="DRAFT")
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.PROTECT,
        related_name="sales_orders",
        help_text="Warehouse that will fulfil this order",
    )
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sales_orders_created",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-order_date"]

    def __str__(self):
        return self.order_number

    @property
    def total_amount(self):
        return sum(item.line_total for item in self.items.all())

    def save(self, *args, **kwargs):
        old_status = None
        if self.pk:
            old_status = (
                SalesOrder.objects.filter(pk=self.pk)
                .values_list("status", flat=True)
                .first()
            )

        super().save(*args, **kwargs)

        # RESERVE: only when moving from DRAFT to CONFIRMED
        if old_status == "DRAFT" and self.status == "CONFIRMED":
            from apps.inventory.services import reserve_stock
            from apps.inventory.models import Inventory

            for item in self.items.all():
                batch = item.batch
                if batch is None:
                    rows = (
                        Inventory.objects.filter(product=item.product, warehouse=self.warehouse)
                        .order_by("batch__created_at", "id")
                    )
                    chosen = next((row for row in rows if row.quantity_available >= item.quantity), None)
                    if chosen is None:
                        raise ValidationError(f"No available stock for {item.product.sku}.")
                    batch = chosen.batch
                    item.batch = batch

                reserve_stock(
                    product=item.product,
                    warehouse=self.warehouse,
                    quantity=item.quantity,
                    batch=batch,
                    reference=self.order_number,
                    user=self.created_by,
                )
                item.quantity_reserved = item.quantity
                item.save(update_fields=["batch", "quantity_reserved"])

        # RELEASE: when cancelling an order that still holds reserved stock
        RESERVED_STATUSES = {
            "CONFIRMED",
            "PAID",
            "READY_TO_PACK",
            "PICKING",
            "PACKED",
        }
        if self.status == "CANCELLED" and old_status in RESERVED_STATUSES:
            from apps.inventory.services import release_reservation

            for item in self.items.all():
                if item.quantity_reserved <= 0:
                    continue
                release_reservation(
                    product=item.product,
                    batch=item.batch,
                    warehouse=self.warehouse,
                    quantity=item.quantity_reserved,
                    reference=self.order_number,
                    user=self.created_by,
                )
                item.quantity_reserved = 0
                item.save(update_fields=["quantity_reserved"])

                
class SalesOrderItem(models.Model):
    PRICE_TYPE_CHOICES = [
        ("WHOLESALE", "Wholesale"),
        ("RETAIL", "Retail"),
    ]
    UNIT_CHOICES = [
        ("pcs", "Pieces"),
        ("polybag", "Polybag"),
        ("bale", "Bale"),
    ]

    sales_order = models.ForeignKey(
        SalesOrder,
        on_delete=models.CASCADE,
        related_name="items"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="so_items"
    )
    batch = models.ForeignKey(
        Batch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="so_items"
    )
    price_type = models.CharField(
        max_length=20,
        choices=PRICE_TYPE_CHOICES,
        default="WHOLESALE",
    )
    entered_unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES,
        default="pcs",
        help_text="Unit the salesperson typed. Quantity is stored in pieces.",
    )
    entered_quantity = models.PositiveIntegerField(
        default=0,
        help_text="Quantity in the entered unit, before conversion.",
    )
    quantity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    quantity_reserved = models.PositiveIntegerField(default=0)
    quantity_shipped = models.PositiveIntegerField(default=0)
    unit_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
        help_text="Price per piece, KES",
    )

    class Meta:
        unique_together = ["sales_order", "product", "batch"]

    def __str__(self):
        return f"{self.sales_order.order_number} - {self.product.sku}"

    @property
    def line_total(self):
        return self.quantity * self.unit_price

    @property
    def quantity_pending(self):
        return self.quantity - self.quantity_reserved

