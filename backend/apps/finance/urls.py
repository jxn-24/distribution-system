from rest_framework.routers import DefaultRouter

from .views import InvoiceViewSet, ReceiptViewSet

router = DefaultRouter()
router.register("invoices", InvoiceViewSet)
router.register("receipts", ReceiptViewSet)

urlpatterns = router.urls