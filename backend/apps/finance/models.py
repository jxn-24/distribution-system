from django.db import models
from django.core.validators import MinValueValidator
from apps.sales.models import SalesOrder, Customer
from apps.users.models import User
from decimal import Decimal

class Invoice(models.Model):
    STATUS_CHOICES = [
        ("DRAFT", "Draft"),
        ("ISSUED", "Issued"),
        ("PARTIALLY_PAID", "Partially Paid"),
        ("PAID", "Paid"),
        ("CANCELLED", "Cancelled"),
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    sales_order = models.ForeignKey(
        SalesOrder,
        on_delete=models.PROTECT,
        related_name="invoices"
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="invoices"
    )
    invoice_date = models.DateField()
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="DRAFT")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="invoices_created"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-invoice_date"]

    def __str__(self):
        return self.invoice_number

    @property
    def balance_due(self):
        return self.total_amount - self.amount_paid

class Receipt(models.Model):
    PAYMENT_METHODS = [
        ("CASH", "Cash"),
        ("BANK_TRANSFER", "Bank Transfer"),
        ("MOBILE_MONEY", "Mobile Money"),
        ("CHEQUE", "Cheque"),
        ("OTHER", "Other"),
    ]

    receipt_number = models.CharField(max_length=50, unique=True)
    invoice = models.ForeignKey(
        Invoice,
        on_delete=models.PROTECT,
        related_name="receipts"
    )
    customer = models.ForeignKey(
        Customer,
        on_delete=models.PROTECT,
        related_name="receipts"
    )
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))]
    )
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default="BANK_TRANSFER")
    payment_date = models.DateField()
    reference = models.CharField(max_length=100, blank=True, null=True, help_text="Transaction ID or cheque number")
    notes = models.TextField(blank=True, null=True)
    received_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="receipts_received"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-payment_date"]

    def __str__(self):
        return self.receipt_number