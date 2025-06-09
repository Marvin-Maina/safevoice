import React from 'react';
import HeroSection from '../components/hero';
import About from '../components/about';
import HowItWorks from '../components/owitworks';
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
