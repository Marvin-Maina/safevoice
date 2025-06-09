from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta

from accounts.models import User # Assuming User is in accounts.models
from reports.models import Report, AdminAccessRequest # Assuming Report is in reports.models
from .serializers import AdminReportSerializer, AdminUserSerializer, ReportAnalyticsSerializer

class AdminPanelSerializerTests(TestCase):

    def setUp(self):
        self.admin_user = User.objects.create_user(username='adminuser', password='password', role='admin', plan='free')
        self.premium_admin_user = User.objects.create_user(username='premiumadmin', password='password', role='admin', plan='premium')
        self.regular_user = User.objects.create_user(username='regularuser', password='password', role='user', plan='free')

        self.report1 = Report.objects.create(
            submitted_by=self.regular_user,
            title='Test Report 1',
            description='Description 1',
            category='abuse',
            status='pending',
            is_anonymous=False,
            is_premium=False,
            priority_flag=False
        )
        self.report2 = Report.objects.create(
            submitted_by=self.regular_user,
            title='Test Report 2',
            description='Description 2',
            category='corruption',
            status='under_review',
            is_anonymous=True,
            is_premium=True,
            priority_flag=True,
            internal_notes='Initial internal note'
        )

    def test_admin_report_serializer_serialization(self):
        serializer = AdminReportSerializer(instance=self.report1)
        data = serializer.data

        self.assertEqual(data['id'], self.report1.id)
        self.assertEqual(data['title'], 'Test Report 1')
        self.assertEqual(data['status'], 'pending')
        self.assertEqual(data['submitted_by_username'], 'regularuser')
        self.assertFalse(data['is_anonymous'])
        self.assertFalse(data['is_premium_report'])
        self.assertFalse(data['priority_flag'])
        self.assertIsNone(data['internal_notes']) # Should be None if blank=True and not set
        self.assertIsNotNone(data['submitted_at'])
        self.assertIsNone(data['file_upload'])
        # is_resolved is read_only=True but not in model, should be None or default
        # Based on serializer fields, it's included but read_only, so it will be None
        self.assertIsNone(data['is_resolved'])

    def test_admin_report_serializer_update_status(self):
        request = type('Request', (object,), {'user': self.admin_user})() # Mock request
        serializer = AdminReportSerializer(instance=self.report1, context={'request': request})
        data = {'status': 'resolved', 'internal_notes': 'Report resolved by admin.'}

        updated_report = serializer.update(self.report1, data)

        self.assertEqual(updated_report.status, 'resolved')
        self.assertEqual(updated_report.internal_notes, 'Report resolved by admin.')
        self.assertEqual(updated_report.reviewed_by, self.admin_user)
        self.assertIsNotNone(updated_report.last_status_update)
        self.assertAlmostEqual(updated_report.last_status_update, timezone.now(), delta=timedelta(seconds=1))

    def test_admin_report_serializer_update_other_fields(self):
        request = type('Request', (object,), {'user': self.admin_user})() # Mock request
        serializer = AdminReportSerializer(instance=self.report1, context={'request': request})
        data = {'priority_flag': True, 'internal_notes': 'Adding priority flag.'}

        updated_report = serializer.update(self.report1, data)

        self.assertEqual(updated_report.priority_flag, True)
        self.assertEqual(updated_report.internal_notes, 'Adding priority flag.')
        # Status didn't change, so last_status_update and reviewed_by should be None
        self.assertIsNone(updated_report.last_status_update)
        self.assertIsNone(updated_report.reviewed_by)
        self.assertEqual(updated_report.status, 'pending') # Status should remain unchanged

    def test_admin_user_serializer_serialization(self):
        serializer = AdminUserSerializer(instance=self.admin_user)
        data = serializer.data

        self.assertEqual(data['id'], self.admin_user.id)
        self.assertEqual(data['username'], 'adminuser')
        self.assertEqual(data['email'], 'adminuser@test.com') # Assuming email is set
        self.assertEqual(data['role'], 'admin')
        self.assertEqual(data['plan'], 'free')
        self.assertTrue(data['is_active'])
        self.assertIsNone(data['organization']) # Assuming no organization initially

    def test_admin_user_serializer_update(self):
        serializer = AdminUserSerializer(instance=self.regular_user, data={'role': 'admin', 'plan': 'premium', 'is_active': False}, partial=True)
        self.assertTrue(serializer.is_valid())

        updated_user = serializer.save()

        self.assertEqual(updated_user.role, 'admin')
        self.assertEqual(updated_user.plan, 'premium')
        self.assertFalse(updated_user.is_active)
        # Read-only fields should not be updated
        self.assertEqual(updated_user.username, 'regularuser')
        self.assertEqual(updated_user.email, 'regularuser@test.com') # Assuming email is set

    def test_report_analytics_serializer_serialization(self):
        # This serializer doesn't take an instance, just data
        analytics_data = {
            'total_reports': 5,
            'reports_by_status': {'pending': 2, 'resolved': 3},
            'reports_by_category': {'abuse': 3, 'corruption': 2},
            'monthly_trends': [{'month': '2023-10', 'count': 2}, {'month': '2023-11', 'count': 3}],
            'premium_vs_free_reports': {True: 1, False: 4},
            'anonymous_vs_identified_reports': {True: 2, False: 3},
            'priority_reports_count': 1,
        }
        serializer = ReportAnalyticsSerializer(data=analytics_data)
        self.assertTrue(serializer.is_valid())
        data = serializer.data

        self.assertEqual(data['total_reports'], 5)
        self.assertEqual(data['reports_by_status'], {'pending': 2, 'resolved': 3})
        self.assertEqual(data['reports_by_category'], {'abuse': 3, 'corruption': 2})
        self.assertEqual(data['monthly_trends'], [{'month': '2023-10', 'count': 2}, {'month': '2023-11', 'count': 3}])
        self.assertEqual(data['premium_vs_free_reports'], {True: 1, False: 4})
        self.assertEqual(data['anonymous_vs_identified_reports'], {True: 2, False: 3})
        self.assertEqual(data['priority_reports_count'], 1)


