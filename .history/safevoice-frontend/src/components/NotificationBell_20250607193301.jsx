// src/components/Notifications/NotificationBell.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Bell, BellRing } from 'lucide-react'; // Import Lucide Icons

const NotificationBell = ({ unreadCount, onClick }) => {
    return (
        <div className="notification-bell-container" onClick={onClick}>
            {/* Conditionally render BellRing if there are unread notifications, otherwise Bell */}
            {unreadCount > 0 ? (
                <BellRing className="bell-icon" />
            ) : (
                <Bell className="bell-icon" />
            )}
            
            {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
            )}
        </div>
    );
};

NotificationBell.propTypes = {
    unreadCount: PropTypes.number.isRequired,
    onClick: PropTypes.func.isRequired,
};

export default NotificationBell;