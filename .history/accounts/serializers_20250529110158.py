from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Organization, AdminAccessRequest

# REGISTER SERIALIZER
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)

        # Safe defaults
        user.role = 'user'
        user.plan = 'free'

        user.set_password(password)
        user.save()
        return user


# OPTIONAL LOGIN SERIALIZER (if you want manual login)
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        data['user'] = user
        return data


# USER PROFILE SERIALIZER
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'role', 'plan')


# CUSTOM JWT TOKEN SERIALIZER WITH CUSTOM CLAIMS
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        token['plan'] = user.plan
        return token


# ADMIN ACCESS REQUEST SERIALIZER
class AdminAccessRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminAccessRequest
        fields = [
            'id', 'request_type', 'organization_name', 'organization_description', 'status', 'submitted_at'
        ]
        read_only_fields = ['id', 'status', 'submitted_at']

    def validate(self, attrs):
        req_type = attrs.get('request_type')
        if req_type == 'organization':
            if not attrs.get('organization_name'):
                raise serializers.ValidationError("Organization name is required for organization requests.")
            if not attrs.get('organization_description'):
                raise serializers.ValidationError("Organization description is required for organization requests.")
        return attrs