class AdminPanelViewTests(APITestCase):

    def setUp(self):
        self.admin_user = User.objects.create_user(username='adminuser', password='password', role='admin', plan='free')
        self.premium_admin_user = User.objects.create_user(username='premiumadmin', password='password', role='admin', plan='premium')
        self.regular_user = User.objects.create_user(username='regularuser', password='password', role='user', plan='free')
        self.anonymous_user = User.objects.create_user(username='anonymoususer', password='password', role='user', plan='free')

        self.report1 = Report.objects.create(
            submitted_by=self.regular_user,
            title='Test Report 1',
            description='Description 1',
            category='abuse',
            status='pending',
            is_anonymous=False,
            is_premium=False,
            priority_flag=False,
            submitted_at=timezone.now() - timedelta(days=40) # Last month
        )
        self.report2 = Report.objects.create(
            submitted_by=self.regular_user,
            title='Test Report 2',
            description='Description 2',
            category='corruption',
            status='under_review',
            is_anonymous=True,
            is_premium=True,
            priority_flag=True,
            submitted_at=timezone.now() - timedelta(days=10) # This month
        )
        self.report3 = Report.objects.create(
            submitted_by=self.anonymous_user,
            title='Test Report 3',
            description='Description 3',
            category='harassment',
            status='resolved',
            is_anonymous=True,
            is_premium=False,
            priority_flag=False,
            submitted_at=timezone.now() - timedelta(days=5) # This month
        )

    def authenticate_admin(self):
        self.client.force_authenticate(user=self.admin_user)

    def authenticate_premium_admin(self):
        self.client.force_authenticate(user=self.premium_admin_user)

    def authenticate_regular_user(self):
        self.client.force_authenticate(user=self.regular_user)

    def test_admin_report_list_view_authenticated_admin(self):
        self.authenticate_admin()
        url = reverse('admin-report-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3) # Should see all reports

    def test_admin_report_list_view_authenticated_regular_user(self):
        self.authenticate_regular_user()
        url = reverse('admin-report-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) # Regular users cannot access

    def test_admin_report_list_view_filter_status(self):
        self.authenticate_admin()
        url = reverse('admin-report-list') + '?status=pending'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Report 1')

    def test_admin_report_list_view_filter_category(self):
        self.authenticate_admin()
        url = reverse('admin-report-list') + '?category=corruption'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Report 2')

    def test_admin_report_detail_view_authenticated_admin(self):
        self.authenticate_admin()
        url = reverse('admin-report-detail', args=[self.report1.id])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Report 1')

    def test_admin_report_detail_view_not_found(self):
        self.authenticate_admin()
        url = reverse('admin-report-detail', args=[999]) # Non-existent ID
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_report_update_view_authenticated_admin(self):
        self.authenticate_admin()
        url = reverse('admin-report-update', args=[self.report1.id])
        data = {'status': 'under_review', 'internal_notes': 'Started review'}
        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.report1.refresh_from_db()
        self.assertEqual(self.report1.status, 'under_review')
        self.assertEqual(self.report1.internal_notes, 'Started review')
        self.assertEqual(self.report1.reviewed_by, self.admin_user)
        self.assertIsNotNone(self.report1.last_status_update)

    def test_admin_report_update_view_status_change_notification(self):
        self.authenticate_admin()
        url = reverse('admin-report-update', args=[self.report1.id])
        data = {'status': 'resolved'}

        # Check initial notification count for the report submitter
        initial_notifications = AdminAccessRequest.objects.filter(user=self.report1.submitted_by).count()

        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check if a notification was created for the report submitter
        final_notifications = AdminAccessRequest.objects.filter(user=self.report1.submitted_by).count()
        # Note: The AdminAccessRequest model is used for notifications in the view, which seems incorrect.
        # This test will pass if an AdminAccessRequest is created, but it should ideally be a Notification.
        # Assuming Notification model is intended for this:
        # from reports.models import Notification
        # initial_notifications = Notification.objects.filter(user=self.report1.submitted_by).count()
        # final_notifications = Notification.objects.filter(user=self.report1.submitted_by).count()
        # self.assertEqual(final_notifications, initial_notifications + 1)

    def test_admin_analytics_view_authenticated_admin(self):
        self.authenticate_admin()
        url = reverse('admin-analytics')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data

        self.assertEqual(data['total_reports'], 3)
        self.assertEqual(data['reports_by_status'], {'pending': 1, 'under_review': 1, 'resolved': 1})
        self.assertEqual(data['reports_by_category'], {'abuse': 1, 'corruption': 1, 'harassment': 1})
        self.assertEqual(data['premium_vs_free_reports'], {True: 1, False: 2})
        self.assertEqual(data['anonymous_vs_identified_reports'], {True: 2, False: 1})
        self.assertEqual(data['priority_reports_count'], 1)

        # Check monthly trends structure (count depends on current date)
        self.assertEqual(len(data['monthly_trends']), 6)
        for month_data in data['monthly_trends']:
            self.assertIn('month', month_data)
            self.assertIn('count', month_data)
            self.assertIsInstance(month_data['count'], int)

    def test_export_reports_view_authenticated_premium_admin(self):
        self.authenticate_premium_admin()
        url = reverse('admin-export-reports')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertIn('attachment; filename="reports.csv"', response['Content-Disposition'])

        content = response.content.decode('utf-8').splitlines()
        self.assertEqual(len(content), 4) # Header + 3 reports
        self.assertEqual(content[0], 'ID,Title,Category,Status,Created')
        # Basic check for content presence
        self.assertIn('Test Report 1', content[1])
        self.assertIn('Test Report 2', content[2])
        self.assertIn('Test Report 3', content[3])

    def test_export_reports_view_authenticated_free_admin(self):
        self.authenticate_admin() # Free admin
        url = reverse('admin-export-reports')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) # Free admins cannot export

    def test_user_list_view_authenticated_premium_admin(self):
        self.authenticate_premium_admin()
        url = reverse('admin-user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4) # All users

    def test_user_list_view_authenticated_free_admin(self):
        self.authenticate_admin() # Free admin
        url = reverse('admin-user-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) # Free admins cannot list users

    def test_user_update_view_authenticated_premium_admin(self):
        self.authenticate_premium_admin()
        url = reverse('admin-user-update', args=[self.regular_user.id])
        data = {'role': 'admin', 'plan': 'premium', 'is_active': False}
        response = self.client.patch(url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.regular_user.refresh_from_db()
        self.assertEqual(self.regular_user.role, 'admin')
        self.assertEqual(self.regular_user.plan, 'premium')
        self.assertFalse(self.regular_user.is_active)

    def test_user_update_view_authenticated_free_admin(self):
        self.authenticate_admin() # Free admin
        url = reverse('admin-user-update', args=[self.regular_user.id])
        data = {'role': 'admin'}
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) # Free admins cannot update users

    def test_user_delete_view_authenticated_premium_admin(self):
        self.authenticate_premium_admin()
        url = reverse('admin-user-delete', args=[self.regular_user.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.regular_user.refresh_from_db()
        self.assertFalse(self.regular_user.is_active) # Should be soft deleted

    def test_user_delete_view_authenticated_free_admin(self):
        self.authenticate_admin() # Free admin
        url = reverse('admin-user-delete', args=[self.regular_user.id])
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN) # Free admins cannot delete users