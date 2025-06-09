import React, { useState, useEffect } from 'react';
import { Shield, Menu, X, LogOut, UserCircle, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // 'admin' or 'user'
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    const checkLoginStatus = () => {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        setIsLoggedIn(true);
        try {
          const decodedToken = jwtDecode(accessToken);
          setUserRole(decodedToken.role); // Assuming 'role' is in your JWT claims
        } catch (error) {
          console.error("Failed to decode token:", error);
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/login'); // Redirect to login page after logout
  };

  const handleScrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false); // Close menu after navigation
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900 shadow-xl' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to={isLoggedIn ? (userRole === 'admin' ? "/free-admin-dashboard" : "/my-reports") : "/"} className="flex items-center text-white text-2xl font-bold font-logo hover:text-blue-400 transition-colors duration-300">
              <Shield className="h-8 w-8 mr-2 text-blue-500" /> SafeVoice
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
            {isLoggedIn && (
              <>
                {userRole === 'admin' ? (
                  <Link
                    to="/free-admin-dashboard"
                    className="px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300"
                  >
                    Admin Dashboard
                  </Link>
                ) : ( // For non-admin users (e.g., 'user' role)
                  <Link
                    to="/my-reports"
                    className="px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300"
                  >
                    My Reports
                  </Link>
                )}
                <Link
                  to="/profile"
                  className="px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300 flex items-center space-x-2"
                >
                  <UserCircle className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 text-red-400 hover:text-red-300 rounded-md transition-colors duration-300 flex items-center space-x-2 border border-red-400 hover:border-red-300"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </>
            )}
            {!isLoggedIn && (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 shadow-md"
              >
                Login
              </Link>
            )}
            <a
              href="#submit-report"
              onClick={(e) => handleScrollToSection(e, 'submit-report')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 shadow-md"
            >
              Submit a Report
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} sm:hidden bg-gray-800 pb-4`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          {isLoggedIn && (
            <>
              {userRole === 'admin' ? (
                <Link
                  to="/free-admin-dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300"
                >
                  Admin Dashboard
                </Link>
              ) : ( // For non-admin users (e.g., 'user' role)
                <Link
                  to="/my-reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300"
                >
                  My Reports
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300"
              >
                Profile
              </Link>
              {/* Updated Logout Button Styling (Mobile) */}
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 text-red-400 hover:text-red-300 rounded-md transition-colors duration-300 flex items-center space-x-2 mt-2 border border-red-400 hover:border-red-300"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </>
          )}
          {!isLoggedIn && (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-300 mt-2"
            >
              Login
            </Link>
          )}
          <a
            href="#submit-report"
            onClick={(e) => handleScrollToSection(e, 'submit-report')}
            className="block px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors duration-300"
          >
            Submit a Report
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
