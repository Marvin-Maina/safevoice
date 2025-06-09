from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from unittest.mock import patch, MagicMock
import io

from accounts.models import User # Assuming User is in accounts.models
from .models import Report, Notification, ReportComment, AdminAccessRequest # Assuming models are here
from .serializers import (
    ReportSerializer, NotificationSerializer, ReportCommentSerializer,
    RegisterSerializer, UserSerializer, AdminAccessRequestSerializer
)

class ReportSerializerTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password', role='user', plan='free')
        self.report = Report.objects.create(
            submitted_by=self.user,
            title='User Report',
            description='User description',
            category='abuse',
            status='pending',
            is_anonymous=False,
            is_premium=False,
            priority_flag=False
        )

    def test_report_serializer_serialization(self):
        serializer = ReportSerializer(instance=self.report)
        data = serializer.data

        self.assertEqual(data['id'], self.report.id)
        self.assertEqual(data['title'], 'User Report')
        self.assertEqual(data['status'], 'pending')
        self.assertEqual(data['submitted_by_username'], 'testuser')
        self.assertFalse(data['is_anonymous'])
        self.assertFalse(data['is_premium_report'])
        self.assertFalse(data['priority_flag'])
        self.assertIsNotNone(data['submitted_at'])
        self.assertIsNone(data['file_upload'])
        self.assertIsNotNone(data['token'])
        self.assertIsNone(data['last_status_update'])
        self.assertIsNone(data['reviewed_by'])

    def test_report_serializer_create_without_file(self):
        data = {
            'title': 'New Report',
            'description': 'New description',
            'category': 'corruption',
            'is_anonymous': True,
            'priority_flag': False,
        }
        serializer = ReportSerializer(data=data)
        self.assertTrue(serializer.is_valid())

        # Simulate saving with a user (as done in the view)
        user = User.objects.create_user(username='anotheruser', password='password')
        report = serializer.save(submitted_by=user, is_premium_report=user.is_premium())

        self.assertEqual(report.title, 'New Report')
        self.assertEqual(report.category, 'corruption')
        self.assertTrue(report.is_anonymous)
        self.assertEqual(report.submitted_by, user)
        self.assertIsNone(report.file_upload)
        self.assertEqual(report.status, 'pending') # Default status
        self.assertFalse(report.is_premium) # Default plan is free

    @patch('reports.models.user_report_path', return_value='uploads/test_file.txt')
    def test_report_serializer_create_with_file(self, mock_path):
        file_content = b'test file content'
        file = io.BytesIO(file_content)
        file.name = 'test.txt'
        file.size = len(file_content)

        data = {
            'title': 'Report with File',
            'description': 'Description with file',
            'category': 'harassment',
            'is_anonymous': False,
            'priority_flag': True,
            'file_upload': file,
        }
        serializer = ReportSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        user = User.objects.create_user(username='fileuser', password='password')
        report = serializer.save(submitted_by=user, is_premium_report=user.is_premium())

        self.assertEqual(report.title, 'Report with File')
        self.assertIsNotNone(report.file_upload)
        self.assertEqual(report.file_upload.name, 'uploads/test_file.txt') # Check saved path
        self.assertEqual(report.submitted_by, user)
        self.assertTrue(report.priority_flag)

    def test_report_serializer_update_without_file(self):
        data = {
            'title': 'Updated Title',
            'description': 'Updated description',
        }
        serializer = ReportSerializer(instance=self.report, data=data, partial=True)
        self.assertTrue(serializer.is_valid())

        updated_report = serializer.save()

        self.assertEqual(updated_report.title, 'Updated Title')
        self.assertEqual(updated_report.description, 'Updated description')
        self.assertEqual(updated_report.status, 'pending') # Status should not change via user serializer
        self.assertIsNone(updated_report.file_upload) # Should remain None

    @patch('reports.models.user_report_path', return_value='uploads/updated_file.pdf')
    def test_report_serializer_update_with_new_file(self, mock_path):
        file_content = b'pdf content'
        file = io.BytesIO(file_content)
        file.name = 'updated.pdf'
        file.size = len(file_content)

        data = {
            'description': 'Added a file',
            'file_upload': file,
        }
        serializer = ReportSerializer(instance=self.report, data=data, partial=True)
        self.assertTrue(serializer.is_valid(), serializer.errors)

        updated_report = serializer.save()

        self.assertEqual(updated_report.description, 'Added a file')
        self.assertIsNotNone(updated_report.file_upload)
        self.assertEqual(updated_report.file_upload.name, 'uploads/updated_file.pdf')

    def test_report_serializer_update_remove_file(self):
        # First, add a file to the report instance
        file_content = b'initial file'
        file = io.BytesIO(file_content)
        file.name = 'initial.txt'
        file.size = len(file_content)
        self.report.file_upload.save('initial.txt', file)
        self.report.refresh_from_db()
        self.assertIsNotNone(self.report.file_upload)

        # Now update, explicitly setting file_upload to None
        data = {
            'description': 'Removing the file',
            'file_upload': None, # Explicitly set to None
        }
        serializer = ReportSerializer(instance=self.report, data=data, partial=True)
        self.assertTrue(serializer.is_valid())

        updated_report = serializer.save()

        self.assertEqual(updated_report.description, 'Removing the file')
        self.assertIsNone(updated_report.file_upload)

    def test_notification_serializer_serialization(self):
        notification = Notification.objects.create(
            user=self.user,
            message='Test notification',
            report=self.report,
            is_read=False
        )
        serializer = NotificationSerializer(instance=notification)
        data = serializer.data

        self.assertEqual(data['id'], notification.id)
        self.assertEqual(data['user'], self.user.id)
        self.assertEqual(data['message'], 'Test notification')
        self.assertFalse(data['is_read'])
        self.assertEqual(data['report'], self.report.id)
        self.assertEqual(data['report_title'], 'User Report')
        self.assertIsNotNone(data['created_at'])

    def test_report_comment_serializer_serialization(self):
        admin_user = User.objects.create_user(username='admin', password='password', role='admin')
        comment1 = ReportComment.objects.create(
            report=self.report,
            sender=self.user,
            message='User comment',
            is_internal=False
        )
        comment2 = ReportComment.objects.create(
            report=self.report,
            sender=admin_user,
            message='Admin internal comment',
            is_internal=True
        )

        # Test with user request context
        request_user = type('Request', (object,), {'user': self.user})()
        serializer1 = ReportCommentSerializer(instance=comment1, context={'request': request_user})
        data1 = serializer1.data

        self.assertEqual(data1['id'], comment1.id)
        self.assertEqual(data1['sender_username'], 'testuser')
        self.assertEqual(data1['message'], 'User comment')
        self.assertFalse(data1['is_internal'])
        self.assertTrue(data1['is_current_user_sender'])
        # Note: display_sender_name logic for submitter is 'Anonymous User' if is_anonymous=True
        # For non-anonymous submitter, it falls back to username
        self.assertEqual(data1['display_sender_name'], 'testuser') # User is not anonymous
        self.assertFalse(data1['is_sender_admin'])

        # Test with admin request context
        request_admin = type('Request', (object,), {'user': admin_user})()
        serializer2 = ReportCommentSerializer(instance=comment2, context={'request': request_admin})
        data2 = serializer2.data

        self.assertEqual(data2['id'], comment2.id)
        self.assertEqual(data2['sender_username'], 'admin')
        self.assertEqual(data2['message'], 'Admin internal comment')
        self.assertTrue(data2['is_internal'])
        self.assertTrue(data2['is_current_user_sender'])
        self.assertEqual(data2['display_sender_name'], 'Admin (Internal Note)') # Internal comment
        self.assertTrue(data2['is_sender_admin'])

        # Test admin viewing user comment
        serializer3 = ReportCommentSerializer(instance=comment1, context={'request': request_admin})
        data3 = serializer3.data
        self.assertFalse(data3['is_current_user_sender'])
        self.assertEqual(data3['display_sender_name'], 'testuser') # Not internal, not admin sender
        self.assertFalse(data3['is_sender_admin'])


