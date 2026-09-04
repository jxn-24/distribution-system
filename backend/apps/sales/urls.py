from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, SalesOrderViewSet

router = DefaultRouter()
router.register("customers", CustomerViewSet)
router.register("sales-orders", SalesOrderViewSet)

urlpatterns = router.urls