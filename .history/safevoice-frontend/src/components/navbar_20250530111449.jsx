import React, { useState, useEffect } from 'react';
import { Shield, Menu, X, UserCircle, LogOut } from 'lucide-react'; // Import UserCircle and LogOut icons
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // State to store user role
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const checkLoginStatus = () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        setIsLoggedIn(true);
        try {
          const decodedToken = jwtDecode(token);
          setUserRole(decodedToken.role); // Set the user's role from the token
        } catch (e) {
          console.error("Error decoding token:", e);
          // If token is invalid, clear storage and log out
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsLoggedIn(false);
          setUserRole(null);
        }
      } else {
        setIsLoggedIn(false);
        setUserRole(null);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Check login status on component mount and when local storage changes
    checkLoginStatus();
    window.addEventListener('storage', checkLoginStatus); // Listen for changes in local storage

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleScrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -64; // navbar height offset to prevent overlap
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setMobileMenuOpen(false); // close mobile menu on click
      // Update URL hash without jumping
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setUserRole(null);
    navigate('/login'); // Redirect to login page after logout
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0a0c1b]/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-2 text-white text-xl font-bold">
              <Shield className="h-7 w-7 text-blue-400" />
              <span>SafeVoice</span>
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-8">
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
            {isLoggedIn && userRole === 'admin' && ( // Show Admin Dashboard link only if admin
               <Link
                to="/free-admin-dashboard"
                className="text-white hover:text-blue-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
               >
                 Admin Dashboard
               </Link>
            )}
            {isLoggedIn ? (
              <>
                <Link
                  to="/profile"
                  className="text-white hover:text-blue-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full flex items-center"
                >
                  <UserCircle className="h-5 w-5 mr-1" /> Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center"
                >
                  <LogOut className="h-5 w-5 mr-1" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-white hover:text-blue-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300"
                >
                  Register
                </Link>
              </>
            )}
            <a
              href="#submit-report"
              onClick={(e) => handleScrollToSection(e, 'submit-report')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-300 hidden md:block"
            >
              Submit Report
            </a>
          </div>
          <div className="-mr-2 flex md:hidden">
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
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-[#0a0c1b]/95 backdrop-blur-sm`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
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
            {isLoggedIn && userRole === 'admin' && (
              <Link
                to="/free-admin-dashboard"
                className="block px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300"
              >
                Admin Dashboard
              </Link>
            )}
          {isLoggedIn ? (
            <>
              <Link
                to="/profile"
                className="block px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300 flex items-center"
              >
                <UserCircle className="h-5 w-5 mr-1" /> Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-300 flex items-center"
              >
                <LogOut className="h-5 w-5 mr-1" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="block px-3 py-2 text-white hover:bg-blue-700/30 rounded-md transition-colors duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-300"
              >
                Register
              </Link>
            </>
          )}
          <a
            href="#submit-report"
            onClick={(e) => handleScrollToSection(e, 'submit-report')}
            className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-300"
          >
            Submit Report
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;