// src/components/Notifications/NotificationDropdown.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import NotificationBell from './NotificationBell';
import NotificationsList from './NotificationsList';
import { useAuth } from '../../AuthContext'; // Import useAuth here if you need user/isLoggedIn state

const NotificationDropdown = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const { user, isLoggedIn } = useAuth(); // Use useAuth to get user info

    // Function to toggle the dropdown's visibility
    const toggleDropdown = useCallback(() => {
        setIsDropdownOpen(prev => !prev);
    }, []);

    // Function to handle clicks outside the dropdown to close it
    const handleClickOutside = useCallback((event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false); // Correctly closes the dropdown
        }
    }, []); // No dependencies needed for useCallback as it references stable state setter

    // Use effect for adding/removing click outside listener
    useEffect(() => {
        // Add event listener when component mounts
        document.addEventListener('mousedown', handleClickOutside);

        // Clean up event listener when component unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]); // Re-run effect if handleClickOutside changes (though useCallback makes it stable)

    // Placeholder for WebSocket connection
    useEffect(() => {
        let ws = null;

        if (isLoggedIn && user && user.id) {
            const userId = user.id; // Get user ID from AuthContext
            const WS_URL = `ws://localhost:8000/ws/notifications/${userId}/`; // Your WebSocket URL

            ws = new WebSocket(WS_URL);

            ws.onopen = () => {
                console.log('WebSocket connected for notifications.');
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'notification' && data.message) {
                    console.log("New notification received via WebSocket:", data.message);
                    // Trigger a re-fetch of notifications or update count
                    setUnreadCount(prevCount => prevCount + 1); // Increment count for new unread
                    // You might also want to trigger a full list refresh if dropdown is open
                    // Or manage the list directly here by adding the new notification to state
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected.');
            };
        } else {
            console.log("WebSocket not connecting: User not logged in or user ID not available.");
        }

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, [isLoggedIn, user]); // Reconnect WebSocket if login status or user changes

    // Callback to update unread count from NotificationsList
    const handleUnreadCountUpdate = useCallback((count) => {
        setUnreadCount(count);
    }, []);

    // If user is not logged in, don't render the dropdown
    if (!isLoggedIn) {
        return null;
    }

    return (
        <div className="notification-dropdown" ref={dropdownRef}>
            <NotificationBell unreadCount={unreadCount} onClick={toggleDropdown} />

            {isDropdownOpen && (
                <div className="notification-panel">
                    <NotificationsList
                        onNotificationRead={handleUnreadCountUpdate}
                        onMarkAllRead={handleUnreadCountUpdate} // Pass same callback for mark all
                    />
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;