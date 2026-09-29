from django.core.exceptions import ValidationError
from django.db import transaction

from .models import Inventory, StockMovement


@transaction.atomic
def apply_stock_scan(
    *,
    product,
    warehouse,
    quantity,
    direction,
    user,
    batch=None,
    location=None,
    movement_type=None,
    reference="",
    notes="",
):
    if quantity <= 0:
        raise ValidationError("Quantity must be greater than zero.")
    if batch and batch.product_id != product.id:
        raise ValidationError("The selected batch does not belong to this product.")
    if product.track_batches and batch is None:
        raise ValidationError("Select a batch for this batch-tracked product.")

    if direction == "in":
        movement_type = movement_type or "RECEIVE"
        inventory, _ = Inventory.objects.get_or_create(
            product=product,
            warehouse=warehouse,
            batch=batch,
            location=location,
            defaults={"quantity_on_hand": 0, "quantity_reserved": 0},
        )
        inventory = Inventory.objects.select_for_update().get(pk=inventory.pk)
        inventory.quantity_on_hand += quantity
        inventory.save(update_fields=["quantity_on_hand", "updated_at"])
        movement = StockMovement.objects.create(
            product=product,
            batch=batch,
            warehouse=warehouse,
            location=location,
            movement_type=movement_type,
            quantity=quantity,
            reference=reference,
            notes=notes,
            created_by=user,
        )
        return [inventory], [movement]

    movement_type = movement_type or "PICK"
    rows = Inventory.objects.select_for_update().filter(
        product=product,
        warehouse=warehouse,
    ).order_by("pk")
    if batch:
        rows = rows.filter(batch=batch)
    if location is not None:
        rows = rows.filter(location=location)

    locked_rows = list(rows)
    available = sum(row.quantity_available for row in locked_rows)
    if quantity > available:
        raise ValidationError(
            f"Not enough available stock for {product.sku}. "
            f"Available: {available}, requested: {quantity}."
        )

    remaining = quantity
    changed_rows = []
    movements = []
    for row in locked_rows:
        take = min(row.quantity_available, remaining)
        if take <= 0:
            continue
        row.quantity_on_hand -= take
        row.save(update_fields=["quantity_on_hand", "updated_at"])
        changed_rows.append(row)
        movements.append(StockMovement.objects.create(
            product=product,
            batch=row.batch,
            warehouse=warehouse,
            location=row.location,
            movement_type=movement_type,
            quantity=take,
            reference=reference,
            notes=notes,
            created_by=user,
        ))
        remaining -= take
        if remaining == 0:
            break

    return changed_rows, movements
