from django.contrib.admin.sites import AdminSite
from django.core.cache import cache
from django.test import RequestFactory, TestCase, override_settings
from rest_framework.test import APIClient

from apps.users.models import User

from .admin import FeedbackAdmin, FeedbackAdminForm
from .models import Feedback

FEEDBACK_URL = "/api/public/feedback/"
TESTIMONIALS_URL = "/api/public/testimonials/"


def valid_payload(**overrides):
    data = {
        "name": "Amina W.",
        "business_name": "Amina Mini Mart",
        "contact": "+254 700 000 000",
        "message": "The pads sell well in my shop.",
        "rating": 5,
        "consent_to_publish": True,
    }
    data.update(overrides)
    return data


class PublicApiTestCase(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()

    def submit(self, ip="10.1.0.1", **overrides):
        return self.client.post(FEEDBACK_URL, valid_payload(**overrides), format="json", REMOTE_ADDR=ip)


class FeedbackSubmitTests(PublicApiTestCase):
    def test_saves_feedback_without_login_and_echoes_nothing_back(self):
        response = self.submit()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), {"detail": "Thank you for your feedback."})

        feedback = Feedback.objects.get()
        self.assertEqual(feedback.name, "Amina W.")
        self.assertEqual(feedback.contact, "+254 700 000 000")
        self.assertEqual(feedback.rating, 5)
        self.assertTrue(feedback.consent_to_publish)
        self.assertEqual(feedback.source, Feedback.Source.WEBSITE)
        self.assertFalse(feedback.is_approved)

    def test_optional_fields_can_be_left_out(self):
        response = self.client.post(
            FEEDBACK_URL, {"name": "Juma", "message": "Good products."}, format="json", REMOTE_ADDR="10.1.0.2"
        )
        self.assertEqual(response.status_code, 201)
        feedback = Feedback.objects.get()
        self.assertIsNone(feedback.rating)
        self.assertFalse(feedback.consent_to_publish)
        self.assertEqual(feedback.contact, "")

    def test_client_cannot_approve_or_set_source_or_display_name(self):
        self.submit(is_approved=True, source="instagram", display_name="Fake", approved_by=1)
        feedback = Feedback.objects.get()
        self.assertFalse(feedback.is_approved)
        self.assertEqual(feedback.source, Feedback.Source.WEBSITE)
        self.assertEqual(feedback.display_name, "")
        self.assertIsNone(feedback.approved_by)

    def test_an_invalid_token_does_not_block_the_public_form(self):
        self.client.credentials(HTTP_AUTHORIZATION="Bearer not-a-real-token")
        self.assertEqual(self.submit().status_code, 201)


class FeedbackValidationTests(PublicApiTestCase):
    def assertRejected(self, field, **overrides):
        response = self.submit(**overrides)
        self.assertEqual(response.status_code, 400)
        self.assertIn(field, response.json())
        self.assertFalse(Feedback.objects.exists())

    def test_name_is_required(self):
        self.assertRejected("name", name="")

    def test_whitespace_only_name_is_rejected(self):
        self.assertRejected("name", name="   ")

    def test_name_longer_than_100_is_rejected(self):
        self.assertRejected("name", name="x" * 101)

    def test_business_name_longer_than_150_is_rejected(self):
        self.assertRejected("business_name", business_name="x" * 151)

    def test_message_is_required(self):
        self.assertRejected("message", message="")

    def test_message_of_1000_characters_is_accepted(self):
        self.assertEqual(self.submit(message="x" * 1000).status_code, 201)

    def test_message_longer_than_1000_is_rejected(self):
        self.assertRejected("message", message="x" * 1001)

    def test_rating_below_1_is_rejected(self):
        self.assertRejected("rating", rating=0)

    def test_rating_above_5_is_rejected(self):
        self.assertRejected("rating", rating=6)

    def test_rating_must_be_a_number(self):
        self.assertRejected("rating", rating="great")

    def test_contact_accepts_email(self):
        self.assertEqual(self.submit(contact="amina@example.com").status_code, 201)

    def test_contact_rejects_text_that_is_neither_phone_nor_email(self):
        self.assertRejected("contact", contact="call me maybe")

    def test_contact_rejects_bad_email(self):
        self.assertRejected("contact", contact="amina@")

    def test_contact_longer_than_150_is_rejected(self):
        self.assertRejected("contact", contact=("a" * 145) + "@x.com")

    def test_null_characters_are_rejected(self):
        self.assertRejected("message", message="hello\x00there")


