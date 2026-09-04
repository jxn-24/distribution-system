from rest_framework import viewsets, permissions
from apps.users.permissions import IsAdminUser, IsWarehouseUser, IsFinanceUser
from .models import Manufacturer, PurchaseOrder, GoodsReceipt
from .serializers import ManufacturerSerializer, PurchaseOrderSerializer, GoodsReceiptSerializer

class ManufacturerViewSet(viewsets.ModelViewSet):
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

class PurchaseOrderViewSet(viewsets.ModelViewSet):
    queryset = PurchaseOrder.objects.all().select_related("manufacturer", "created_by")
    serializer_class = PurchaseOrderSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser() | IsFinanceUser()]

class GoodsReceiptViewSet(viewsets.ModelViewSet):
    queryset = GoodsReceipt.objects.all().select_related("purchase_order", "warehouse", "received_by")
    serializer_class = GoodsReceiptSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser() | IsWarehouseUser()]