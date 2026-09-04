from rest_framework import viewsets, permissions
from apps.users.permissions import IsAdminUser, IsSalesUser, IsSalesAgent, IsCustomerUser
from .models import Customer, SalesOrder
from .serializers import CustomerSerializer, SalesOrderSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser() | IsSalesUser()]

    def get_queryset(self):
        user = self.request.user
        if user.is_customer:
            return Customer.objects.filter(user=user)
        return Customer.objects.all()

class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerializer

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.IsAuthenticated()]
        return [IsAdminUser() | IsSalesUser()]

    def get_queryset(self):
        user = self.request.user
        qs = SalesOrder.objects.all().select_related("customer", "warehouse", "sales_agent")

        if user.is_super_admin or user.is_admin_user:
            return qs
        if user.is_sales or user.is_finance or user.is_director:
            return qs
        if user.is_sales_agent:
            return qs.filter(sales_agent=user)
        if user.is_customer:
            return qs.filter(customer__user=user)
        return qs.none()
