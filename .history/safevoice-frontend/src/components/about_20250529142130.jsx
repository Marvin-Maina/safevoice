import React from 'react';
import { MessageSquare } from 'lucide-react';

const About = () => {
  return (
    <section className="py-16 bg-[#080a17] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div className="animate-fadeIn">
            <div className="flex items-center mb-6">
              <MessageSquare className="text-blue-400 h-6 w-6 mr-3" />
              <h2 className="text-3xl font-bold">Our Why</h2>
            </div>
            <h3 className="text-2xl font-semibold mb-6">
              SafeVoice began as a response to stories we couldn't ignore.
            </h3>
            <div className="space-y-4 text-gray-300">
              <p>
                In schools, workplaces, and communities, people were witnessing and experiencing abuse, threats, 
                and misconduct—but had no safe way to speak up. Fear of backlash, exposure, or not being 
                believed kept too many voices silent.
              </p>
              <p>
                We built SafeVoice to change that. It's anonymous, it's secure, it's your platform 
                to speak truth without fear—and start change.
              </p>
              <a 
                href="#learn-more" 
                className="inline-block text-blue-400 hover:text-blue-300 transition-colors duration-300 mt-4 group"
              >
                Learn how we protect your identity{' '}
                <span className="group-hover:translate-x-1 inline-block transition-transform duration-300">→</span>
              </a>
            </div>
          </div>
          
          {/* Image/Illustration */}
          <div className="relative">
            <div className="relative h-80 w-full md:h-96 animate-fadeInRight">
              <div className="absolute right-0 top-0 h-full w-full">
                <div className="relative h-full w-full">
                  {/* Microphone icon */}
                  <div className="absolute left-1/4 top-1/2 transform -translate-y-1/2 w-16 h-40 bg-blue-600/30 rounded-full blur-sm animate-pulse"></div>
                  
                  {/* Person silhouette */}
                  <div className="absolute right-0 top-0 h-full w-3/4">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="h-full w-full text-blue-800">
                      <path fill="currentColor" d="M100,0 C120,0 135,15 135,35 C135,55 120,70 100,70 C80,70 65,55 65,35 C65,15 80,0 100,0 Z M140,80 C140,80 140,80 140,80 C140,80 140,80 140,80 C140,80 150,85 150,95 L150,200 L50,200 L50,95 C50,85 60,80 60,80 C60,80 60,80 60,80 C60,80 80,90 100,90 C120,90 140,80 140,80 Z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-600/5 rounded-full filter blur-3xl"></div>
    </section>
  );
};

export default About;