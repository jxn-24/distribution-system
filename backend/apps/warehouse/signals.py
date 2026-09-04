from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ShipmentItem
from apps.inventory.services import ship_stock

@receiver(post_save, sender=ShipmentItem)
def on_shipment_item_created(sender, instance, created, **kwargs):
    if not created:
        return
    shipment = instance.shipment
    ship_stock(
        product=instance.product,
        batch=instance.batch,
        warehouse=shipment.warehouse,
        quantity=instance.quantity,
        reference=shipment.shipment_number,
        notes=f"Auto from Shipment {shipment.shipment_number}",
        user=shipment.created_by,
    )