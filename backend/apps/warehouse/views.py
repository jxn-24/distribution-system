from django.core.exceptions import ValidationError
from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.inventory.services import allocate_fifo
from apps.sales.models import SalesOrder
from apps.users.permissions import RoleAccessPermission
from .models import Shipment, ShipmentItem
from .serializers import ShipmentSerializer


class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all().select_related("sales_order", "warehouse")
    serializer_class = ShipmentSerializer
    permission_classes = [RoleAccessPermission]
    role_access = {
        "read": {
            "Admin",
            "Director",
            "Warehouse",
            "Sales",
            "Sales / Account Managers",
            "Account Manager",
            "Sales Agent",
            "Finance",
            "Customer",
            "Customer Portal (Wholesaler / Retailer)",
        },
        "write": {"Admin", "Warehouse"},
    }

    def get_queryset(self):
        queryset = Shipment.objects.select_related("sales_order", "warehouse")
        user = self.request.user
        if user.is_super_admin or user.is_admin_user or user.is_director or user.is_warehouse:
            return queryset
        if user.is_customer:
            return queryset.filter(sales_order__customer__user=user)
        if user.is_sales_agent:
            return queryset.filter(sales_order__sales_agent=user)
        if user.is_sales:
            return queryset.filter(
                Q(sales_order__customer__account_manager=user)
                | Q(sales_order__sales_agent=user)
                | Q(sales_order__created_by=user)
            ).distinct()
        if user.is_finance:
            return queryset
        return queryset.none()

    @action(detail=False, methods=["post"], url_path="from-order")
    def from_order(self, request):
        order_id = request.data.get("sales_order_id")
        tracking = request.data.get("tracking_number") or ""
        carrier = request.data.get("carrier") or ""
        shipment_number = request.data.get("shipment_number")

        if not order_id:
            return Response(
                {"detail": "sales_order_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            order = SalesOrder.objects.prefetch_related("items").get(pk=order_id)
        except SalesOrder.DoesNotExist:
            return Response(
                {"detail": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if order.status != "READY_TO_PACK":
            return Response(
                {"detail": f"Order must be READY_TO_PACK (now {order.status})."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not shipment_number:
            shipment_number = f"SHP-{order.order_number}"

        if Shipment.objects.filter(shipment_number=shipment_number).exists():
            return Response(
                {"detail": "Shipment number already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                shipment = Shipment.objects.create(
                    shipment_number=shipment_number,
                    sales_order=order,
                    warehouse=order.warehouse,
                    carrier=carrier,
                    tracking_number=tracking,
                    status="IN_TRANSIT",
                    shipped_at=timezone.now(),
                    created_by=request.user if request.user.is_authenticated else None,
                )

                for line in order.items.all():
                    already = getattr(line, "quantity_shipped", 0) or 0
                    qty = line.quantity - already
                    if qty <= 0:
                        continue

                    if line.batch_id:
                        slices = [(line.batch, qty)]
                    else:
                        slices = allocate_fifo(line.product, order.warehouse, qty)

                    for batch_obj, take in slices:
                        ShipmentItem.objects.create(
                            shipment=shipment,
                            product=line.product,
                            batch=batch_obj,
                            quantity=take,
                            sales_order_item=line,
                        )

                    if hasattr(line, "quantity_shipped"):
                        line.quantity_shipped = already + qty
                        line.save(update_fields=["quantity_shipped"])

                order.status = "SHIPPED"
                order.save(update_fields=["status", "updated_at"])
        except ValidationError as exc:
            message = exc.messages[0] if getattr(exc, "messages", None) else str(exc)
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            ShipmentSerializer(shipment).data,
            status=status.HTTP_201_CREATED,
        )