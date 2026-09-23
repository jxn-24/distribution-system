from rest_framework.routers import DefaultRouter
from .views import InvoiceViewSet, ReceiptViewSet

router = DefaultRouter()
router.register("invoices", InvoiceViewSet, basename="invoice")
router.register("receipts", ReceiptViewSet, basename="receipt")

urlpatterns = router.urls