class ReportViewTests(APITestCase):

    def setUp(self):
        self.admin_user = User.objects.create_user(username='adminuser', password='password', role='admin', plan='free')
        self.premium_user = User.objects.create_user(username='premiumuser', password='password', role='user', plan='premium')
        self.free_user = User.objects.create_user(username='freeuser', password='password', role='user', plan='free')
        self.other_user = User.objects.create_user(username='otheruser', password='password', role='user', plan='free')

        self.report1_free = Report.objects.create(
            submitted_by=self.free_user,
            title='Free Report 1',
            category='abuse',
            status='pending',
            is_premium=False,
            submitted_at=timezone.now() - timedelta(days=5)
        )
        self.report2_free = Report.objects.create(
            submitted_by=self.free_user,
            title='Free Report 2',
            category='corruption',
            status='under_review',
            is_premium=False,
            submitted_at=timezone.now() - timedelta(days=10)
        )
        self.report3_free = Report.objects.create(
            submitted_by=self.free_user,
            title='Free Report 3',
            category='harassment',
            status='resolved',
            is_premium=False,
            submitted_at=timezone.now() - timedelta(days=15)
        )
        self.report4_free_old = Report.objects.create(
            submitted_by=self.free_user,
            title='Free Report 4 Old',
            category='other',
            status='pending',
            is_premium=False,
            submitted_at=timezone.now() - timedelta(days=40) # Older than 30 days
        )
        self.report_premium = Report.objects.create(
            submitted_by=self.premium_user,
            title='Premium Report 1',
            category='abuse',
            status='pending',
            is_premium=True,
            submitted_at=timezone.now() - timedelta(days=5)
        )
        self.report_other_user = Report.objects.create(
            submitted_by=self.other_user,
            title='Other User Report',
            category='corruption',
            status='pending',
            is_premium=False,
            submitted_at=timezone.now() - timedelta(days=5)
        )

    def authenticate_user(self, user):
        self.client.force_authenticate(user=user)

    def test_report_viewset_list_free_user(self):
        self.authenticate_user(self.free_user)
        url = reverse('report-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Free user should see their 4 reports (3 recent, 1 old)
        self.assertEqual(len(response.data), 4)
        report_titles = [item['title'] for item in response.data]
        self.assertIn('Free Report 1', report_titles)
        self.assertIn('Free Report 2', report_titles)
        self.assertIn('Free Report 3', report_titles)
        self.assertIn('Free Report 4 Old', report_titles)
        self.assertNotIn('Premium Report 1', report_titles)
        self.assertNotIn('Other User Report', report_titles)

    def test_report_viewset_list_admin_user(self):
        self.authenticate_user(self.admin_user)
        url = reverse('report-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Admin should see all reports
        self.assertEqual(len(response.data), 6)

    def test_report_viewset_create_free_user_within_limit(self):
        self.authenticate_user(self.free_user)
        url = reverse('report-list')
        data = {
            'title': 'New Free Report',
            'description': 'New description',
            'category': 'abuse',
            'is_anonymous': False,
            'priority_flag': False,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Report.objects.filter(submitted_by=self.free_user).count(), 5) # 4 existing + 1 new
        new_report = Report.objects.get(id=response.data['id'])
        self.assertFalse(new_report.is_premium) # Should be false for free user

    def test_report_viewset_create_free_user_exceeding_limit(self):
        # Create one more report for the free user within the last 30 days
        Report.objects.create(
            submitted_by=self.free_user,
            title='Free Report 5 Recent',
            category='other',
            status='pending',
            is_premium=False,
            submitted_at=timezone.now() - timedelta(days=1)
        )
        self.authenticate_user(self.free_user)
        url = reverse('report-list')
        data = {
            'title': 'Report Over Limit',
            'description': 'Should fail',
            'category': 'abuse',
            'is_anonymous': False,
            'priority_flag': False,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Free tier limit reached", response.data['error'][0])
        self.assertEqual(Report.objects.filter(submitted_by=self.free_user).count(), 5) # Count should not increase

    def test_report_viewset_create_premium_user(self):
        self.authenticate_user(self.premium_user)
        url = reverse('report-list')
        data = {
            'title': 'New Premium Report',
            'description': 'New description',
            'category': 'abuse',
            'is_anonymous': False,
            'priority_flag': False,
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Report.objects.filter(submitted_by=self.premium_user).count(), 2) # 1 existing + 1 new
        new_report = Report.objects.get(id=response.data['id'])
        self.assertTrue(new_report.is_premium) # Should be true for premium user

    def test_report_viewset_retrieve_own_report(self):
        self.authenticate_user(self.free_user)
        url = reverse('report-detail', args=[self.report1_free.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Free Report 1')

    def test_report_viewset_retrieve_other_users_report(self):
        self.authenticate_user(self.free_user)
        url = reverse('report-detail', args=[self.report_other_user.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND) # Cannot retrieve others' reports

    def test_report_viewset_retrieve_admin_can_see_any_report(self):
        self.authenticate_user(self.admin_user)
        url = reverse('report-detail', args=[self.report_other_user.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Other User Report')

    def test_report_viewset_update_own_report(self):
        self.authenticate_user(self.free_user)
        url = reverse('report-detail', args=[self.report1_free.id])
        data = {'title': 'Updated Free Report 1', 'description': 'Updated description'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.report1_free.refresh_from_db()
        self.assertEqual(self.report1_free.title, 'Updated Free Report 1')
        self.assertEqual(self.report1_free.description, 'Updated description')
        # Status should not be changeable by user
        self.assertEqual(self.report1_free.status, 'pending')

    def test_report_viewset_update_other_users_report(self):
        self.authenticate_user(self.free_user)
        url = reverse('report-detail', args=[self.report_other_user.id])
        data = {'title': 'Attempted Update'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND) # Cannot update others' reports

    def test_report_viewset_delete_own_report(self):
        self.authenticate_user(self.free_user)
        url = reverse('report-detail', args=[self.report1_free.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Report.objects.filter(id=self.report1_free.id).count(), 0)

    def test_report_viewset_delete_other_users_report(self):
        self.authenticate_user(self.free_user)
        url = reverse('report-detail', args=[self.report_other_user.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND) # Cannot delete others' reports

    def test_report_viewset_by_token_action_authenticated(self):
        self.authenticate_user(self.free_user) # Any authenticated user can use this
        url = reverse('report-by-token', args=[self.report1_free.token])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Free Report 1')
        self.assertEqual(response.data['token'], str(self.report1_free.token))

    def test_report_viewset_by_token_action_unauthenticated(self):
        # No authentication
        url = reverse('report-by-token', args=[self.report1_free.token])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK) # AllowAny permission
        self.assertEqual(response.data['title'], 'Free Report 1')

    def test_report_viewset_by_token_action_not_found(self):
        self.authenticate_user(self.free_user)
        url = reverse('report-by-token', args=[uuid.uuid4()]) # Non-existent token
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class NotificationViewTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.other_user = User.objects.create_user(username='otheruser', password='password')
        self.report = Report.objects.create(submitted_by=self.user, title='Test Report', category='abuse')
        self.notification1 = Notification.objects.create(user=self.user, message='Notif 1', report=self.report, is_read=False)
        self.notification2 = Notification.objects.create(user=self.user, message='Notif 2', report=None, is_read=True)
        self.notification_other = Notification.objects.create(user=self.other_user, message='Other Notif', report=None, is_read=False)

    def authenticate_user(self, user):
        self.client.force_authenticate(user=user)

    def test_notification_viewset_list_own_notifications(self):
        self.authenticate_user(self.user)
        url = reverse('notification-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2) # Should only see own notifications
        messages = [item['message'] for item in response.data]
        self.assertIn('Notif 1', messages)
        self.assertIn('Notif 2', messages)
        self.assertNotIn('Other Notif', messages)

    def test_notification_viewset_list_other_users_notifications(self):
        self.authenticate_user(self.other_user)
        url = reverse('notification-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['message'], 'Other Notif')

    def test_notification_viewset_mark_read_own_notification(self):
        self.authenticate_user(self.user)
        url = reverse('notification-mark-read', args=[self.notification1.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.notification1.refresh_from_db()
        self.assertTrue(self.notification1.is_read)

    def test_notification_viewset_mark_read_other_users_notification(self):
        self.authenticate_user(self.user)
        url = reverse('notification-mark-read', args=[self.notification_other.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) # Cannot mark others' notifications
        self.notification_other.refresh_from_db()
        self.assertFalse(self.notification_other.is_read) # Should remain unread

    def test_notification_viewset_mark_read_not_found(self):
        self.authenticate_user(self.user)
        url = reverse('notification-mark-read', args=[999]) # Non-existent ID
        response = self.client.post(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ReportCommentViewTests(APITestCase):

    def setUp(self):
        self.admin_user = User.objects.create_user(username='adminuser', password='password', role='admin')
        self.regular_user = User.objects.create_user(username='regularuser', password='password', role='user')
        self.other_user = User.objects.create_user(username='otheruser', password='password', role='user')

        self.report = Report.objects.create(submitted_by=self.regular_user, title='Report with Comments', category='abuse')

        self.comment_user = ReportComment.objects.create(
            report=self.report, sender=self.regular_user, message='User comment', is_internal=False
        )
        self.comment_admin_internal = ReportComment.objects.create(
            report=self.report, sender=self.admin_user, message='Admin internal note', is_internal=True
        )
        self.comment_admin_public = ReportComment.objects.create(
            report=self.report, sender=self.admin_user, message='Admin public comment', is_internal=False
        )

    def authenticate_user(self, user):
        self.client.force_authenticate(user=user)

    def test_report_comment_viewset_list_user(self):
        self.authenticate_user(self.regular_user)
        url = reverse('report-comment-list', args=[self.report.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # User should only see non-internal comments (user's own + admin public)
        self.assertEqual(len(response.data), 2)
        messages = [item['message'] for item in response.data]
        self.assertIn('User comment', messages)
        self.assertIn('Admin public comment', messages)
        self.assertNotIn('Admin internal note', messages)

    def test_report_comment_viewset_list_admin(self):
        self.authenticate_user(self.admin_user)
        url = reverse('report-comment-list', args=[self.report.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Admin should see all comments (user, admin internal, admin public)
        self.assertEqual(len(response.data), 3)
        messages = [item['message'] for item in response.data]
        self.assertIn('User comment', messages)
        self.assertIn('Admin internal note', messages)
        self.assertIn('Admin public comment', messages)

    def test_report_comment_viewset_create_user(self):
        self.authenticate_user(self.regular_user)
        url = reverse('report-comment-list', args=[self.report.id])
        data = {'message': 'Another user comment'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ReportComment.objects.filter(report=self.report).count(), 4) # 3 existing + 1 new
        new_comment = ReportComment.objects.order_by('-sent_at').first()
        self.assertEqual(new_comment.message, 'Another user comment')
        self.assertEqual(new_comment.sender, self.regular_user)
        self.assertFalse(new_comment.is_internal) # User cannot create internal comments

    def test_report_comment_viewset_create_admin_public(self):
        self.authenticate_user(self.admin_user)
        url = reverse('report-comment-list', args=[self.report.id])
        data = {'message': 'Another admin public comment', 'is_internal': False}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_comment = ReportComment.objects.order_by('-sent_at').first()
        self.assertEqual(new_comment.message, 'Another admin public comment')
        self.assertEqual(new_comment.sender, self.admin_user)
        self.assertFalse(new_comment.is_internal)

    def test_report_comment_viewset_create_admin_internal(self):
        self.authenticate_user(self.admin_user)
        url = reverse('report-comment-list', args=[self.report.id])
        data = {'message': 'Another admin internal note', 'is_internal': True}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_comment = ReportComment.objects.order_by('-sent_at').first()
        self.assertEqual(new_comment.message, 'Another admin internal note')
        self.assertEqual(new_comment.sender, self.admin_user)
        self.assertTrue(new_comment.is_internal)

    def test_report_comment_viewset_create_other_user(self):
        self.authenticate_user(self.other_user)
        url = reverse('report-comment-list', args=[self.report.id])
        data = {'message': 'Comment from other user'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) # Cannot comment on others' reports
        self.assertEqual(ReportComment.objects.filter(report=self.report).count(), 3) # Count should not increase

    def test_report_comment_viewset_update_own_comment(self):
        self.authenticate_user(self.regular_user)
        url = reverse('report-comment-detail', args=[self.report.id, self.comment_user.id])
        data = {'message': 'Updated user comment'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.comment_user.refresh_from_db()
        self.assertEqual(self.comment_user.message, 'Updated user comment')

    def test_report_comment_viewset_update_other_users_comment(self):
        self.authenticate_user(self.regular_user)
        url = reverse('report-comment-detail', args=[self.report.id, self.comment_admin_public.id])
        data = {'message': 'Attempted update'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) # Cannot update others' comments
        self.comment_admin_public.refresh_from_db()
        self.assertNotEqual(self.comment_admin_public.message, 'Attempted update')

    def test_report_comment_viewset_update_admin_can_update_any_comment(self):
        self.authenticate_user(self.admin_user)
        url = reverse('report-comment-detail', args=[self.report.id, self.comment_user.id])
        data = {'message': 'Admin updated user comment'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.comment_user.refresh_from_db()
        self.assertEqual(self.comment_user.message, 'Admin updated user comment')

    def test_report_comment_viewset_update_user_cannot_change_is_internal(self):
        self.authenticate_user(self.regular_user)
        url = reverse('report-comment-detail', args=[self.report.id, self.comment_user.id])
        data = {'is_internal': True}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) # Cannot change internal status
        self.comment_user.refresh_from_db()
        self.assertFalse(self.comment_user.is_internal) # Should remain False

    def test_report_comment_viewset_update_admin_can_change_is_internal(self):
        self.authenticate_user(self.admin_user)
        url = reverse('report-comment-detail', args=[self.report.id, self.comment_user.id])
        data = {'is_internal': True}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.comment_user.refresh_from_db()
        self.assertTrue(self.comment_user.is_internal) # Admin can change internal status

    @patch('reports.views.qrcode.make')
    @patch('reports.views.canvas.Canvas')
    @patch('reports.views.ImageReader')
    def test_report_certificate_view(self, mock_image_reader, mock_canvas, mock_qrcode):
        # Mock the canvas and QR code generation
        mock_canvas_instance = MagicMock()
        mock_canvas.return_value = mock_canvas_instance
        mock_qrcode_instance = MagicMock()
        mock_qrcode.return_value = mock_qrcode_instance
        mock_image_reader_instance = MagicMock()
        mock_image_reader.return_value = mock_image_reader_instance

        url = reverse('report-pdf', args=[self.report.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertIn('attachment; filename="Report Certificate.pdf"', response['Content-Disposition']) # Assuming default filename

        # Verify canvas methods were called (basic check)
        mock_canvas.assert_called_once()
        mock_canvas_instance.drawString.assert_called()
        mock_qrcode.assert_called_once_with(self.report.get_certificate_qr_data())
        mock_image_reader.assert_called_once() # Called with the QR image buffer
        mock_canvas_instance.drawImage.assert_called_once()
        mock_canvas_instance.save.assert_called_once()

    def test_report_certificate_view_not_found(self):
        url = reverse('report-pdf', args=[999]) # Non-existent ID
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


# Note: Admin panel views are also present in reports/views.py.
# It's recommended to move them entirely to adminpanel/views.py
# The tests for these views are already included in adminpanel/tests.py
# If you keep them here, you would need to duplicate those tests.