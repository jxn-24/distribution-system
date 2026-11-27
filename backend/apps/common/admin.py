from django import forms
from django.contrib import admin, messages
from django.utils import timezone

from .models import Feedback


class FeedbackAdminForm(forms.ModelForm):
    class Meta:
        model = Feedback
        fields = "__all__"

    def clean(self):
        cleaned = super().clean()
        source = cleaned.get("source")
        if (
            cleaned.get("consent_to_publish")
            and source
            and source != Feedback.Source.WEBSITE
            and not (cleaned.get("permission_note") or "").strip()
        ):
            self.add_error(
                "permission_note",
                "Feedback from social media can only be marked as consented once you note how the "
                "person gave permission to show it.",
            )
        return cleaned


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    form = FeedbackAdminForm
    list_display = (
        "name",
        "business_name",
        "source",
        "rating",
        "consent_to_publish",
        "is_approved",
        "shown_on_website",
        "created_at",
    )
    list_filter = ("is_approved", "consent_to_publish", "source", "rating", "created_at")
    search_fields = ("name", "business_name", "display_name", "contact", "message")
    readonly_fields = ("created_at", "approved_by", "approved_at")
    date_hierarchy = "created_at"
    actions = ("approve_selected", "unapprove_selected")
    fieldsets = (
        ("From", {"fields": ("name", "business_name", "contact", "source")}),
        ("Feedback", {"fields": ("message", "rating")}),
        (
            "Permission to publish",
            {
                "description": (
                    "A message appears on the website only when it is approved AND the person consented. "
                    "For feedback copied from social media, ask the person first and record how they agreed."
                ),
                "fields": ("consent_to_publish", "permission_note", "display_name"),
            },
        ),
        ("Approval", {"fields": ("is_approved", "approved_by", "approved_at", "created_at")}),
    )

    @admin.display(boolean=True, description="On website")
    def shown_on_website(self, obj):
        return obj.is_approved and obj.consent_to_publish

    def save_model(self, request, obj, form, change):
        if obj.is_approved and not obj.approved_at:
            obj.approved_by = request.user
            obj.approved_at = timezone.now()
        elif not obj.is_approved:
            obj.approved_by = None
            obj.approved_at = None
        super().save_model(request, obj, form, change)

    @admin.action(description="Approve selected feedback")
    def approve_selected(self, request, queryset):
        pending = queryset.filter(is_approved=False)
        without_consent = pending.filter(consent_to_publish=False).count()
        count = pending.update(is_approved=True, approved_by=request.user, approved_at=timezone.now())
        self.message_user(request, f"Approved {count} item{'s' if count != 1 else ''}.", messages.SUCCESS)
        if without_consent:
            self.message_user(
                request,
                f"{without_consent} of them {'has' if without_consent == 1 else 'have'} no consent to publish, "
                "so they will not appear on the website.",
                messages.WARNING,
            )

    @admin.action(description="Remove approval from selected feedback")
    def unapprove_selected(self, request, queryset):
        count = queryset.filter(is_approved=True).update(is_approved=False, approved_by=None, approved_at=None)
        self.message_user(request, f"Removed approval from {count} item{'s' if count != 1 else ''}.", messages.SUCCESS)
