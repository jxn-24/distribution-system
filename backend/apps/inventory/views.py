from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError as APIValidationError
from django.core.exceptions import ValidationError as DjangoValidationError
from .scan_serializers import StockScanSerializer
from .scan_services import apply_stock_scan, resolve_scan_code
from apps.users.permissions import (
    RoleAccessPermission,
)
from .models import Category, Product, Batch, Warehouse, StockLocation, Inventory, StockMovement
from .serializers import (
    CategorySerializer, ProductSerializer, BatchSerializer,
    WarehouseSerializer, StockLocationSerializer,
    InventorySerializer, StockMovementSerializer
)
from apps.inventory.scan_services import apply_stock_scan, match_package_code, receive_package_code

ADMIN = {"Admin"}
DIRECTORS = {"Director"}
WAREHOUSE = {"Warehouse"}
SALES = {"Sales", "Sales / Account Managers", "Account Manager"}
FINANCE = {"Finance"}
AGENTS = {"Sales Agent"}
CUSTOMERS = {"Customer", "Customer Portal", "Customer Portal (Wholesaler / Retailer)", "Retailer", "Wholesaler"}
EMPLOYEES = ADMIN | DIRECTORS | WAREHOUSE | SALES | AGENTS
CATALOG_READERS = ADMIN | DIRECTORS | WAREHOUSE | SALES | AGENTS | CUSTOMERS


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    permission_classes = [RoleAccessPermission]
    role_access = {"read": CATALOG_READERS, "write": ADMIN}

class BatchViewSet(viewsets.ModelViewSet):
    queryset = Batch.objects.all().select_related("product")
    serializer_class = BatchSerializer

    permission_classes = [RoleAccessPermission]
    role_access = {"read": ADMIN | DIRECTORS | WAREHOUSE | SALES | AGENTS | CUSTOMERS, "write": ADMIN | WAREHOUSE}

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().select_related("category").prefetch_related("batches")
    serializer_class = ProductSerializer

    permission_classes = [RoleAccessPermission]
    role_access = {"read": CATALOG_READERS, "write": ADMIN}

