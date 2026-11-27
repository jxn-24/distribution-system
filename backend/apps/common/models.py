from django.conf import settings
from django.core.validators import MaxLengthValidator, MaxValueValidator, MinValueValidator
from django.db import models

MESSAGE_MAX_LENGTH = 1000


class Feedback(models.Model):
    """Customer feedback from the website form, or added by staff from social media.

    A message is shown on the public site only when it is BOTH approved by staff
    and the person consented to it being published (see Feedback.public()).
    """

    class Source(models.TextChoices):
        WEBSITE = "website", "Website"
        INSTAGRAM = "instagram", "Instagram"
        FACEBOOK = "facebook", "Facebook"
        TIKTOK = "tiktok", "TikTok"
        WHATSAPP = "whatsapp", "WhatsApp"
        OTHER = "other", "Other"

    name = models.CharField(max_length=100)
    business_name = models.CharField(max_length=150, blank=True)
    contact = models.CharField(
        "phone or email",
        max_length=150,
        blank=True,
        help_text="Private. Used only to reply; never shown on the website.",
    )
    message = models.TextField(max_length=MESSAGE_MAX_LENGTH, validators=[MaxLengthValidator(MESSAGE_MAX_LENGTH)])
    rating = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    consent_to_publish = models.BooleanField(
        default=False,
        help_text="The person agreed to their name and message being shown on the website.",
    )
    source = models.CharField(max_length=20, choices=Source.choices, default=Source.WEBSITE)
    permission_note = models.TextField(
        blank=True,
        help_text=(
            "For feedback added from social media: how and when the person gave permission to "
            "show it, e.g. \"Asked by Instagram DM on 3 Dec 2026; they agreed.\""
        ),
    )
    is_approved = models.BooleanField(default=False)
    display_name = models.CharField(
        max_length=100,
        blank=True,
        help_text="Name shown on the website. Leave blank to use the name above.",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_feedback",
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "feedback"
        verbose_name_plural = "feedback"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(rating__isnull=True) | models.Q(rating__gte=1, rating__lte=5),
                name="feedback_rating_1_to_5",
            ),
        ]

    def __str__(self):
        return f"{self.name} ({self.get_source_display()}, {self.created_at:%d %b %Y})" if self.created_at else self.name

    @property
    def public_name(self):
        return self.display_name.strip() or self.name

    @classmethod
    def public(cls):
        """Only feedback that is approved AND consented. The one query the website may use."""
        return cls.objects.filter(is_approved=True, consent_to_publish=True)
