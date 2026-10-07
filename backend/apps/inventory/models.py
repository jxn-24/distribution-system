from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
from decimal import Decimal


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    UNIT_CHOICES = [
        ("pcs", "Pieces"),
        ("pkg", "Package"),
        ("box", "Box"),
        ("pack", "Pack"),
        ("carton", "Carton"),
        ("kg", "Kilogram"),
        ("liter", "Liter"),
        ("bag", "Bag"),
    ]

    sku = models.CharField(max_length=50, unique=True, help_text="Unique Stock Keeping Unit")
    numeric_code = models.CharField(
        max_length=10,
        unique=True,
        null=True,
        blank=True,
        help_text="Digits printed on labels, e.g. 290, 240, 301, 302.",
    )
    barcode = models.CharField(max_length=100, unique=True, null=True, blank=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    packing_note = models.CharField(
        max_length=255,
        blank=True,
        help_text="How the package is packed, e.g. 8 pcs/bag, 10 bags/hookbox.",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products",
    )
    unit = models.CharField(max_length=20, choices=UNIT_CHOICES, default="pkg")

    cost_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    selling_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )

    track_batches = models.BooleanField(
        default=True,
        help_text="Enable batch/lot and expiry tracking for this product.",
    )
    min_stock_level = models.PositiveIntegerField(
        default=0,
        help_text="Minimum stock level before low-stock alert.",
    )
    is_active = models.BooleanField(default=True)
    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True,
        help_text="Upload an image for the product.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.sku} - {self.name}"


class Batch(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="batches",
    )
    batch_number = models.CharField(
        max_length=100,
        help_text="Readable lot, e.g. LS-PAD-290-061026-01.",
    )
    scan_code = models.CharField(
        max_length=20,
        unique=True,
        null=True,
        blank=True,
        help_text="Numeric arrival code on the parent label, e.g. 29006102601.",
    )
    manufacture_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    expected_quantity = models.PositiveIntegerField(
        default=0,
        help_text="Packages on the supplier document. Not the counted stock.",
    )
    quantity = models.PositiveIntegerField(
        default=0,
        help_text="Do not use this as the live balance. Inventory is the stock figure.",
    )
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Batches"
        unique_together = ("product", "batch_number")
        ordering = ["created_at", "batch_number"]

    def __str__(self):
        return f"{self.product.sku} - Batch {self.batch_number}"

    @property
    def is_expired(self):
        if self.expiry_date:
            return self.expiry_date < timezone.now().date()
        return False

    @property
    def days_to_expiry(self):
        if self.expiry_date:
            delta = self.expiry_date - timezone.now().date()
            return delta.days
        return None


class PackageUnit(models.Model):
    batch = models.ForeignKey(
        Batch,
        on_delete=models.CASCADE,
        related_name="packages",
    )
    sequence = models.PositiveIntegerField(help_text="Package number, e.g. 1 for 0001.")
    code = models.CharField(
        max_length=30,
        unique=True,
        help_text="Barcode value, e.g. 290061026010001.",
    )
    status = models.CharField(
        max_length=20,
        choices=[("IN_STOCK", "In stock"), ("SHIPPED", "Shipped")],
        default="IN_STOCK",
    )
    received_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ("batch", "sequence")
        ordering = ["sequence"]

    def __str__(self):
        return self.code


class Warehouse(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True, help_text="Short code e.g. WH-NBO")
    address = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.code} - {self.name}"


class StockLocation(models.Model):
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="locations",
    )
    name = models.CharField(max_length=50, help_text="e.g. A-01-01 or Receiving Bay")
    description = models.CharField(max_length=200, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ["warehouse", "name"]
        ordering = ["warehouse", "name"]

    def __str__(self):
        return f"{self.warehouse.code} | {self.name}"


class Inventory(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="inventory_records",
    )
    batch = models.ForeignKey(
        Batch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inventory_records",
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="inventory_records",
    )
    location = models.ForeignKey(
        StockLocation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inventory_records",
    )

    quantity_on_hand = models.PositiveIntegerField(default=0)
    quantity_reserved = models.PositiveIntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Inventory"
        unique_together = ["product", "batch", "warehouse", "location"]
        ordering = ["product__name"]

    def __str__(self):
        batch_info = f" | {self.batch.batch_number}" if self.batch else ""
        return f"{self.product.sku}{batch_info} @ {self.warehouse.code} = {self.quantity_on_hand}"

    @property
    def quantity_available(self):
        return self.quantity_on_hand - self.quantity_reserved


class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ("RECEIVE", "Receive from Supplier"),
        ("TRANSFER_IN", "Transfer In"),
        ("TRANSFER_OUT", "Transfer Out"),
        ("RESERVE", "Reserve for Order"),
        ("RELEASE", "Release Reservation"),
        ("PICK", "Pick for Order"),
        ("SHIP", "Ship to Customer"),
        ("ADJUST_IN", "Adjustment Increase"),
        ("ADJUST_OUT", "Adjustment Decrease"),
        ("RETURN", "Customer Return"),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="movements")
    batch = models.ForeignKey(
        Batch,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="movements",
    )
    warehouse = models.ForeignKey(Warehouse, on_delete=models.CASCADE, related_name="movements")
    location = models.ForeignKey(
        StockLocation,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="movements",
    )
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.PositiveIntegerField()
    reference = models.CharField(max_length=100, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        "users.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="stock_movements",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.movement_type} | {self.product.sku} | Qty: {self.quantity}"