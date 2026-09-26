from rest_framework.routers import DefaultRouter
from .views import ShipmentViewSet, StockScanViewSet

router = DefaultRouter()
router.register("shipments", ShipmentViewSet)
router.register("scan", StockScanViewSet, basename="stock-scan")

urlpatterns = router.urls