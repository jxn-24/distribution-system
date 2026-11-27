from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import Feedback
from .serializers import FeedbackSubmitSerializer, TestimonialSerializer

THANK_YOU = {"detail": "Thank you for your feedback."}

# How many testimonials the website shows at most.
TESTIMONIAL_LIMIT = 12


class FeedbackSubmitView(APIView):
    """POST /api/public/feedback/ — no login. Saves feedback and returns only a thank-you."""

    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "feedback"

    def post(self, request):
        serializer = FeedbackSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Honeypot filled in: a bot. Answer exactly like a success so it learns nothing, but save nothing.
        if not serializer.is_bot():
            serializer.save()
        return Response(THANK_YOU, status=status.HTTP_201_CREATED)


class TestimonialListView(generics.ListAPIView):
    """GET /api/public/testimonials/ — approved AND consented feedback only."""

    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    serializer_class = TestimonialSerializer
    pagination_class = None

    def get_queryset(self):
        return Feedback.public().order_by("-approved_at", "-created_at")[:TESTIMONIAL_LIMIT]
