from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Account
from django.contrib.auth.hashers import check_password, make_password
from django.db.models import Count
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import (
    AccountSerializer, ProfileSerializer, ProfileUpdateSerializer,
    PasswordChangeSerializer, AdminUserSerializer,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.conf import settings
from .permissions import IsAdmin


# =====================
# ===================== Login View
# =====================
class LoginView(APIView):
    authentication_classes = []
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        try:
            user = Account.objects.get(email=email)
        except Account.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if not check_password(password, user.password):
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        
        refresh = RefreshToken()
        refresh["user_id"] = user.id
        refresh.set_exp()
        
        res = Response()
        res.set_cookie(
            key="access_token",
            value=str(refresh.access_token),
            httponly=True,
            secure=False,
            samesite="Lax"
        )

        res.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=False,
            samesite="Lax"
        )

        res.data = {"message": "Login successful"}
        return res



# =====================
# ===================== Register View
# =====================
class RegisterView(APIView):
    def post(self, request):
        serializer = AccountSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Registration successful"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# =====================
# ===================== Profile View (get + update own details + avatar)
# =====================
class profileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get(self, request):
        serializer = ProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            request.user, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        out = ProfileSerializer(request.user, context={'request': request})
        return Response(out.data, status=status.HTTP_200_OK)

    def put(self, request):
        return self.patch(request)


# =====================
# ===================== Change Password View
# =====================
class PasswordChangeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = request.user
        if not check_password(serializer.validated_data['old_password'], user.password):
            return Response({"old_password": ["Wrong password."]},
                            status=status.HTTP_400_BAD_REQUEST)
        user.password = make_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password', 'updated_at'])
        return Response({"message": "Password updated successfully"},
                        status=status.HTTP_200_OK)


# =====================
# ===================== Admin Dashboard Views
# =====================
class AdminStatsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from designer.models import Designe, Colors
        total_users = Account.objects.count()
        total_admins = Account.objects.filter(is_admin=True).count()
        total_designs = Designe.objects.count()
        total_colors = Colors.objects.count()
        recent_users = AdminUserSerializer(
            Account.objects.order_by('-created_at')[:8],
            many=True, context={'request': request}).data
        designs_per_user = list(
            Account.objects.annotate(total_designs=Count('designe'))
            .order_by('-total_designs').values('id', 'email', 'name', 'total_designs')[:10]
        )
        from designer.serializers import DesignSerializer as _DS
        recent_designs = _DS(
            Designe.objects.select_related('user').order_by('-updated_at')[:8],
            many=True, context={'request': request}).data
        return Response({
            "totals": {
                "users": total_users,
                "admins": total_admins,
                "designs": total_designs,
                "colors": total_colors,
            },
            "recent_users": recent_users,
            "recent_designs": recent_designs,
            "designs_per_user": designs_per_user,
        }, status=status.HTTP_200_OK)


# =====================
# ===================== Admin Design + Color Views (full access to all users' files)
# =====================
class AdminDesignListView(APIView):
    """List EVERY user's designs. Filters: ?user_id=<id>&search=<name>."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from designer.models import Designe
        from designer.serializers import DesignSerializer
        qs = Designe.objects.select_related('user').order_by('-updated_at')
        user_id = request.query_params.get('user_id')
        if user_id:
            qs = qs.filter(user_id=user_id)
        search = request.query_params.get('search')
        if search:
            qs = qs.filter(name__icontains=search)
        serializer = DesignSerializer(qs[:200], many=True,
                                      context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminDesignDetailView(APIView):
    """View / simulate (GET), edit (PUT/PATCH) or delete any user's design."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def _get_design(self, pk):
        from designer.models import Designe
        try:
            return Designe.objects.select_related('user').get(pk=pk)
        except Designe.DoesNotExist:
            return None

    def get(self, request, pk):
        from designer.serializers import DesignSerializer
        design = self._get_design(pk)
        if design is None:
            return Response({"error": "Design not found"},
                            status=status.HTTP_404_NOT_FOUND)
        serializer = DesignSerializer(design, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk, partial):
        from designer.serializers import DesignSerializer
        design = self._get_design(pk)
        if design is None:
            return Response({"error": "Design not found"},
                            status=status.HTTP_404_NOT_FOUND)
        serializer = DesignSerializer(design, data=request.data,
                                      partial=partial,
                                      context={'request': request})
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        design = self._get_design(pk)
        if design is None:
            return Response({"error": "Design not found"},
                            status=status.HTTP_404_NOT_FOUND)
        design.delete()
        return Response({"message": "Design deleted"}, status=status.HTTP_200_OK)


class AdminColorListView(APIView):
    """List EVERY user's colors. Filter: ?user_id=<id>."""
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        from designer.models import Colors
        from designer.serializers import ColorsSerializer
        qs = Colors.objects.select_related('user').order_by('-created_at')
        user_id = request.query_params.get('user_id')
        if user_id:
            qs = qs.filter(user_id=user_id)
        serializer = ColorsSerializer(qs[:200], many=True,
                                      context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminUserListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        users = (Account.objects
                 .annotate(total_designs=Count('designe', distinct=True),
                           total_colors=Count('colors', distinct=True))
                 .order_by('-created_at'))
        serializer = AdminUserSerializer(users, many=True,
                                         context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)


class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def _get_user(self, pk):
        try:
            return Account.objects.get(pk=pk)
        except Account.DoesNotExist:
            return None

    def patch(self, request, pk):
        user = self._get_user(pk)
        if user is None:
            return Response({"error": "User not found"},
                            status=status.HTTP_404_NOT_FOUND)
        # Allow toggling is_admin / is_active only (email stays immutable here)
        for field in ('is_admin', 'is_active', 'name', 'phone'):
            if field in request.data:
                setattr(user, field, request.data[field] in
                        (True, 'true', 'True', '1', 1) if field.startswith('is_')
                        else request.data[field])
        user.save()
        serializer = AdminUserSerializer(user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        user = self._get_user(pk)
        if user is None:
            return Response({"error": "User not found"},
                            status=status.HTTP_404_NOT_FOUND)
        if user.id == request.user.id:
            return Response({"error": "You cannot delete your own admin account."},
                            status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response({"message": "User deleted"}, status=status.HTTP_200_OK)
    


# =====================
# ===================== Obtain Refresh Token View
# =====================
class CookieTokenObtainView(APIView):
    authentication_classes = []
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"error": "Refresh token not found"}, status=status.HTTP_401_UNAUTHORIZED)
        
        try:
            refresh = RefreshToken(refresh_token)
            user_id = refresh.get("user_id")

            if not user_id:
                return Response({"error": "Invalid token payload"}, status=status.HTTP_401_UNAUTHORIZED)
            
            access = refresh.access_token

            response = Response({'access': str(access)}, status=status.HTTP_200_OK)
            response.set_cookie(
                key="access_token",
                value=str(access),
                httponly=True,
                secure=False,
                samesite="Lax"
            )
            return response

        except (TokenError, InvalidToken):
            return Response({"error": "Invalid or expired refresh token"}, status=status.HTTP_401_UNAUTHORIZED)



# =====================
# ===================== Logout View
# =====================
class LogoutView(APIView):
    def post(self, request):
        response = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")

        return response