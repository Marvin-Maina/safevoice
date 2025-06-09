from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, Organization, AdminAccessRequest # Ensure all models are imported

# REGISTER SERIALIZER
class RegisterSerializer(serializers.ModelSerializer):
    # Password field with write_only and a minimum length for security
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    
    # Optional fields for first_name and last_name, allowing them to be blank
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        # Include all fields that the frontend will send or that are required for User creation
        fields = ('username', 'email', 'password', 'first_name', 'last_name')
        extra_kwargs = {
            'password': {'write_only': True}, # Explicitly set password as write_only
            'email': {'required': True},      # Ensure email is required
        }

    def create(self, validated_data):
        # Pop the password and other optional fields to process them separately
        password = validated_data.pop('password')
        first_name = validated_data.pop('first_name', '') # Use .pop with default for optional fields
        last_name = validated_data.pop('last_name', '')   # Use .pop with default for optional fields

        # Create the User instance with necessary default values for AbstractUser
        user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=first_name,
            last_name=last_name,
            role='user',         # Set default role
            plan='free',         # Set default plan
            is_active=True,      # Ensure user is active upon creation
            is_staff=False,      # Ensure user is not staff by default
            is_superuser=False   # Ensure user is not a superuser by default
        )
        user.set_password(password) # Hash the password
        user.save() # Save the user to the database
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
    # Add a SerializerMethodField for the admin request status
    admin_request_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('username', 'email', 'role', 'plan', 'admin_request_status') # Include the new field

    def get_admin_request_status(self, obj):
        # Check for the latest pending or approved request for this user
        latest_request = AdminAccessRequest.objects.filter(user=obj).order_by('-submitted_at').first()
        if latest_request:
            return latest_request.status
        return None # No request found


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
    justification = serializers.CharField(source='organization_description', required=True)
    organization_name = serializers.CharField(required=False, allow_blank=True)
    organization_type = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = AdminAccessRequest
        fields = [
            'id', 'request_type', 'organization_name',
            'organization_type', 'justification', 'status', 'submitted_at'
        ]
        read_only_fields = ['id', 'status', 'submitted_at']

    def validate(self, attrs):
        req_type = attrs.get('request_type')
        if req_type == 'organization':
            if not attrs.get('organization_name'):
                raise serializers.ValidationError(
                    {"organization_name": "Organization name is required for organization type requests."}
                )
            if not attrs.get('organization_type'):
                raise serializers.ValidationError(
                    {"organization_type": "Organization type is required for organization type requests."}
                )
        return attrs

    def create(self, validated_data):
        # FIX: The 'user' is passed from the view's perform_create,
        # so it will be present in validated_data. Pop it from there.
        user = validated_data.pop('user') # <--- THIS IS THE CRUCIAL CHANGE

        # Check if user already has a pending or approved request
        if AdminAccessRequest.objects.filter(user=user, status__in=['pending', 'approved']).exists():
            # Use DRF's ValidationError for proper API error responses
            raise serializers.ValidationError("You already have an active admin access request.")
        
        # Create the AdminAccessRequest instance with the user
        return AdminAccessRequest.objects.create(user=user, **validated_data)
