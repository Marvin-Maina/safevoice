// src/components/Notifications/NotificationsList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import NotificationItem from './NotificationItem';
import PropTypes from 'prop-types';

const NotificationsList = ({ onNotificationRead }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Placeholder for API Calls ---
    // You will need to replace these with your actual fetch/axios implementation.
    // Remember to include your authentication token in the headers.

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Replace with your actual API call to get notifications
            const token = localStorage.getItem('accessToken'); // Assuming token is here
            const response = await fetch('/api/notifications/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setNotifications(data);

            // After fetching, notify parent of the current unread count
            const currentUnreadCount = data.filter(n => !n.is_read).length;
            if (onNotificationRead) {
                onNotificationRead(currentUnreadCount);
            }
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError("Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    }, [onNotificationRead]);

    const markNotificationAsRead = useCallback(async (id) => {
        try {
            // Replace with your actual API call to mark a notification as read
            const token = localStorage.getItem('accessToken'); // Assuming token is here
            const response = await fetch(`/api/notifications/${id}/mark_read/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setNotifications(prevNotifications =>
                prevNotifications.map(notif =>
                    notif.id === id ? { ...notif, is_read: true } : notif // Optimistic UI update
                )
            );
            if (onNotificationRead) { // Notify parent to update unread count
                onNotificationRead(); // Trigger a re-evaluation of unread count in parent
            }
        } catch (err) {
            console.error(`Error marking notification ${id} as read:`, err);
            setError("Failed to mark notification as read.");
            fetchNotifications(); // Re-fetch to ensure consistency on error
        }
    }, [onNotificationRead, fetchNotifications]);

    const markAllNotificationsAsRead = useCallback(async () => {
        const unreadNotifications = notifications.filter(n => !n.is_read);
        const token = localStorage.getItem('accessToken'); // Assuming token is here

        const markPromises = unreadNotifications.map(n => 
            fetch(`/api/notifications/${n.id}/mark_read/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
        );

        try {
            await Promise.all(markPromises); // Mark all unread notifications as read
            fetchNotifications(); // Re-fetch all to ensure consistent state
            if (onNotificationRead) { // Notify parent
                onNotificationRead();
            }
        } catch (err) {
            console.error("Error marking all notifications as read:", err);
            setError("Failed to mark all notifications as read.");
        }
    }, [notifications, fetchNotifications, onNotificationRead]);
    // --- End Placeholder for API Calls ---

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    if (loading) return <p>Loading notifications...</p>;
    if (error) return <p className="error">{error}</p>;

    const unreadCount = notifications.filter(notif => !notif.is_read).length;

    return (
        <div className="notification-list-panel">
            {unreadCount > 0 && (
                <button onClick={markAllNotificationsAsRead} className="mark-all-read-btn">
                    Mark All As Read
                </button>
            )}
            <ul className="notification-list">
                {notifications.length === 0 ? (
                    <li>No notifications found.</li>
                ) : (
                    notifications.map(notification => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkAsRead={markNotificationAsRead}
                        />
                    ))
                )}
            </ul>
        </div>
    );
};

NotificationsList.propTypes = {
    onNotificationRead: PropTypes.func, // Callback for when a notification is marked read
};

export default NotificationsList;