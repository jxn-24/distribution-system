from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import GoodsReceiptItem
from apps.inventory.services import receive_stock
import logging
logger = logging.getLogger(__name__)

@receiver(post_save, sender=GoodsReceiptItem)
def on_goods_receipt_item_created(sender, instance, created, **kwargs):
    if not created:
        return  
    
    try:
        receipt = instance.goods_receipt
        receive_stock(
            product=instance.product,
            batch=instance.batch,
            warehouse=receipt.warehouse,
            location=instance.location,
            quantity=instance.quantity_received,
            reference=receipt.receipt_number,
            notes=f"Auto from Goods Receipt {receipt.receipt_number}",
            user=receipt.received_by,
        )
        logger.info(
            "Stock received: %s x %s for %s",
            instance.quantity_received,
            instance.product.sku,
            receipt.receipt_number,
        )
    except Exception:
        logger.exception("Failed to auto-receive stock for GoodsReceiptItem %s", instance.pk)
        raise
