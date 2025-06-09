from rest_framework import serializers
from .models import User, Organization
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# REGISTER SERIALIZER
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password')  #

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)

        # Force safe defaults
        user.role = 'user'
        user.plan = 'free'

        user.set_password(password)
        user.save()
        return user


# OPTIONAL: FOR MANUAL LOGIN FLOW (not used with /token/)
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if not user:
            raise serializers.ValidationError("Invalid credentials")
        data['user'] = user
        return data

#  PROFILE SERIALIZER
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'role', 'plan')

#  CUSTOM JWT TOKEN SERIALIZER
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Embed custom claims in the JWT payload
        token['username'] = user.username
        token['role'] = user.role
        token['plan'] = user.plan

        return token

from rest_framework import serializers
from .models import Organization

class AdminAccessRequestSerializer(serializers.Serializer):
    wants_admin = serializers.BooleanField()
    organization_name = serializers.CharField(required=False, allow_blank=True)
    organization_description = serializers.CharField(required=False, allow_blank=True)

