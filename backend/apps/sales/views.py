from rest_framework import viewsets
from django.db.models import Q
from apps.users.permissions import RoleAccessPermission
from .models import Customer, SalesOrder
from .serializers import CustomerSerializer, SalesOrderSerializer

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer

    permission_classes = [RoleAccessPermission]
    role_access = {
        "read": {"Admin", "Director", "Sales", "Sales / Account Managers", "Account Manager", "Finance", "Customer", "Customer Portal", "Customer Portal (Wholesaler / Retailer)", "Retailer", "Wholesaler"},
        "write": {"Admin", "Sales", "Sales / Account Managers", "Account Manager"},
    }

    def get_queryset(self):
        user = self.request.user
        if user.is_customer:
            return Customer.objects.filter(user=user)
        if user.is_super_admin or user.is_admin_user or user.is_director or user.is_finance:
            return Customer.objects.all()
        if user.is_sales:
            return Customer.objects.filter(account_manager=user)
        if user.is_sales_agent:
            return Customer.objects.filter(sales_orders__sales_agent=user).distinct()
        return Customer.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_sales:
            serializer.save(account_manager=user)
        else:
            serializer.save()

class SalesOrderViewSet(viewsets.ModelViewSet):
    queryset = SalesOrder.objects.all()
    serializer_class = SalesOrderSerializer

    permission_classes = [RoleAccessPermission]
    role_access = {
        "read": {"Admin", "Director", "Sales", "Sales / Account Managers", "Account Manager", "Finance", "Sales Agent", "Customer", "Customer Portal", "Customer Portal (Wholesaler / Retailer)", "Retailer", "Wholesaler"},
        "write": {"Admin", "Sales", "Sales / Account Managers", "Account Manager"},
        "create": {"Sales Agent", "Customer", "Customer Portal", "Customer Portal (Wholesaler / Retailer)", "Retailer", "Wholesaler"},
    }

    def get_queryset(self):
        user = self.request.user
        qs = SalesOrder.objects.all().select_related(
            "customer", "warehouse", "sales_agent"
        )

        if user.is_super_admin or user.is_admin_user:
            return qs
        if user.is_director or user.is_finance:
            return qs
        if user.is_sales:
            return qs.filter(
                Q(customer__account_manager=user) | Q(sales_agent=user) | Q(created_by=user)
            ).distinct()
        if user.is_sales_agent:
            return qs.filter(sales_agent=user)
        if user.is_customer:
            return qs.filter(customer__user=user)
        return qs.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_customer:
            customer = Customer.objects.filter(user=user).first()
            if customer is None:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("Your account is not linked to a customer profile.")
            serializer.save(customer=customer, created_by=user)
        elif user.is_sales_agent:
            serializer.save(sales_agent=user, created_by=user)
        else:
            serializer.save(created_by=user)
