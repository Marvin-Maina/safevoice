import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Menu, X, LogOut, Bell } from 'lucide-react'; // Import Bell icon
import { Link } from 'react-router-dom';
import {use}
import NotificationDropdown from './NotificationDropdown'; // Import the new component
import axios from 'axios'; // Import axios for fetching notifications

const Navbar = () => {
  // Use the useAuth hook to get authentication state and user role
  const { isAuthenticated, userRole, logout, accessToken } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false); // State for notification dropdown
  const [unreadCount, setUnreadCount] = useState(0); // State for unread notifications

  // Function to fetch unread notification count
  const fetchUnreadCount = useCallback(async () => {
    // Only fetch if user is authenticated and accessToken is available
    if (!isAuthenticated || !accessToken) {
      setUnreadCount(0);
      return;
    }
    try {
      const response = await axios.get('/api/reports/notifications/', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const unreadNotifications = response.data.filter(notif => !notif.is_read);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
      setUnreadCount(0); // Reset on error
    }
  }, [isAuthenticated, accessToken]); // Dependencies for useCallback

  // Fetch count on component mount and periodically
  useEffect(() => {
    fetchUnreadCount(); // Initial fetch

    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, [fetchUnreadCount]); // Re-run effect if fetchUnreadCount changes

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout(); // Use the logout function from AuthContext
  };

  const handleScrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -64;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setMobileMenuOpen(false);
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
  };

  const closeNotifications = () => {
    setShowNotifications(false);
    fetchUnreadCount(); // Re-fetch count after closing, in case some were marked read
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0a0c1b]/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Name */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <Shield className="h-8 w-8 text-blue-400" />
              <span className="ml-2 text-xl font-bold text-white">SafeVoice</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <a
              href="#about"
              onClick={(e) => handleScrollToSection(e, 'about')}
              className="text-white hover:text-blue-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
            >
              About
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleScrollToSection(e, 'how-it-works')}
              className="text-white hover:text-blue-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
            >
              How It Works
            </a>
            <a
              href="#faq"
              onClick={(e) => handleScrollToSection(e, 'faq')}
              className="text-white hover:text-blue-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
            >
              FAQ
            </a>
            {/* Conditional links based on authentication and role */}
            {isAuthenticated && userRole === 'user' && (
              <Link
                to="/become-admin"
                className="text-white hover:text-blue-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
              >
                Become Admin/Org
              </Link>
            )}
            {isAuthenticated && userRole === 'admin' && (
              <Link
                to="/free-admin-dashboard"
                className="text-white hover:text-blue-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
              >
                Admin Dashboard
              </Link>
            )}
            {isAuthenticated && (
              <Link
                to="/profile"
                className="text-white hover:text-blue-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
              >
                Profile
              </Link>
            )}

            {/* Notification Bell for authenticated users */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="text-white hover:text-blue-300 transition-colors duration-300 relative p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Notifications"
                >
                  <Bell className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationDropdown onClose={closeNotifications} />
                )}
              </div>
            )}

            {/* Login/Register or Logout Button */}
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 px-4 py-2 rounded-md transition-colors duration-300 flex items-center space-x-2 border border-red-400 hover:border-red-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
              >
                Login
              </Link>
            )}

            <a
              href="#submit-report"
              onClick={(e) => handleScrollToSection(e, 'submit-report')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300 hidden lg:inline-block"
            >
              Submit Report
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-[#0a0c1b] px-2 pt-2 pb-3 space-y-1 sm:px-3`}>
        <a
          href="#about"
          onClick={(e) => handleScrollToSection(e, 'about')}
          className="block px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300"
        >
          About
        </a>
        <a
          href="#how-it-works"
          onClick={(e) => handleScrollToSection(e, 'how-it-works')}
          className="block px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300"
        >
          How It Works
        </a>
        <a
          href="#faq"
          onClick={(e) => handleScrollToSection(e, 'faq')}
          className="block px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300"
        >
          FAQ
        </a>
        {isAuthenticated && userRole === 'user' && (
          <Link
            to="/become-admin"
            className="block px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300"
          >
            Become Admin/Org
          </Link>
        )}
        {isAuthenticated && userRole === 'admin' && (
          <Link
            to="/free-admin-dashboard"
            className="block px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300"
          >
            Admin Dashboard
          </Link>
        )}
        {isAuthenticated && (
          <Link
            to="/profile"
            className="block px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300"
          >
            Profile
          </Link>
        )}

        {/* Mobile Notification Bell */}
        {isAuthenticated && (
          <div className="relative">
            <button
              onClick={toggleNotifications}
              className="block w-full text-left px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300 flex items-center"
            >
              <Bell className="h-5 w-5 mr-2" /> Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationDropdown onClose={closeNotifications} />
            )}
          </div>
        )}

        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="block w-full text-left px-3 py-2 text-red-400 hover:text-red-300 rounded-md transition-colors duration-300 flex items-center space-x-2 mt-2 border border-red-400 hover:border-red-300"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-300 mt-2"
          >
            Login
          </Link>
        )}
        <a
          href="#submit-report"
          onClick={(e) => handleScrollToSection(e, 'submit-report')}
          className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-300 mt-2"
        >
          Submit Report
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
