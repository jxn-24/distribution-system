from rest_framework.routers import DefaultRouter
from .views import ShipmentViewSet

router = DefaultRouter()
router.register("shipments", ShipmentViewSet)

urlpatterns = router.urls