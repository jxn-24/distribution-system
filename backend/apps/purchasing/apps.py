from django.apps import AppConfig


class PurchasingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.purchasing'

def ready(self):
    import apps.purchasing.signals  # noqa: F401
    
