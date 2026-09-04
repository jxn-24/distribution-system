from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, ProductViewSet, BatchViewSet,
    WarehouseViewSet, StockLocationViewSet,
    InventoryViewSet, StockMovementViewSet
)

router = DefaultRouter()
router.register("categories", CategoryViewSet)
router.register("products", ProductViewSet)
router.register("batches", BatchViewSet)
router.register("warehouses", WarehouseViewSet)
router.register("locations", StockLocationViewSet)
router.register("inventory", InventoryViewSet)
router.register("stock-movements", StockMovementViewSet)

urlpatterns = router.urls