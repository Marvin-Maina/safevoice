import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {use}
import { Bell, CheckCircle, XCircle, Loader2, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = ({ onClose }) => {
  const { accessToken, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dropdownRef = useRef(null); // Ref for click outside detection
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    if (!isAuthenticated || !accessToken) {
      setError('Authentication required to view notifications.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/api/reports/notifications/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      // Sort by created_at newest first
      const sortedNotifications = response.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNotifications(sortedNotifications);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Could not load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Click outside to close dropdown
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAuthenticated, accessToken, onClose]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.post(`/api/reports/notifications/${notificationId}/mark-read/`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      // Optimistically update UI
      setNotifications(prevNotifs =>
        prevNotifs.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError('Failed to mark notification as read.');
    }
  };

  const markAllAsRead = async () => {
    try {
      // Filter for unread notifications to avoid unnecessary requests
      const unreadNotifIds = notifications.filter(notif => !notif.is_read).map(notif => notif.id);
      
      // Send individual requests for simplicity, or implement a bulk endpoint if available
      await Promise.all(unreadNotifIds.map(id => 
        axios.post(`/api/reports/notifications/${id}/mark-read/`, {}, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      ));

      setNotifications(prevNotifs =>
        prevNotifs.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      setError('Failed to mark all notifications as read.');
    }
  };

  const handleNotificationClick = (reportId) => {
    onClose(); // Close dropdown
    navigate(`/reports/${reportId}`); // Navigate to report detail page
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#1a1c38] rounded-lg shadow-xl border border-blue-900/30 overflow-hidden z-50 animate-fade-in-down"
      style={{ top: 'calc(100% + 10px)' }} // Position below the bell icon
    >
      <div className="p-4 border-b border-blue-900/40 flex justify-between items-center">
        <h4 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-400" /> Notifications
        </h4>
        {notifications.some(notif => !notif.is_read) && (
          <button
            onClick={markAllAsRead}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors duration-200"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-4 text-center text-gray-400 flex items-center justify-center">
          <Loader2 className="animate-spin mr-2 h-5 w-5" /> Loading notifications...
        </div>
      ) : error ? (
        <div className="p-4 text-center text-red-400">
          {error}
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          No new notifications.
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 border-b border-gray-800 cursor-pointer transition-colors duration-200 ${
                notif.is_read ? 'bg-gray-800 text-gray-400' : 'bg-[#1a1c38] hover:bg-gray-800 text-white'
              }`}
              onClick={() => notif.report && handleNotificationClick(notif.report)}
            >
              <div className="flex items-center justify-between mb-1">
                <p className={`font-medium ${notif.is_read ? 'text-gray-400' : 'text-white'}`}>
                  {notif.report_title ? `Report: ${notif.report_title}` : 'General Update'}
                </p>
                {!notif.is_read && (
                  <button
                    onClick={(e) => { e.stopPropagation(); markAsRead(notif.id); }}
                    className="text-blue-400 hover:text-blue-300 text-xs transition-colors duration-200"
                    title="Mark as read"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-sm">{notif.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notif.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
