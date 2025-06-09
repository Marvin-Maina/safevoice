import React from 'react';
import { Shield } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 animate-fadeIn">
          <span className="bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">Anonymous Reporting</span>
          <br />
          <span className="bg-gradient-to-r from-blue-300 to-white bg-clip-text text-transparent">Made Safe</span>
        </h1>
        <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto animate-fadeInUp">
          Empowering voices, protecting identities.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fadeInUp animation-delay-200">
          <a 
            href="#report" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-600/50"
          >
            <Shield className="mr-2 h-5 w-5" />
            Report Anonymously
          </a>
          <a 
            Link to ="become-admin" 
            className="inline-flex items-center px-6 py-3 bg-transparent border border-blue-600 text-white font-medium rounded-md hover:bg-blue-900/20 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-600/30"
          >
            Become Admin/Org
          </a>
        </div>
      </div>

      {/* Animated gradient circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse animation-duration-7000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl animate-pulse animation-delay-2000 animation-duration-8000"></div>
      
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" aria-hidden="true"></div>
    </section>
  );
};

export default HeroSection;