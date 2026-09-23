from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from apps.users.permissions import IsAdminUser, IsWarehouseUser
from apps.sales.models import SalesOrder
from .models import Shipment, ShipmentItem
from .serializers import ShipmentSerializer


class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all().select_related("sales_order", "warehouse")
    serializer_class = ShipmentSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve", "from_order"]:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser() | IsWarehouseUser()]

    @action(detail=False, methods=["post"], url_path="from-order")
    def from_order(self, request):
        """
        Create a shipment from a READY_TO_PACK sales order.

        Body example:
        {
          "sales_order_id": 1,
          "tracking_number": "TRK-001",
          "carrier": "Own transport",
          "shipment_number": "SHP-001"   # optional
        }
        """
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
                {"detail": "Shipment number already exists. Use a different one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
            already_shipped = getattr(line, "quantity_shipped", 0) or 0
            qty = line.quantity - already_shipped
            if qty <= 0:
                continue

            # If ShipmentItem requires sales_order_item, add: sales_order_item=line
            ShipmentItem.objects.create(
                shipment=shipment,
                product=line.product,
                batch=line.batch,
                quantity=qty,
            )

            if hasattr(line, "quantity_shipped"):
                line.quantity_shipped = already_shipped + qty
                line.save(update_fields=["quantity_shipped"])

        order.status = "SHIPPED"
        order.save(update_fields=["status", "updated_at"])

        return Response(
            ShipmentSerializer(shipment).data,
            status=status.HTTP_201_CREATED,
        )