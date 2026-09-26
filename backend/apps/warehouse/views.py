from rest_framework import viewsets
from django.db.models import Q
from apps.users.permissions import RoleAccessPermission
from apps.users.models import User
from .models import Shipment
from .serializers import ShipmentSerializer
from apps.inventory.views import StockScanViewSet

class ShipmentViewSet(viewsets.ModelViewSet):
    queryset = Shipment.objects.all().select_related("sales_order", "warehouse")
    serializer_class = ShipmentSerializer

    permission_classes = [RoleAccessPermission]
    role_access = {
        "read": {"Admin", "Director", "Warehouse", "Sales", "Sales / Account Managers", "Account Manager", "Sales Agent", "Customer", "Customer Portal (Wholesaler / Retailer)"},
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
                Q(sales_order__customer__account_manager=user) |
                Q(sales_order__sales_agent=user) |
                Q(sales_order__created_by=user)
            ).distinct()
        if user.is_finance:
            return queryset
        return queryset.none()