import React from 'react';
import { Shield, Heart, Github, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#070914] py-12 border-t border-blue-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <a href="/" className="flex items-center text-xl font-bold mb-4">
              <Shield className="h-6 w-6 mr-2 text-blue-500" />
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">SafeVoice</span>
            </a>
            <p className="text-gray-400 text-sm">
              Empowering voices, protecting identities. Your secure platform for anonymous reporting.
            </p>
            <div className="flex mt-4 space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">About</a>
              </li>
              <li>
                <a href="#how-it-works" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">How It Works</a>
              </li>
              <li>
                <a href="#faq" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">FAQ</a>
              </li>
              <li>
                <a href="#report" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">Submit Report</a>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#privacy" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">Terms of Service</a>
              </li>
              <li>
                <a href="#cookies" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">Cookie Policy</a>
              </li>
              <li>
                <a href="#security" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">Security</a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a href="#support" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">Support</a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">Contact Us</a>
              </li>
              <li>
                <a href="#become-admin" className="text-gray-400 hover:text-blue-400 transition-colors duration-300">Become Admin/Org</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-blue-900/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} SafeVoice. All rights reserved.
          </p>
          <p className="text-gray-400 text-sm flex items-center mt-4 md:mt-0">
            Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for a safer world
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;