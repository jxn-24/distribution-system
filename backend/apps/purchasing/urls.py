from rest_framework.routers import DefaultRouter
from .views import ManufacturerViewSet, PurchaseOrderViewSet, GoodsReceiptViewSet

router = DefaultRouter()
router.register("manufacturers", ManufacturerViewSet)
router.register("purchase-orders", PurchaseOrderViewSet)
router.register("goods-receipts", GoodsReceiptViewSet)

urlpatterns = router.urls