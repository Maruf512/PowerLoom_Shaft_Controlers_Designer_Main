from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import Account



class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'email', 'name', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


def _avatar_url(account, request):
    if not account.avatar:
        return None
    try:
        url = account.avatar.url
    except Exception:
        return None
    if request is None:
        return url
    try:
        return request.build_absolute_uri(url)
    except Exception:
        return url


class ProfileSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = ['id', 'email', 'name', 'phone', 'avatar_url',
                  'is_admin', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'email', 'avatar_url', 'is_admin',
                            'is_active', 'created_at', 'updated_at']

    def get_avatar_url(self, obj):
        return _avatar_url(obj, self.context.get('request'))


class ProfileUpdateSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Account
        fields = ['name', 'phone', 'avatar']
        extra_kwargs = {
            'name': {'required': False},
            'phone': {'required': False},
        }

    def validate_name(self, value):
        if value is not None and not value.strip():
            raise serializers.ValidationError("Name cannot be blank.")
        return value.strip() if isinstance(value, str) else value


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)

    def validate_new_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters.")
        return value


class AdminUserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    total_designs = serializers.IntegerField(read_only=True, default=0)
    total_colors = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Account
        fields = ['id', 'email', 'name', 'phone', 'avatar_url', 'is_admin',
                  'is_active', 'total_designs', 'total_colors',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'email', 'avatar_url', 'total_designs',
                            'total_colors', 'created_at', 'updated_at']

    def get_avatar_url(self, obj):
        url = _avatar_url(obj, self.context.get('request'))
        if url is not None:
            return url
        # annotated queryset may not have .avatar loaded the same way; fallback
        return getattr(obj, 'avatar_url', None)