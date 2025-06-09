import React, { useState, useEffect } from 'react';
import { Shield, Menu, X, LogOut, UserCircle, Settings } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
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
          setUserRole(decodedToken.role);
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
    navigate('/login');
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
            <Link
              to="/become-admin"
              className="text-white hover:text-blue-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
            >
              Become Admin/Org
            </Link>

           {isLoggedIn && (
                <>
                  {userRole === 'admin' ? (
                    <Link
                      to="/free-admin-dashboard"
                      className="text-white hover:text-blue-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/my-reports"
                      className="text-white hover:text-blue-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
                    >
                      My Reports
                    </Link>
                  ) : }  
                <Link
                  to="/profile"
                  className="text-white hover:text-blue-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
                >
                  Profile
                </Link>
                {/* Updated Logout Button Styling (Desktop) */}
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 px-4 py-2 rounded-md transition-colors duration-300 flex items-center space-x-2 border border-red-400 hover:border-red-300"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            )}

            {!isLoggedIn && (
              <Link
                to="/login"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
              >
                Login
              </Link>
            )}

            
             <Link to="/submit-report"
              onClick={(e) => handleScrollToSection(e, 'submit-report')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300 hidden lg:inline-block"
            >
              Submit Report
            </Link>
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
        <Link
          to="/become-admin"
          className="block px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300"
        >
          Become Admin/Org
        </Link>
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