from decimal import Decimal

from django.db import transaction
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.users.permissions import RoleAccessPermission
from .models import Invoice, Receipt
from .serializers import InvoiceSerializer, ReceiptSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.select_related("sales_order", "customer", "created_by")
    serializer_class = InvoiceSerializer
    permission_classes = [RoleAccessPermission]
    role_access = {
        "read": {
            "Admin",
            "Director",
            "Finance",
            "Customer",
            "Customer Portal",
            "Customer Portal (Wholesaler / Retailer)",
            "Retailer",
            "Wholesaler",
        },
        "write": {"Admin", "Finance"},
    }

    def get_queryset(self):
        user = self.request.user
        queryset = Invoice.objects.select_related("sales_order", "customer", "created_by")
        if user.is_super_admin or user.is_admin_user or user.is_director or user.is_finance:
            return queryset
        if user.is_customer:
            return queryset.filter(customer__user=user)
        return queryset.none()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"], url_path="record-payment")
    def record_payment(self, request, pk=None):
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

        field_names = {f.name for f in Receipt._meta.get_fields()}

        with transaction.atomic():
            receipt_kwargs = {
                "receipt_number": receipt_number,
                "invoice": invoice,
                "customer": invoice.customer,
                "amount": amount,
                "payment_date": payment_date,
                "reference": reference,
            }
            if "payment_method" in field_names:
                receipt_kwargs["payment_method"] = method
            elif "method" in field_names:
                receipt_kwargs["method"] = method
            if "received_by" in field_names and request.user.is_authenticated:
                receipt_kwargs["received_by"] = request.user
            if "notes" in field_names and request.data.get("notes"):
                receipt_kwargs["notes"] = request.data.get("notes")

            receipt = Receipt.objects.create(**receipt_kwargs)

            invoice.amount_paid = (invoice.amount_paid or Decimal("0.00")) + amount
            if invoice.amount_paid >= invoice.total_amount:
                invoice.status = "PAID"
                invoice.amount_paid = invoice.total_amount
            else:
                invoice.status = "PARTIALLY_PAID"
            invoice.save(update_fields=["amount_paid", "status", "updated_at"])

            order = invoice.sales_order
            if invoice.status == "PAID" and order and order.status in ("CONFIRMED", "PAID"):
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
    queryset = Receipt.objects.select_related("invoice", "customer", "received_by")
    serializer_class = ReceiptSerializer
    permission_classes = [RoleAccessPermission]
    role_access = {
        "read": {
            "Admin",
            "Director",
            "Finance",
            "Customer",
            "Customer Portal",
            "Customer Portal (Wholesaler / Retailer)",
            "Retailer",
            "Wholesaler",
        },
        "write": {"Admin", "Finance"},
    }

    def get_queryset(self):
        user = self.request.user
        queryset = Receipt.objects.select_related("invoice", "customer", "received_by")
        if user.is_super_admin or user.is_admin_user or user.is_director or user.is_finance:
            return queryset
        if user.is_customer:
            return queryset.filter(customer__user=user)
        return queryset.none()

    def perform_create(self, serializer):
        serializer.save(received_by=self.request.user)