from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from . import lockout
from .serializers import LoginSerializer, UserSerializer


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        username = str(request.data.get("username", ""))

        locked_for = lockout.seconds_locked(username)
        if locked_for:
            return self._locked_response(locked_for)

        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            if username:
                lockout.record_failure(username)
                locked_for = lockout.seconds_locked(username)
                if locked_for:
                    return self._locked_response(locked_for)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data["user"]
        lockout.clear(username)
        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSerializer(user).data
        }, status=status.HTTP_200_OK)

    @staticmethod
    def _locked_response(seconds):
        minutes = max(1, -(-seconds // 60))
        return Response(
            {"detail": f"Too many failed sign-in attempts. Try again in {minutes} minute{'s' if minutes != 1 else ''}."},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
            headers={"Retry-After": str(seconds)},
        )


class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
