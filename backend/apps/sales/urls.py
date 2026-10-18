from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, SalesOrderViewSet, margin_report

router = DefaultRouter()
router.register("customers", CustomerViewSet)
router.register("sales-orders", SalesOrderViewSet)

urlpatterns = router.urls + [
    path("margin-report/", margin_report, name="margin-report"),
]