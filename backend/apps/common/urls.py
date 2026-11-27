from django.urls import path

from .views import FeedbackSubmitView, TestimonialListView

urlpatterns = [
    path("feedback/", FeedbackSubmitView.as_view(), name="public-feedback"),
    path("testimonials/", TestimonialListView.as_view(), name="public-testimonials"),
]
