// src/components/Notifications/NotificationItem.jsx
import React from 'react';
import PropTypes from 'prop-types';

const NotificationItem = ({ notification, onMarkAsRead }) => {
    const { id, message, is_read, created_at, report_title, report } = notification;

    const handleMarkRead = () => {
        if (onMarkAsRead) {
            onMarkAsRead(id);
        }
    };

    const formattedDate = new Date(created_at).toLocaleString();

    return (
        <li className={`notification-item ${is_read ? 'read' : 'unread'}`}>
            <p>{message}</p>
            {report_title && (
                // Assuming you have a frontend route for individual reports like /reports/:id
                <a href={`/reports/${report}`}>Report: {report_title}</a>
            )}
            <span className="timestamp">{formattedDate}</span>
            {!is_read && (
                <button onClick={handleMarkRead} className="mark-read-btn">
                    Mark as Read
                </button>
            )}
        </li>
    );
};

NotificationItem.propTypes = {
    notification: PropTypes.shape({
        id: PropTypes.number.isRequired,
        message: PropTypes.string.isRequired,
        is_read: PropTypes.bool.isRequired,
        created_at: PropTypes.string.isRequired,
        report_title: PropTypes.string,
        report: PropTypes.number,
    }).isRequired,
    onMarkAsRead: PropTypes.func.isRequired,
};

export default NotificationItem;