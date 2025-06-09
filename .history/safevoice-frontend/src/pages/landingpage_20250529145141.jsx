import React from 'react';
import HeroSection from '../components/hero';
import About from '../components/about';
import { useNavigate } from 'react-router-dom';
// import more sections as needed...

const LandingPage = () => {
  return (
    <main>
      <HeroSection />
      <About />
      {/* More sections */}
    </main>
  );
};

export default LandingPage;
