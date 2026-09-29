from rest_framework import viewsets

from apps.users.permissions import RoleAccessPermission
from .models import Invoice, Receipt
from .serializers import InvoiceSerializer, ReceiptSerializer


class InvoiceViewSet(viewsets.ModelViewSet):
	queryset = Invoice.objects.select_related("sales_order", "customer", "created_by")
	serializer_class = InvoiceSerializer
	permission_classes = [RoleAccessPermission]
	role_access = {
		"read": {"Admin", "Director", "Finance", "Customer", "Customer Portal", "Customer Portal (Wholesaler / Retailer)", "Retailer", "Wholesaler"},
		"write": {"Admin", "Finance"},
	}

	def get_queryset(self):
		user = self.request.user
		queryset = Invoice.objects.select_related("sales_order", "customer", "created_by")
		if user.is_super_admin or user.is_admin_user or user.is_director or user.is_finance:
			return queryset
		if user.is_customer:
			return queryset.filter(customer__user=user)
		return queryset.none()

	def perform_create(self, serializer):
		serializer.save(created_by=self.request.user)


class ReceiptViewSet(viewsets.ModelViewSet):
	queryset = Receipt.objects.select_related("invoice", "customer", "received_by")
	serializer_class = ReceiptSerializer
	permission_classes = [RoleAccessPermission]
	role_access = {
		"read": {"Admin", "Director", "Finance", "Customer", "Customer Portal", "Customer Portal (Wholesaler / Retailer)", "Retailer", "Wholesaler"},
		"write": {"Admin", "Finance"},
	}

	def get_queryset(self):
		user = self.request.user
		queryset = Receipt.objects.select_related("invoice", "customer", "received_by")
		if user.is_super_admin or user.is_admin_user or user.is_director or user.is_finance:
			return queryset
		if user.is_customer:
			return queryset.filter(customer__user=user)
		return queryset.none()

	def perform_create(self, serializer):
		serializer.save(received_by=self.request.user)
