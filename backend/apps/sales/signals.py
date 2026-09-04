from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import SalesOrder
from apps.inventory.services import reserve_stock, release_reservation

@receiver(pre_save, sender=SalesOrder)
def remember_old_status(sender, instance, **kwargs):
    if instance.pk:
        try:
            old = SalesOrder.objects.get(pk=instance.pk)
            instance._old_status = old.status
        except SalesOrder.DoesNotExist:
            instance._old_status = None
    else:
        instance._old_status = None

@receiver(post_save, sender=SalesOrder)
def handle_sales_order_status_change(sender, instance, created, **kwargs):
    old_status = getattr(instance, "_old_status", None)
    new_status = instance.status

    if new_status == "CONFIRMED" and old_status != "CONFIRMED":
        for item in instance.items.all():
            reserve_stock(
                product=item.product,
                batch=item.batch,
                warehouse=instance.warehouse,
                quantity=item.quantity,
                reference=instance.order_number,
                user=instance.created_by,
            )
            item.quantity_reserved = item.quantity
            item.save(update_fields=["quantity_reserved"])

    if new_status == "CANCELLED" and old_status == "CONFIRMED":
        for item in instance.items.all():
            if item.quantity_reserved > 0:
                release_reservation(
                    product=item.product,
                    batch=item.batch,
                    warehouse=instance.warehouse,
                    quantity=item.quantity_reserved,
                    reference=instance.order_number,
                    user=instance.created_by,
                )
                item.quantity_reserved = 0
                item.save(update_fields=["quantity_reserved"])