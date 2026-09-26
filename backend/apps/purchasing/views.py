from rest_framework import viewsets
from apps.users.permissions import RoleAccessPermission
from .models import Manufacturer, PurchaseOrder, GoodsReceipt
from .serializers import ManufacturerSerializer, PurchaseOrderSerializer, GoodsReceiptSerializer

ADMIN = {"Admin"}
DIRECTORS = {"Director"}
WAREHOUSE = {"Warehouse"}
FINANCE = {"Finance"}

class ManufacturerViewSet(viewsets.ModelViewSet):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer

    permission_classes = [RoleAccessPermission]
    role_access = {"read": ADMIN | DIRECTORS | WAREHOUSE | FINANCE, "write": ADMIN}

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().select_related("manufacturer", "created_by")
    serializer_class = PurchaseOrderSerializer

    permission_classes = [RoleAccessPermission]
    role_access = {"read": ADMIN | DIRECTORS | WAREHOUSE | FINANCE, "write": ADMIN | FINANCE}

    def get_queryset(self):
        queryset = PurchaseOrder.objects.select_related("manufacturer", "created_by")
        if self.request.user.is_warehouse:
            return queryset.only(
                "id", "po_number", "manufacturer_id", "order_date", "expected_date",
                "status", "created_by_id", "created_at", "updated_at"
            )
        return queryset

class GoodsReceiptViewSet(viewsets.ModelViewSet):
    queryset = GoodsReceipt.objects.all().select_related("purchase_order", "warehouse", "received_by")
    serializer_class = GoodsReceiptSerializer

    permission_classes = [RoleAccessPermission]
    role_access = {"read": ADMIN | DIRECTORS | WAREHOUSE | FINANCE, "write": ADMIN | WAREHOUSE}