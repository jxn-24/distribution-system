from rest_framework.routers import DefaultRouter

from apps.inventory.views import StockScanViewSet
from .views import ShipmentViewSet

router = DefaultRouter()
router.register("shipments", ShipmentViewSet, basename="shipment")
router.register("scan", StockScanViewSet, basename="stock-scan")

urlpatterns = router.urls