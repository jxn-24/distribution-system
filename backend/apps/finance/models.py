from django.db import models
from django.core.validators import MinValueValidator
from apps.sales.models import SalesOrder, Customer
from apps.users.models import User
from decimal import Decimal
from django.db.models import Sum

class Invoice(models.Model):
    STATUS_CHOICES = [
        ("DRAFT", "Draft"),
        ("ISSUED", "Issued"),
        ("PARTIALLY_PAID", "Partially Paid"),
        ("PAID", "Paid"),
        ("CANCELLED", "Cancelled"),
    ]

    invoice_number = models.CharField(max_length=50, unique=True)
    payment_reference = models.CharField(
    max_length=30,
    unique=True,
    blank=True,
    null=True,
    help_text="Account number the customer enters on Co-op paybill.",
    )
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

    def save(self, *args, **kwargs):

        if self.sales_order_id and (
            self.total_amount is None or self.total_amount == 0
        ):
            order_total = self.sales_order.total_amount or Decimal("0.00")
            self.subtotal = order_total
            self.total_amount = order_total
            if not self.customer_id and self.sales_order.customer_id:
                self.customer = self.sales_order.customer

        super().save(*args, **kwargs)
    def save(self, *args, **kwargs):
        if not self.payment_reference:
            last = Invoice.objects.order_by("-id").first()
            next_number = (last.id + 1) if last else 1
            self.payment_reference = f"LSE-INV-{next_number:05d}"
        super().save(*args, **kwargs)

class Receipt(models.Model):
    PAYMENT_METHODS = [
        ("CASH", "Cash"),
        ("PAYBILL", "Co-op paybill"),
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
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default="PAYBILL")
    payment_date = models.DateField()
    reference = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Paybill account reference or bank transaction code",
    )
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

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        invoice = self.invoice
        paid = invoice.receipts.aggregate(total=Sum("amount"))["total"] or Decimal("0.00")
        invoice.amount_paid = paid
        if invoice.total_amount > 0 and paid >= invoice.total_amount:
            invoice.status = "PAID"
            order = invoice.sales_order
            if order.status in {"CONFIRMED", "PAID"}:
                order.status = "READY_TO_PACK"
                order.save(update_fields=["status", "updated_at"])
        elif paid > 0:
            invoice.status = "PARTIALLY_PAID"
        invoice.save(update_fields=["amount_paid", "status", "updated_at"])