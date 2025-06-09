from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from datetime import timedelta

from .models import User, Organization, AdminAccessRequest # Ensure these are imported
from .serializers import (
    RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer,
    AdminAccessRequestSerializer
)

User = get_user_model()

class AccountSerializerTests(TestCase):

    def test_register_serializer_create_user(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@test.com',
            'password': 'securepassword123',
            'first_name': 'New',
            'last_name': 'User',
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertIsInstance(user, User)
        self.assertEqual(user.username, 'newuser')
        self.assertEqual(user.email, 'newuser@test.com')
        self.assertEqual(user.first_name, 'New')
        self.assertEqual(user.last_name, 'User')
        self.assertTrue(user.check_password('securepassword123'))
        self.assertEqual(user.role, 'user')
        self.assertEqual(user.plan, 'free')
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_register_serializer_create_user_minimum_fields(self):
        data = {
            'username': 'minuser',
            'email': 'minuser@test.com',
            'password': 'securepassword123',
        }
        serializer = RegisterSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        self.assertIsInstance(user, User)
        self.assertEqual(user.username, 'minuser')
        self.assertEqual(user.email, 'minuser@test.com')
        self.assertEqual(user.first_name, '') # Should default to blank
        self.assertEqual(user.last_name, '')  # Should default to blank
        self.assertTrue(user.check_password('securepassword123'))

    def test_register_serializer_password_min_length(self):
        data = {
            'username': 'shortpassuser',
            'email': 'shortpassuser@test.com',
            'password': 'short', # Less than 8 chars
        }
        serializer = RegisterSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

    def test_user_serializer_serialization(self):
        user = User.objects.create_user(username='testuser', password='password', role='admin', plan='premium')
        serializer = UserSerializer(instance=user)
        data = serializer.data

        self.assertEqual(data['username'], 'testuser')
        self.assertEqual(data['email'], 'testuser@test.com') # Assuming email is set
        self.assertEqual(data['role'], 'admin')
        self.assertEqual(data['plan'], 'premium')
        self.assertIsNone(data['admin_request_status']) # No request initially

    def test_user_serializer_with_admin_request(self):
        user = User.objects.create_user(username='requser', password='password')
        AdminAccessRequest.objects.create(user=user, request_type='individual', status='pending')
        serializer = UserSerializer(instance=user)
        data = serializer.data
        self.assertEqual(data['admin_request_status'], 'pending')

        AdminAccessRequest.objects.create(user=user, request_type='organization', status='approved')
        serializer = UserSerializer(instance=user) # Should get the latest request status
        data = serializer.data
        self.assertEqual(data['admin_request_status'], 'approved')

    def test_user_serializer_update_read_only_fields(self):
        user = User.objects.create_user(username='testuser', password='password', role='user', plan='free')
        data = {'role': 'admin', 'plan': 'premium'} # Attempt to update read-only fields
        serializer = UserSerializer(instance=user, data=data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_user = serializer.save()

        self.assertEqual(updated_user.role, 'user') # Should not change
        self.assertEqual(updated_user.plan, 'free') # Should not change

    def test_custom_token_obtain_pair_serializer(self):
        user = User.objects.create_user(username='tokenuser', password='password', role='admin', plan='premium')
        serializer = CustomTokenObtainPairSerializer(data={'username': 'tokenuser', 'password': 'password'})
        self.assertTrue(serializer.is_valid())
        token = serializer.get_token(user)

        self.assertEqual(token['username'], 'tokenuser')
        self.assertEqual(token['email'], 'tokenuser@test.com') # Assuming email is set
        self.assertEqual(token['role'], 'admin')
        self.assertEqual(token['plan'], 'premium')

    def test_admin_access_request_serializer_valid_individual(self):
        user = User.objects.create_user(username='requser', password='password')
        data = {
            'request_type': 'individual',
            'justification': 'I want to be an admin.',
            # organization_name and organization_type are optional for individual
        }
        serializer = AdminAccessRequestSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        # Simulate saving with user
        request = serializer.save(user=user)
        self.assertEqual(request.user, user)
        self.assertEqual(request.request_type, 'individual')
        self.assertEqual(request.organization_description, 'I want to be an admin.')
        self.assertEqual(request.status, 'pending') # Default status

    def test_admin_access_request_serializer_valid_organization(self):
        user = User.objects.create_user(username='orgrequser', password='password')
        data = {
            'request_type': 'organization',
            'organization_name': 'Test Org',
            'organization_type': 'Non-profit',
            'justification': 'Representing a non-profit.',
        }
        serializer = AdminAccessRequestSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        request = serializer.save(user=user)
        self.assertEqual(request.request_type, 'organization')
        self.assertEqual(request.organization_name, 'Test Org')
        # Note: organization_type from serializer maps to organization_description in model
        self.assertEqual(request.organization_description, 'Representing a non-profit.')

    def test_admin_access_request_serializer_invalid_organization_missing_name(self):
        user = User.objects.create_user(username='invalidorgrequser', password='password')
        data = {
            'request_type': 'organization',
            'organization_type': 'Non-profit',
            'justification': 'Missing name.',
            # organization_name is missing
        }
        serializer = AdminAccessRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('organization_name', serializer.errors)

    def test_admin_access_request_serializer_invalid_organization_missing_type(self):
        user = User.objects.create_user(username='invalidorgrequser2', password='password')
        data = {
            'request_type': 'organization',
            'organization_name': 'Test Org',
            'justification': 'Missing type.',
            # organization_type is missing
        }
        serializer = AdminAccessRequestSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('organization_type', serializer.errors)

    def test_admin_access_request_serializer_existing_pending_request(self):
        user = User.objects.create_user(username='existingrequser', password='password')
        AdminAccessRequest.objects.create(user=user, request_type='individual', status='pending')

        data = {
            'request_type': 'individual',
            'justification': 'Another request.',
        }
        serializer = AdminAccessRequestSerializer(data=data)
        # Simulate saving with user - validation happens in view's perform_create
        # But the serializer itself should not raise ValidationError based on existing requests
        # The check is in the view.
        self.assertTrue(serializer.is_valid())


class AccountViewTests(APITestCase):

    def setUp(self):
        self.admin_user = User.objects.create_user(username='adminuser', password='password', role='admin', plan='free')
        self.premium_admin_user = User.objects.create_user(username='premiumadmin', password='password', role='admin', plan='premium')
        self.regular_user = User.objects.create_user(username='regularuser', password='password', role='user', plan='free')
        self.other_user = User.objects.create_user(username='otheruser', password='password', role='user', plan='free')

    def authenticate_user(self, user):
        self.client.force_authenticate(user=user)

    def test_register_view(self):
        url = reverse('register')
        data = {
            'username': 'newuser_view',
            'email': 'newuser_view@test.com',
            'password': 'securepassword123',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 5) # 4 initial + 1 new
        new_user = User.objects.get(username='newuser_view')
        self.assertEqual(new_user.email, 'newuser_view@test.com')
        self.assertTrue(new_user.check_password('securepassword123'))
        self.assertEqual(new_user.role, 'user')
        self.assertEqual(new_user.plan, 'free')

    def test_my_token_obtain_pair_view(self):
        url = reverse('login')
        data = {
            'username': 'regularuser',
            'password': 'password',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        # Check custom claims in access token (requires decoding, but we can check structure)
        # A more thorough test would decode the token
        self.assertIn('username', response.data) # These are added by the serializer
        self.assertIn('role', response.data)
        self.assertIn('plan', response.data)

    def test_logout_view(self):
        # First, get a token
        login_url = reverse('login')
        login_data = {'username': 'regularuser', 'password': 'password'}
        login_response = self.client.post(login_url, login_data, format='json')
        refresh_token = login_response.data['refresh']

        # Now, logout
        self.authenticate_user(self.regular_user)
        logout_url = reverse('logout')
        logout_data = {'refresh': refresh_token}
        response = self.client.post(logout_url, logout_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], 'Logged out successfully')

        # Attempt to use the refresh token again (should fail)
        refresh_url = reverse('token_refresh')
        refresh_response = self.client.post(refresh_url, {'refresh': refresh_token}, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_view_get(self):
        self.authenticate_user(self.regular_user)
        url = reverse('profile')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'regularuser')
        self.assertEqual(response.data['role'], 'user')
        self.assertEqual(response.data['plan'], 'free')

    def test_profile_view_put(self):
        self.authenticate_user(self.regular_user)
        url = reverse('profile')
        data = {'email': 'updated_email@test.com'} # Can update email
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.regular_user.refresh_from_db()
        self.assertEqual(self.regular_user.email, 'updated_email@test.com')

    def test_profile_view_put_attempt_update_role(self):
        self.authenticate_user(self.regular_user)
        url = reverse('profile')
        data = {'role': 'admin'} # Cannot update role via profile
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK) # DRF serializer ignores read-only fields
        self.regular_user.refresh_from_db()
        self.assertEqual(self.regular_user.role, 'user') # Role should not change

    def test_admin_access_request_view_create(self):
        self.authenticate_user(self.regular_user)
        url = reverse('admin_access_request')
        data = {
            'request_type': 'individual',
            'justification': 'I want admin access.',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AdminAccessRequest.objects.count(), 1)
        request = AdminAccessRequest.objects.first()
        self.assertEqual(request.user, self.regular_user)
        self.assertEqual(request.status, 'pending')

    def test_admin_access_request_view_create_existing_pending(self):
        self.authenticate_user(self.regular_user)
        AdminAccessRequest.objects.create(user=self.regular_user, request_type='individual', status='pending')
        url = reverse('admin_access_request')
        data = {
            'request_type': 'individual',
            'justification': 'Another request.',
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("You already have a pending admin access request.", response.data['error'][0])
        self.assertEqual(AdminAccessRequest.objects.count(), 1) # Count should not increase

    def test_admin_access_request_review_view_list_admin(self):
        self.authenticate_user(self.admin_user)
        user_with_request = User.objects.create_user(username='reqlistuser', password='password')
        AdminAccessRequest.objects.create(user=user_with_request, request_type='individual', status='pending')
        AdminAccessRequest.objects.create(user=self.regular_user, request_type='organization', status='pending')
        AdminAccessRequest.objects.create(user=self.other_user, request_type='individual', status='approved') # Approved request

        url = reverse('admin_access_review_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2) # Should only list pending requests
        request_users = [item['username'] for item in response.data]
        self.assertIn('reqlistuser', request_users)
        self.assertIn('regularuser', request_users)
        self.assertNotIn('otheruser', request_users)

    def test_admin_access_request_review_view_list_regular_user(self):
        self.authenticate_user(self.regular_user)
        url = reverse('admin_access_review_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) # Only admins can list

    def test_admin_access_request_review_view_approve_individual(self):
        self.authenticate_user(self.admin_user)
        user_to_approve = User.objects.create_user(username='approveuser', password='password', role='user')
        request_to_approve = AdminAccessRequest.objects.create(user=user_to_approve, request_type='individual', status='pending')

        url = reverse('admin_access_review_detail', args=[request_to_approve.id])
        data = {'action': 'approve'}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        request_to_approve.refresh_from_db()
        user_to_approve.refresh_from_db()

        self.assertEqual(request_to_approve.status, 'approved')
        self.assertEqual(request_to_approve.reviewed_by, self.admin_user)
        self.assertIsNotNone(request_to_approve.reviewed_at)
        self.assertEqual(user_to_approve.role, 'admin')
        self.assertIsNone(user_to_approve.organization) # Individual request should not set organization
        # Check if notification was created (assuming Notification model is used)
        # from reports.models import Notification
        # self.assertTrue(Notification.objects.filter(user=user_to_approve, message__icontains="approved").exists())

    def test_admin_access_request_review_view_approve_organization(self):
        self.authenticate_user(self.admin_user)
        user_to_approve = User.objects.create_user(username='approveorguser', password='password', role='user')
        request_to_approve = AdminAccessRequest.objects.create(
            user=user_to_approve,
            request_type='organization',
            organization_name='New Org',
            organization_description='Org description',
            status='pending'
        )

        url = reverse('admin_access_review_detail', args=[request_to_approve.id])
        data = {'action': 'approve'}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        request_to_approve.refresh_from_db()
        user_to_approve.refresh_from_db()

        self.assertEqual(request_to_approve.status, 'approved')
        self.assertEqual(user_to_approve.role, 'admin')
        self.assertIsNotNone(user_to_approve.organization)
        self.assertEqual(user_to_approve.organization.name, 'New Org')
        self.assertEqual(user_to_approve.organization.description, 'Org description')
        self.assertEqual(Organization.objects.count(), 1) # Should create one new organization

    def test_admin_access_request_review_view_reject(self):
        self.authenticate_user(self.admin_user)
        user_to_reject = User.objects.create_user(username='rejectuser', password='password', role='user')
        request_to_reject = AdminAccessRequest.objects.create(user=user_to_reject, request_type='individual', status='pending')

        url = reverse('admin_access_review_detail', args=[request_to_reject.id])
        data = {'action': 'reject'}
        response = self.client.post(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        request_to_reject.refresh_from_db()
        user_to_reject.refresh_from_db()

        self.assertEqual(request_to_reject.status, 'rejected')
        self.assertEqual(request_to_reject.reviewed_by, self.admin_user)
        self.assertIsNotNone(request_to_reject.reviewed_at)
        self.assertEqual(user_to_reject.role, 'user') # Role should not change
        # Check if notification was created (assuming Notification model is used)
        # from reports.models import Notification
        # self.assertTrue(Notification.objects.filter(user=user_to_reject, message__icontains="rejected").exists())

    def test_admin_access_request_review_view_post_regular_user(self):
        self.authenticate_user(self.regular_user)
        user_to_approve = User.objects.create_user(username='approveuser2', password='password', role='user')
        request_to_approve = AdminAccessRequest.objects.create(user=user_to_approve, request_type='individual', status='pending')

        url = reverse('admin_access_review_detail', args=[request_to_approve.id])
        data = {'action': 'approve'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) # Only admins can review

    def test_upgrade_user_plan_view_admin(self):
        self.authenticate_user(self.admin_user) # Free admin can upgrade
        url = reverse('upgrade_plan')
        data = {'user_id': self.regular_user.id, 'plan_type': 'premium'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.regular_user.refresh_from_db()
        self.assertEqual(self.regular_user.plan, 'premium')

    def test_upgrade_user_plan_view_premium_admin(self):
        self.authenticate_user(self.premium_admin_user) # Premium admin can upgrade
        url = reverse('upgrade_plan')
        data = {'user_id': self.regular_user.id, 'plan_type': 'premium'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.regular_user.refresh_from_db()
        self.assertEqual(self.regular_user.plan, 'premium')

    def test_upgrade_user_plan_view_regular_user(self):
        self.authenticate_user(self.regular_user) # Regular user cannot upgrade others
        url = reverse('upgrade_plan')
        data = {'user_id': self.other_user.id, 'plan_type': 'premium'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_upgrade_user_plan_view_invalid_user(self):
        self.authenticate_user(self.admin_user)
        url = reverse('upgrade_plan')
        data = {'user_id': 999, 'plan_type': 'premium'} # Non-existent user
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_upgrade_user_plan_view_invalid_plan_type(self):
        self.authenticate_user(self.admin_user)
        url = reverse('upgrade_plan')
        data = {'user_id': self.regular_user.id, 'plan_type': 'gold'} # Invalid plan type
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid user ID or plan type.", response.data['error'])