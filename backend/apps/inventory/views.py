from rest_framework import viewsets, permissions
from apps.users.permissions import (
    IsAdminUser, IsWarehouseUser, IsSalesUser, IsFinanceUser, ReadOnly
)
from .models import Category, Product, Batch, Warehouse, StockLocation, Inventory, StockMovement
from .serializers import (
    CategorySerializer, ProductSerializer, BatchSerializer,
    WarehouseSerializer, StockLocationSerializer,
    InventorySerializer, StockMovementSerializer
)

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all().select_related("product")
    serializer_class = BatchSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser() | IsWarehouseUser()]

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related("category").prefetch_related("batches")
    serializer_class = ProductSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

class StockLocationViewSet(viewsets.ModelViewSet):
    queryset = StockLocation.objects.all().select_related("warehouse")
    serializer_class = StockLocationSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser() | IsWarehouseUser()]

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all().select_related("product", "batch", "warehouse", "location")
    serializer_class = InventorySerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser() | IsWarehouseUser()]

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all().select_related("product", "batch", "warehouse", "created_by")
    serializer_class = StockMovementSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser() | IsWarehouseUser()]            