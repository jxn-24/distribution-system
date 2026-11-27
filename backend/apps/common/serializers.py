import re

from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email
from rest_framework import serializers

from .models import MESSAGE_MAX_LENGTH, Feedback

PHONE_RE = re.compile(r"^\+?[0-9][0-9 ()-]{6,19}$")

# Name of the hidden form field that people never see and bots fill in.
HONEYPOT_FIELD = "website"


class FeedbackSubmitSerializer(serializers.Serializer):
    """What the public feedback form may send. Source, approval and display name are never client-controlled."""

    name = serializers.CharField(max_length=100, trim_whitespace=True)
    business_name = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    contact = serializers.CharField(max_length=150, required=False, allow_blank=True, default="")
    message = serializers.CharField(max_length=MESSAGE_MAX_LENGTH, min_length=2)
    rating = serializers.IntegerField(min_value=1, max_value=5, required=False, allow_null=True, default=None)
    consent_to_publish = serializers.BooleanField(required=False, default=False)
    website = serializers.CharField(required=False, allow_blank=True, default="", max_length=500)

    def validate_contact(self, value):
        value = value.strip()
        if not value:
            return value
        if "@" in value:
            try:
                validate_email(value)
            except DjangoValidationError:
                raise serializers.ValidationError("Enter a valid email address or phone number.")
            return value
        if not PHONE_RE.match(value):
            raise serializers.ValidationError("Enter a valid email address or phone number.")
        return value

    def is_bot(self):
        return bool(self.validated_data.get(HONEYPOT_FIELD, "").strip())

    def create(self, validated_data):
        validated_data.pop(HONEYPOT_FIELD, None)
        return Feedback.objects.create(source=Feedback.Source.WEBSITE, **validated_data)


class TestimonialSerializer(serializers.ModelSerializer):
    """Public view of approved, consented feedback. No contact details, ever."""

    display_name = serializers.CharField(source="public_name")
    source = serializers.CharField(source="get_source_display")

    class Meta:
        model = Feedback
        fields = ("display_name", "message", "rating", "source")
