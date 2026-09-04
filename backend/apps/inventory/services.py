from django.db import transaction
from django.core.exceptions import ValidationError
from .models import Inventory, StockMovement, Product, Batch, Warehouse, StockLocation

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

    inv = _get_or_create_inventory(product, batch, warehouse, location)

    available = inv.quantity_on_hand - inv.quantity_reserved
    if quantity > available:
        raise ValidationError(
            f"Not enough stock to reserve. Available: {available}, requested: {quantity}"
        )

    inv.quantity_reserved += quantity
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
    return inv

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

    inv = _get_or_create_inventory(product, batch, warehouse, location)

    inv.quantity_reserved = max(0, inv.quantity_reserved - quantity)
    inv.save(update_fields=["quantity_reserved", "updated_at"])

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
    return inv

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
    """Ship stock: reduce on-hand and reserved.Used when a shipment is created/confirmed."""
    if quantity <= 0:
        raise ValidationError("Ship quantity must be positive.")

    inv = _get_or_create_inventory(product, batch, warehouse, location)

    if quantity > inv.quantity_reserved:
        raise ValidationError(
            f"Not enough reserved stock to ship. On hand: {inv.quantity_on_hand}"
        )

    inv.quantity_on_hand -= quantity
    inv.quantity_reserved -= quantity
    inv.save(update_fields=["quantity_on_hand", "quantity_reserved", "updated_at"])

    StockMovement.objects.create(
        product=product,
        batch=batch,
        warehouse=warehouse,
        location=location,
        movement_type="SHIP",
        quantity=quantity,
        reference=reference,
        notes=notes,
        created_by=user,
    )
    return inv