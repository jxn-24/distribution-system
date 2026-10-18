from decimal import Decimal

from django.db.models import Q, Sum, F, DecimalField
from django.db.models.functions import Coalesce
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from apps.users.permissions import RoleAccessPermission
from .models import Customer, SalesOrder, SalesOrderItem
from .serializers import CustomerSerializer, SalesOrderSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [RoleAccessPermission]
    role_access = {
        "read": {"Admin", "Director", "Finance", "Sales", "Sales / Account Managers", "Account Manager"},
        "write": {"Admin", "Sales", "Sales / Account Managers", "Account Manager"},
    }

    def get_queryset(self):
        user = self.request.user
        if user.is_super_admin or user.is_admin_user or user.is_director or user.is_finance:
            return Customer.objects.all()
        if user.is_sales:
            return Customer.objects.filter(account_manager=user)
        if user.is_sales_agent:
            return Customer.objects.filter(sales_orders__sales_agent=user).distinct()
        if user.is_customer:
            return Customer.objects.filter(user=user)
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
        "read": {
            "Admin",
            "Director",
            "Warehouse",
            "Sales",
            "Sales / Account Managers",
            "Account Manager",
            "Finance",
            "Sales Agent",
            "Customer",
            "Customer Portal",
            "Customer Portal (Wholesaler / Retailer)",
            "Retailer",
            "Wholesaler",
        },
        "write": {"Admin", "Sales", "Sales / Account Managers", "Account Manager"},
        "create": {
            "Sales Agent",
            "Customer",
            "Customer Portal",
            "Customer Portal (Wholesaler / Retailer)",
            "Retailer",
            "Wholesaler",
        },
    }

    def get_queryset(self):
        user = self.request.user
        qs = SalesOrder.objects.all().select_related(
            "customer", "warehouse", "sales_agent"
        )

        if (
            user.is_super_admin
            or user.is_admin_user
            or user.is_director
            or user.is_finance
            or getattr(user, "is_warehouse", False)
        ):
            return qs
        if user.is_sales:
            return qs.filter(
                Q(customer__account_manager=user)
                | Q(sales_agent=user)
                | Q(created_by=user)
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
                raise PermissionDenied("Your account is not linked to a customer profile.")
            serializer.save(customer=customer, created_by=user)
        elif user.is_sales_agent:
            serializer.save(sales_agent=user, created_by=user)
        else:
            serializer.save(created_by=user)


@api_view(["GET"])
@permission_classes([RoleAccessPermission])
def margin_report(request):
    user = request.user
    if not (user.is_super_admin or user.is_admin_user or user.is_director or user.is_finance):
        return Response({"detail": "Not allowed."}, status=403)

    rows = (
        SalesOrderItem.objects
        .filter(sales_order__status__in=["CONFIRMED", "PAID", "READY_TO_PACK", "PICKING", "PACKED", "SHIPPED", "DELIVERED"])
        .values("product__sku", "product__name")
        .annotate(
            pieces=Coalesce(Sum("quantity"), 0),
            revenue=Coalesce(Sum(F("quantity") * F("unit_price")), Decimal("0.00"), output_field=DecimalField()),
            cost=Coalesce(Sum(F("quantity") * F("product__cost_price")), Decimal("0.00"), output_field=DecimalField()),
        )
        .order_by("-revenue")
    )

    data = []
    for row in rows:
        revenue = row["revenue"] or Decimal("0")
        cost = row["cost"] or Decimal("0")
        margin = revenue - cost
        margin_pct = (margin / revenue * 100) if revenue else Decimal("0")
        data.append({
            "sku": row["product__sku"],
            "name": row["product__name"],
            "pieces": row["pieces"],
            "revenue": str(revenue),
            "cost": str(cost),
            "margin": str(margin),
            "margin_pct": str(round(margin_pct, 1)),
        })
    return Response(data)