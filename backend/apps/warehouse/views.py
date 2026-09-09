from rest_framework import viewsets, permissions
from apps.users.permissions import IsAdminUser, IsWarehouseUser, IsSalesUser, IsFinanceUser
from .models import Shipment
from .serializers import ShipmentSerializer

class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all().select_related("sales_order", "warehouse")
    serializer_class = ShipmentSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser() | IsWarehouseUser()]