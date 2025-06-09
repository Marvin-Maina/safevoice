import React, { useState, useEffect } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0a0c1b]/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center text-xl font-bold group">
              <Shield className="h-6 w-6 mr-2 text-blue-500 group-hover:text-blue-400 transition-colors duration-300" />
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">SafeVoice</span>
            </a>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-8">
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

            <a
              href="#submit-report"
              onClick={(e) => handleScrollToSection(e, 'submit-report')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-blue-600/30"
            >
              Submit Report
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="text-gray-300 hover:text-white transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0c1b]/95 backdrop-blur-sm shadow-lg animate-fadeIn">
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
             className="text-white hover:text-blue-300 transition-colors duration-300 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-blue-400 after:transition-all hover:after:w-full"
                >
            Become Admin/Org
            </Link>

            <a
              href="#submit-report"
              onClick={(e) => handleScrollToSection(e, 'submit-report')}
              className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all duration-300 shadow-md hover:shadow-blue-600/30"
            >
              Submit Report
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
