from django.core.exceptions import ValidationError
from django.test import TestCase

from apps.inventory.models import Inventory, Product, StockMovement, Warehouse
from apps.inventory.scan_services import apply_stock_scan
from apps.users.models import User


class StockScanServiceTests(TestCase):
	def setUp(self):
		self.user = User.objects.create_user(username="warehouse-test", password="test-password")
		self.warehouse = Warehouse.objects.create(name="Main", code="MAIN")
		self.product = Product.objects.create(sku="SCAN-001", name="Scannable product", track_batches=False)

	def test_receive_updates_count_and_creates_movement(self):
		rows, movements = apply_stock_scan(
			product=self.product,
			warehouse=self.warehouse,
			quantity=5,
			direction="in",
			user=self.user,
			reference="GR-100",
		)

		self.assertEqual(rows[0].quantity_on_hand, 5)
		self.assertEqual(rows[0].quantity_available, 5)
		self.assertEqual(movements[0].movement_type, "RECEIVE")
		self.assertEqual(movements[0].reference, "GR-100")
		self.assertEqual(movements[0].created_by, self.user)

	def test_dispense_rejects_quantity_above_available_without_partial_changes(self):
		Inventory.objects.create(
			product=self.product,
			warehouse=self.warehouse,
			quantity_on_hand=5,
			quantity_reserved=2,
		)

		with self.assertRaises(ValidationError):
			apply_stock_scan(
				product=self.product,
				warehouse=self.warehouse,
				quantity=4,
				direction="out",
				user=self.user,
			)

		inventory = Inventory.objects.get(product=self.product, warehouse=self.warehouse)
		self.assertEqual(inventory.quantity_on_hand, 5)
		self.assertEqual(StockMovement.objects.count(), 0)

	def test_dispense_updates_stock_and_audits_movement(self):
		Inventory.objects.create(
			product=self.product,
			warehouse=self.warehouse,
			quantity_on_hand=5,
			quantity_reserved=2,
		)

		rows, movements = apply_stock_scan(
			product=self.product,
			warehouse=self.warehouse,
			quantity=2,
			direction="out",
			movement_type="PICK",
			user=self.user,
		)

		self.assertEqual(rows[0].quantity_on_hand, 3)
		self.assertEqual(rows[0].quantity_available, 1)
		self.assertEqual(movements[0].quantity, 2)
		self.assertEqual(movements[0].movement_type, "PICK")
