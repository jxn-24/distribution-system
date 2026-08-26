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
        ("box", "Box"),
        ("pack", "Pack"),
        ("carton", "Carton"),
        ("kg", "Kilogram"),
        ("liter", "Liter"),
    ]

    sku = models.CharField(max_length=50, unique=True, help_text="Unique Stock Keeping Unit")
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="products"
        )
    unit = models.CharField(
        max_length=20,
        choices=UNIT_CHOICES, 
        default="pcs")

    # Pricing
    cost_price = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    selling_price = models.DecimalField(
        max_digits=12, 
        decimal_places=2, 
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal('0.00'))]
    )

    # Tracking
    track_batches = models.BooleanField(
        default=True,
        help_text="Enable batch/lot and expiry tracking for this product."
    )
    min_stock_level = models.PositiveIntegerField(
        default=0,
        help_text="Minimum stock level before low-stock alert."
    )
    is_active = models.BooleanField(default=True)

    # Images of Products
    image = models.ImageField(
        upload_to="products/",
        blank=True,
        null=True,
        help_text="Upload an image for the product."
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
        related_name="batches"
    )
    batch_number = models.CharField(max_length=100)
    manufacture_date = models.DateField(null=True, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    quantity = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Batches"
        unique_together = ("product", "batch_number")
        ordering = ["-expiry_date"]

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

        
