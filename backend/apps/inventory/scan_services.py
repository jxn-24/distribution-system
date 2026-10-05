from django.core.exceptions import ValidationError
from django.db import transaction

from .models import Batch, Inventory, Product, StockMovement


def resolve_scan_code(code: str):
    raw = (code or "").strip()
    if not raw:
        raise ValidationError("Scan code is required.")

    batch = (
        Batch.objects.select_related("product")
        .filter(batch_number__iexact=raw)
        .first()
    )
    if batch:
        return batch.product, batch

    product = Product.objects.filter(sku__iexact=raw, is_active=True).first()
    if product:
        return product, None

    product = Product.objects.filter(barcode__iexact=raw, is_active=True).first()
    if product:
        return product, None

    raise ValidationError(f"No product or batch found for code '{raw}'.")


def _get_or_create_inventory(product, warehouse, location, batch):
    inv, _ = Inventory.objects.select_for_update().get_or_create(
        product=product,
        warehouse=warehouse,
        location=location,
        batch=batch,
        defaults={
            "quantity_on_hand": 0,
            "quantity_reserved": 0,
        },
    )
    return inv


@transaction.atomic
def apply_stock_scan(
    *,
    code=None,
    product=None,
    quantity,
    warehouse,
    location=None,
    batch=None,
    movement_type="RECEIVE",
    reference="",
    notes="",
    user=None,
    direction=None,
):
    quantity = int(quantity)
    if quantity <= 0:
        raise ValidationError("Quantity must be greater than zero.")

    scanned_batch = None
    if product is None and code:
        product, scanned_batch = resolve_scan_code(code)
    if product is None:
        raise ValidationError("Product is required.")

    if batch is None:
        batch = scanned_batch

    if getattr(product, "track_batches", False) and batch is None:
        raise ValidationError("This product is batch-tracked. Choose or scan a batch.")

    if batch is not None and batch.product_id != product.id:
        raise ValidationError("That batch does not belong to this product.")

    inbound_types = {"RECEIVE", "ADJUST_IN", "TRANSFER_IN", "RETURN"}
    outbound_types = {"PICK", "SHIP", "ADJUST_OUT", "TRANSFER_OUT"}

    if direction == "in":
        inbound = True
    elif direction == "out":
        inbound = False
    else:
        inbound = movement_type in inbound_types
        if movement_type not in inbound_types and movement_type not in outbound_types:
            raise ValidationError(f"Unsupported movement type '{movement_type}'.")

    movements = []

    if inbound:
        inv = _get_or_create_inventory(product, warehouse, location, batch)
        inv.quantity_on_hand = (inv.quantity_on_hand or 0) + quantity
        inv.save(update_fields=["quantity_on_hand", "updated_at"])
        movement = StockMovement.objects.create(
            product=product,
            batch=batch,
            warehouse=warehouse,
            location=location,
            movement_type=movement_type or "RECEIVE",
            quantity=quantity,
            reference=reference or "",
            notes=notes or "",
            created_by=user if getattr(user, "is_authenticated", False) else None,
        )
        movements.append(movement)
        return [inv], movements

    rows = (
        Inventory.objects.select_for_update()
        .filter(product=product, warehouse=warehouse)
        .order_by("batch__created_at", "id")
    )
    if location is not None:
        rows = rows.filter(location=location)
    if batch is not None:
        rows = rows.filter(batch=batch)

    remaining = quantity
    touched = []
    for inv in rows:
        available = (inv.quantity_on_hand or 0) - (inv.quantity_reserved or 0)
        if available <= 0:
            continue
        take = min(available, remaining)
        inv.quantity_on_hand = (inv.quantity_on_hand or 0) - take
        inv.save(update_fields=["quantity_on_hand", "updated_at"])
        movement = StockMovement.objects.create(
            product=product,
            batch=inv.batch,
            warehouse=warehouse,
            location=inv.location,
            movement_type=movement_type or "PICK",
            quantity=take,
            reference=reference or "",
            notes=notes or "",
            created_by=user if getattr(user, "is_authenticated", False) else None,
        )
        movements.append(movement)
        touched.append(inv)
        remaining -= take
        if remaining == 0:
            break

    if remaining > 0:
        raise ValidationError("Not enough available stock for that scan.")

    return touched, movements