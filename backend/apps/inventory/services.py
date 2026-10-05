from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Inventory, StockMovement

def _get_or_create_inventory(product, batch, warehouse, location=None):
    inv, _ = Inventory.objects.get_or_create(
        product=product,
        batch=batch,
        warehouse=warehouse,
        location=location,
        defaults={
            "quantity_on_hand": 0,
            "quantity_reserved": 0,
        },
    )
    return inv

@transaction.atomic
def receive_stock(
    *,
    product,
    warehouse,
    quantity,
    batch=None,
    location=None,
    reference=None,
    notes=None,
    user=None,
):
    """Increase on-hand stock and write a RECEIVE movement."""
    if quantity <= 0:
        raise ValidationError("Receive quantity must be positive.")

    inv = _get_or_create_inventory(product, batch, warehouse, location)
    inv.quantity_on_hand += quantity
    inv.save(update_fields=["quantity_on_hand", "updated_at"])

    StockMovement.objects.create(
        product=product,
        batch=batch,
        warehouse=warehouse,
        location=location,
        movement_type="RECEIVE",
        quantity=quantity,
        reference=reference,
        notes=notes,
        created_by=user,
    )
    return inv

@transaction.atomic
def reserve_stock(
    *,
    product,
    warehouse,
    quantity,
    batch=None,
    location=None,
    reference=None,
    user=None,
):
    """Reserve stock for a sales order (does not reduce on-hand)."""
    if quantity <= 0:
        raise ValidationError("Reserve quantity must be positive.")

    # Sum available across locations for this product/batch/warehouse
    invs = Inventory.objects.filter(
        product=product,
        warehouse=warehouse,
        batch=batch,
    )
    if not invs.exists():
        # Create a default row so we can show a clear error
        inv = _get_or_create_inventory(product, batch, warehouse, location)
        available = 0
    else:
        available = sum(i.quantity_on_hand - i.quantity_reserved for i in invs)

    if quantity > available:
        raise ValidationError(
            f"Not enough stock to reserve for {product.sku}. "
            f"Available: {available}, requested: {quantity}"
        )

    # Reserve from the first inventory row that has availability
    remaining = quantity
    for inv in invs:
        free = inv.quantity_on_hand - inv.quantity_reserved
        if free <= 0:
            continue
        take = min(free, remaining)
        inv.quantity_reserved += take
        inv.save(update_fields=["quantity_reserved", "updated_at"])
        remaining -= take
        if remaining == 0:
            break

    if remaining > 0:
        # Fallback single row
        inv = _get_or_create_inventory(product, batch, warehouse, location)
        inv.quantity_reserved += remaining
        inv.save(update_fields=["quantity_reserved", "updated_at"])

    StockMovement.objects.create(
        product=product,
        batch=batch,
        warehouse=warehouse,
        location=location,
        movement_type="RESERVE",
        quantity=quantity,
        reference=reference,
        created_by=user,
    )
    return True

@transaction.atomic
def release_reservation(
    *,
    product,
    warehouse,
    quantity,
    batch=None,
    location=None,
    reference=None,
    user=None,
):
    """Release previously reserved stock (e.g. order cancelled)."""
    if quantity <= 0:
        raise ValidationError("Release quantity must be positive.")

    invs = Inventory.objects.filter(
        product=product,
        warehouse=warehouse,
        batch=batch,
    )
    remaining = quantity
    for inv in invs:
        if inv.quantity_reserved <= 0:
            continue
        take = min(inv.quantity_reserved, remaining)
        inv.quantity_reserved -= take
        inv.save(update_fields=["quantity_reserved", "updated_at"])
        remaining -= take
        if remaining == 0:
            break

    StockMovement.objects.create(
        product=product,
        batch=batch,
        warehouse=warehouse,
        location=location,
        movement_type="RELEASE",
        quantity=quantity,
        reference=reference,
        created_by=user,
    )
    return True

def allocate_fifo(product, warehouse, quantity):
    """Return [(batch, qty), ...] oldest batch first. Does not save."""
    remaining = int(quantity)
    if remaining <= 0:
        raise ValidationError("Quantity must be greater than zero.")

    rows = (
        Inventory.objects.filter(
            product=product,
            warehouse=warehouse,
            quantity_on_hand__gt=0,
        )
        .select_related("batch")
        .order_by("batch__created_at", "id")
    )
    plan = []
    for row in rows:
        take = min(row.quantity_on_hand, remaining)
        if take <= 0:
            continue
        plan.append((row.batch, take))
        remaining -= take
        if remaining == 0:
            break
    if remaining > 0:
        raise ValidationError(
            f"Not enough stock to ship {quantity} of {product.sku}. Short by {remaining}."
        )
    return plan

@transaction.atomic
def ship_stock(
    *,
    product,
    warehouse,
    quantity,
    batch=None,
    location=None,
    reference=None,
    notes=None,
    user=None,
):
    """Ship stock from a chosen batch, or oldest batch first if batch is None."""
    if quantity <= 0:
        raise ValidationError("Ship quantity must be positive.")

    rows = Inventory.objects.select_for_update().filter(
        product=product,
        warehouse=warehouse,
    )
    if batch is not None:
        rows = rows.filter(batch=batch)
    rows = list(rows.select_related("batch").order_by("batch__created_at", "id"))

    total_on_hand = sum(i.quantity_on_hand for i in rows)
    if quantity > total_on_hand:
        raise ValidationError(
            f"Not enough on-hand stock to ship for {product.sku}. "
            f"On hand: {total_on_hand}, requested: {quantity}"
        )

    remaining = quantity
    for inv in rows:
        if inv.quantity_on_hand <= 0:
            continue
        take = min(inv.quantity_on_hand, remaining)
        inv.quantity_on_hand -= take
        inv.quantity_reserved = max(0, inv.quantity_reserved - take)
        inv.save(update_fields=["quantity_on_hand", "quantity_reserved", "updated_at"])
        StockMovement.objects.create(
            product=product,
            batch=inv.batch,
            warehouse=warehouse,
            location=inv.location or location,
            movement_type="SHIP",
            quantity=take,
            reference=reference,
            notes=notes,
            created_by=user,
        )
        remaining -= take
        if remaining == 0:
            break

    if remaining > 0:
        raise ValidationError(f"Could not ship full quantity for {product.sku}.")
    return True