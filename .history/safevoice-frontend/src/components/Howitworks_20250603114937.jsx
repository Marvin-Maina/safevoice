import React from 'react';
import { Shield, Lock, UserCheck, MessageSquare } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <Shield className="h-8 w-8 text-blue-400" />,
      title: "Submit Report",
      description: "Fill out our secure form with your concerns. No personal information required."
    },
    {
      icon: <Lock className="h-8 w-8 text-blue-400" />,
      title: "Encryption & Processing",
      description: "Your report is encrypted and processed through our secure system."
    },
    {
      icon: <UserCheck className="h-8 w-8 text-blue-400" />,
      title: "Admin Review",
      description: "Verified administrators review and assess the report."
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-blue-400" />,
      title: "Action Taken",
      description: "Appropriate actions are taken while maintaining your anonymity."
    }
  ];

  return (
    <section id="how-it-works" className="py-16 bg-[#080a17] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fadeIn">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">How SafeVoice Works</h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Our platform ensures your voice is heard while keeping your identity protected.
            Here's how the process works:
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-[#0d0f1e] p-6 rounded-lg border border-blue-900/20 transform hover:scale-105 transition-all duration-300 animate-fadeInUp"
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-[#080a17] p-2 rounded-full border border-blue-900/20">
                  {step.icon}
                </div>
              </div>
              
              <div className="mt-8 text-center">
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-300">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <div className="w-8 h-0.5 bg-blue-900/20"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center animate-fadeInUp animation-delay-200">
          <Link to="/submit-report" ></Link>
            href="#submit-report"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-600/50"
          >
            <Shield className="mr-2 h-5 w-5" />
            Submit Your Report
          
        </div>
      </div>

      {/* Background elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-600/5 rounded-full filter blur-3xl"></div>
    </section>
  );
};

export default HowItWorks;