class FeedbackHoneypotTests(PublicApiTestCase):
    def test_filled_honeypot_saves_nothing_but_looks_like_success(self):
        response = self.submit(website="http://spam.example")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json(), {"detail": "Thank you for your feedback."})
        self.assertFalse(Feedback.objects.exists())

    def test_empty_honeypot_is_fine(self):
        self.assertEqual(self.submit(website="").status_code, 201)
        self.assertEqual(Feedback.objects.count(), 1)


class FeedbackThrottleTests(PublicApiTestCase):
    def test_fourth_submission_in_an_hour_from_one_ip_is_throttled(self):
        for _ in range(3):
            self.assertEqual(self.submit(ip="10.2.0.1").status_code, 201)
        response = self.submit(ip="10.2.0.1")
        self.assertEqual(response.status_code, 429)
        self.assertEqual(Feedback.objects.count(), 3)

    def test_throttle_is_per_ip(self):
        for _ in range(3):
            self.submit(ip="10.2.0.2")
        self.assertEqual(self.submit(ip="10.2.0.3").status_code, 201)

    def test_throttle_does_not_apply_to_testimonials(self):
        for _ in range(3):
            self.submit(ip="10.2.0.4")
        response = self.client.get(TESTIMONIALS_URL, REMOTE_ADDR="10.2.0.4")
        self.assertEqual(response.status_code, 200)


class TestimonialTests(PublicApiTestCase):
    def make(self, **fields):
        data = {
            "name": "Person",
            "contact": "person@example.com",
            "business_name": "Private Shop",
            "message": "Message",
            "rating": 4,
            "consent_to_publish": True,
            "is_approved": True,
        }
        data.update(fields)
        return Feedback.objects.create(**data)

    def names(self):
        response = self.client.get(TESTIMONIALS_URL)
        self.assertEqual(response.status_code, 200)
        return [item["display_name"] for item in response.json()]

    def test_no_feedback_returns_an_empty_list(self):
        self.assertEqual(self.names(), [])

    def test_only_approved_and_consented_items_appear(self):
        self.make(name="Shown")
        self.make(name="Unapproved", is_approved=False)
        self.make(name="No consent", consent_to_publish=False)
        self.make(name="Neither", is_approved=False, consent_to_publish=False)
        self.assertEqual(self.names(), ["Shown"])

    def test_returns_only_public_fields_and_never_contact_details(self):
        self.make(name="Amina", display_name="Amina, Thika", source=Feedback.Source.INSTAGRAM)
        (item,) = self.client.get(TESTIMONIALS_URL).json()
        self.assertEqual(set(item), {"display_name", "message", "rating", "source"})
        self.assertEqual(item["display_name"], "Amina, Thika")
        self.assertEqual(item["source"], "Instagram")
        body = self.client.get(TESTIMONIALS_URL).content.decode()
        self.assertNotIn("person@example.com", body)
        self.assertNotIn("Private Shop", body)

    def test_display_name_falls_back_to_name(self):
        self.make(name="Juma")
        self.assertEqual(self.names(), ["Juma"])

    def test_submitted_feedback_does_not_appear_until_approved(self):
        self.submit()
        self.assertEqual(self.names(), [])


class FeedbackAdminTests(TestCase):
    def setUp(self):
        self.admin_user = User.objects.create_superuser(username="boss", password="pw-123456789", email="b@example.com")
        self.model_admin = FeedbackAdmin(Feedback, AdminSite())
        self.request = RequestFactory().post("/admin/")
        self.request.user = self.admin_user
        self.request._messages = _Messages()

    def test_approve_action_records_who_and_when(self):
        item = Feedback.objects.create(name="A", message="Hi", consent_to_publish=True)
        self.model_admin.approve_selected(self.request, Feedback.objects.all())
        item.refresh_from_db()
        self.assertTrue(item.is_approved)
        self.assertEqual(item.approved_by, self.admin_user)
        self.assertIsNotNone(item.approved_at)

    def test_social_media_consent_needs_a_permission_note(self):
        data = {"name": "A", "message": "Hi", "source": "instagram", "consent_to_publish": True, "permission_note": ""}
        form = FeedbackAdminForm(data=data)
        self.assertFalse(form.is_valid())
        self.assertIn("permission_note", form.errors)

        data["permission_note"] = "Asked by Instagram DM; they agreed."
        self.assertTrue(FeedbackAdminForm(data=data).is_valid())


class _Messages:
    """Minimal message store so admin actions can call message_user in tests."""

    def __init__(self):
        self.items = []

    def add(self, level, message, extra_tags=""):
        self.items.append(message)
