from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.users.permissions import IsAdminUser, IsFinanceUser
from .models import Invoice, Receipt
from .serializers import InvoiceSerializer, ReceiptSerializer
from decimal import Decimal

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all().select_related(
        "sales_order", "customer", "created_by"
    )
    serializer_class = InvoiceSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        if self.action == "record_payment":
            return [IsAdminUser() | IsFinanceUser()]
        return [IsAdminUser() | IsFinanceUser()]

    def get_queryset(self):
        user = self.request.user
        qs = Invoice.objects.all().select_related(
            "sales_order", "customer", "created_by"
        )
        if getattr(user, "is_super_admin", False) or getattr(user, "is_admin_user", False):
            return qs
        if getattr(user, "is_finance", False) or getattr(user, "is_director", False):
            return qs
        if getattr(user, "is_sales", False):
            return qs
        return qs.none()

    @action(detail=True, methods=["post"], url_path="record-payment")
    def record_payment(self, request, pk=None):
        """
        Body example:
        {
          "amount": "600.00",
          "payment_method": "CASH",
          "reference": "MPESA-XXX",
          "payment_date": "2026-09-23",
          "receipt_number": "RCP-001"
        }
        """
        invoice = self.get_object()

        if invoice.status == "CANCELLED":
            return Response(
                {"detail": "Cannot record payment on a cancelled invoice."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        amount_raw = request.data.get("amount")
        if amount_raw is None:
            return Response(
                {"detail": "amount is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            amount = Decimal(str(amount_raw))
        except Exception:
            return Response(
                {"detail": "Invalid amount."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if amount <= 0:
            return Response(
                {"detail": "amount must be positive."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        method = request.data.get("payment_method") or "CASH"
        reference = request.data.get("reference") or ""
        payment_date = request.data.get("payment_date") or timezone.now().date()
        receipt_number = request.data.get("receipt_number") or (
            f"RCP-{invoice.invoice_number}-{timezone.now().strftime('%H%M%S')}"
        )

        if Receipt.objects.filter(receipt_number=receipt_number).exists():
            return Response(
                {"detail": "receipt_number already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # Build receipt kwargs to match your model field names
            receipt_kwargs = {
                "receipt_number": receipt_number,
                "invoice": invoice,
                "customer": invoice.customer,
                "amount": amount,
                "payment_date": payment_date,
                "reference": reference,
            }

            # payment method field name may vary
            receipt_field_names = {f.name for f in Receipt._meta.get_fields()}
            if "payment_method" in receipt_field_names:
                receipt_kwargs["payment_method"] = method
            elif "method" in receipt_field_names:
                receipt_kwargs["method"] = method

            if "received_by" in receipt_field_names and request.user.is_authenticated:
                receipt_kwargs["received_by"] = request.user

            receipt = Receipt.objects.create(**receipt_kwargs)

            paid_so_far = invoice.amount_paid or Decimal("0.00")
            invoice.amount_paid = paid_so_far + amount

            if invoice.amount_paid >= invoice.total_amount:
                invoice.status = "PAID"
                invoice.amount_paid = invoice.total_amount
            else:
                invoice.status = "PARTIALLY_PAID"

            invoice.save(update_fields=["amount_paid", "status", "updated_at"])

            order = invoice.sales_order
            if invoice.status == "PAID" and order is not None:
                if order.status in ("CONFIRMED", "PAID"):
                    order.status = "READY_TO_PACK"
                    order.save(update_fields=["status", "updated_at"])

        return Response(
            {
                "receipt_number": receipt.receipt_number,
                "invoice_number": invoice.invoice_number,
                "invoice_status": invoice.status,
                "amount_paid": str(invoice.amount_paid),
                "order_number": order.order_number if order else None,
                "order_status": order.status if order else None,
            },
            status=status.HTTP_201_CREATED,
        )


class ReceiptViewSet(viewsets.ModelViewSet):
    queryset = Receipt.objects.all().select_related("invoice", "customer")
    serializer_class = ReceiptSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser() | IsFinanceUser()]

    def get_queryset(self):
        user = self.request.user
        qs = Receipt.objects.all().select_related("invoice", "customer")
        if getattr(user, "is_super_admin", False) or getattr(user, "is_admin_user", False):
            return qs
        if getattr(user, "is_finance", False) or getattr(user, "is_director", False):
            return qs
        return qs.none()
