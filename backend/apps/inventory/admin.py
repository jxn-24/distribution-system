from django.contrib import admin
from .models import Category, Product, Batch

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("name",)

class BatchInline(admin.TabularInline):
    model = Batch
    extra = 0
    fields = ("batch_number", "manufacture_date", "expiry_date", "quantity", "notes")

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("sku", "name", "category", "unit", "selling_price", "track_batches", "is_active")
    list_filter = ("category", "is_active", "track_batches", "unit")
    search_fields = ("sku", "name")
    inlines = [BatchInline]
    readonly_fields = ("created_at", "updated_at")

@admin.register(Batch)
class BatchAdmin(admin.ModelAdmin):
    list_display = ("batch_number", "product", "quantity", "manufacture_date", "expiry_date", "is_expired")
    list_filter = ("product", "expiry_date")
    search_fields = ("batch_number", "product__sku", "product__name")
    readonly_fields = ("created_at", "updated_at")