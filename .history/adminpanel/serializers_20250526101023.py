from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class AdminUserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(read_only=True)
    is_active = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'role',
            'plan',
            'is_active',
            'date_joined',
            'last_login',
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'last_login']