class WarehouseViewSet(viewsets.ModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer

    permission_classes = [RoleAccessPermission]
    role_access = {"read": EMPLOYEES, "write": ADMIN}

class StockLocationViewSet(viewsets.ModelViewSet):
    queryset = StockLocation.objects.all().select_related("warehouse")
    serializer_class = StockLocationSerializer

    permission_classes = [RoleAccessPermission]
    role_access = {"read": ADMIN | DIRECTORS | WAREHOUSE | CUSTOMERS, "write": ADMIN | WAREHOUSE}

    def get_queryset(self):
        queryset = StockLocation.objects.select_related("warehouse")
        if self.request.user.is_customer:
            return queryset.filter(is_active=True, warehouse__is_active=True)
        return queryset

class InventoryViewSet(viewsets.ModelViewSet):
    queryset = Inventory.objects.all().select_related("product", "batch", "warehouse", "location")
    serializer_class = InventorySerializer

    permission_classes = [RoleAccessPermission]
    role_access = {"read": ADMIN | DIRECTORS | WAREHOUSE, "write": ADMIN | WAREHOUSE}

class StockMovementViewSet(viewsets.ModelViewSet):
    queryset = StockMovement.objects.all().select_related("product", "batch", "warehouse", "created_by")
    serializer_class = StockMovementSerializer

    permission_classes = [RoleAccessPermission]
    role_access = {"read": ADMIN | DIRECTORS | WAREHOUSE, "write": ADMIN | WAREHOUSE}


class StockScanViewSet(viewsets.ViewSet):
    permission_classes = [RoleAccessPermission]
    role_access = {"read": ADMIN | WAREHOUSE, "write": ADMIN | WAREHOUSE}

    def _resolve_code(self, code):
        code = (code or "").strip()
        if not code:
            raise NotFound("Provide a barcode, SKU, or batch code.")

        lot, _sequence = match_package_code(code)
        if lot and lot.product.is_active:
            return lot.product, lot

        matched_batch = (
            Batch.objects.select_related("product")
            .filter(scan_code__iexact=code)
            .first()
        )
        if matched_batch is None:
            matched_batch = (
                Batch.objects.select_related("product")
                .filter(batch_number__iexact=code)
                .first()
            )
        if matched_batch and matched_batch.product.is_active:
            return matched_batch.product, matched_batch

        try:
            return Product.objects.get(is_active=True, sku__iexact=code), None
        except Product.DoesNotExist:
            try:
                return Product.objects.get(is_active=True, barcode__iexact=code), None
            except Product.DoesNotExist as exc:
                raise NotFound(
                    "No active product matches that SKU, barcode, or batch."
                ) from exc

    def _get_product(self, code):
        product, _batch = self._resolve_code(code)
        return product

    @action(detail=False, methods=["get"], url_path="product")
    def product(self, request):
        code = request.query_params.get("code", "").strip()
        if not code:
            return Response(
                {"detail": "Provide a barcode, SKU, or batch code in 'code'."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        product, matched_batch = self._resolve_code(code)
        stock = Inventory.objects.filter(product=product).select_related(
            "warehouse", "location", "batch"
        )
        return Response({
            "product": {
                "id": product.id,
                "sku": product.sku,
                "barcode": product.barcode,
                "name": product.name,
                "track_batches": product.track_batches,
            },
            "matched_batch": (
                {"id": matched_batch.id, "batch_number": matched_batch.batch_number}
                if matched_batch
                else None
            ),
            "stock": [{
                "warehouse_id": row.warehouse_id,
                "warehouse": row.warehouse.name,
                "location_id": row.location_id,
                "location": row.location.name if row.location else None,
                "batch_id": row.batch_id,
                "batch": row.batch.batch_number if row.batch else None,
                "quantity_on_hand": row.quantity_on_hand,
                "quantity_reserved": row.quantity_reserved,
                "quantity_available": row.quantity_available,
            } for row in stock],
        })

    @action(detail=False, methods=["post"], url_path="receive")
    def receive(self, request):
        serializer = StockScanSerializer(data=request.data, context={"direction": "in"})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            package_result = receive_package_code(
                code=data["code"],
                warehouse=data["warehouse"],
                location=data.get("location"),
                user=request.user,
                reference=data.get("reference", ""),
            )
        except DjangoValidationError as exc:
            raise APIValidationError({"detail": exc.messages[0]}) from exc
        if package_result is not None:
            lot, inv, movement = package_result
            return Response({
                "detail": f"Received package {data['code']}",
                "product": {"id": lot.product_id, "sku": lot.product.sku, "name": lot.product.name},
                "inventory": [{
                    "id": inv.id,
                    "batch_id": lot.id,
                    "quantity_on_hand": inv.quantity_on_hand,
                }],
                "movements": [{
                    "id": movement.id,
                    "movement_type": "RECEIVE",
                    "quantity": 1,
                }],
            })
        return self._apply(request, direction="in")

    @action(detail=False, methods=["post"], url_path="dispense")
    def dispense(self, request):
        return self._apply(request, direction="out")

    def _apply(self, request, *, direction):
        serializer = StockScanSerializer(data=request.data, context={"direction": direction})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        product, matched_batch = self._resolve_code(data["code"])
        batch = data.get("batch") or matched_batch
        try:
            inventory_rows, movements = apply_stock_scan(
                product=product,
                warehouse=data["warehouse"],
                quantity=data["quantity"],
                direction=direction,
                movement_type=data.get("movement_type"),
                batch=batch,
                location=data.get("location"),
                reference=data.get("reference", ""),
                notes=data.get("notes", ""),
                user=request.user,
            )
        except DjangoValidationError as exc:
            raise APIValidationError({"detail": exc.messages[0]}) from exc
        return Response({
            "product": {"id": product.id, "sku": product.sku, "name": product.name},
            "inventory": [{
                "id": row.id,
                "warehouse_id": row.warehouse_id,
                "location_id": row.location_id,
                "batch_id": row.batch_id,
                "quantity_on_hand": row.quantity_on_hand,
                "quantity_reserved": row.quantity_reserved,
                "quantity_available": row.quantity_available,
            } for row in inventory_rows],
            "movements": [{
                "id": movement.id,
                "movement_type": movement.movement_type,
                "quantity": movement.quantity,
                "reference": movement.reference,
                "created_by": movement.created_by_id,
                "created_at": movement.created_at,
            } for movement in movements],
        }, status=status.HTTP_200_OK)