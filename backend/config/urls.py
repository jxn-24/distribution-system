from django.contrib import admin
from django.urls import path, include

admin.site.site_header = "LUNA SOFT Essentials"
admin.site.site_title = "LUNA SOFT Essentials"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/inventory/', include('apps.inventory.urls')),
    path("api/finance/", include("apps.finance.urls")),
    path('api/sales/', include('apps.sales.urls')),
    path('api/purchasing/', include('apps.purchasing.urls')),
    path('api/warehouse/', include('apps.warehouse.urls'))

]
