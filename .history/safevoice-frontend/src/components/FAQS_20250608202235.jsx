import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How is my anonymity protected?",
      answer: "SafeVoice uses advanced encryption and never collects identifying information. Your reports are completely anonymous, and we don't track IP addresses or require any personal details."
    },
    {
      question: "Who can see my report?",
      answer: "Only verified administrators of your organization have access to reports. All administrators undergo strict verification and are bound by confidentiality agreements."
    },
    {
      question: "What types of incidents should I report?",
      answer: "You can report any concerns about misconduct, harassment, safety issues, or ethical violations. If you're unsure, it's better to report and let our administrators assess the situation."
    },
    {
      question: "Can I follow up on my report?",
      answer: "Yes. Each report receives a unique reference number. You can use this to check the status of your report or provide additional information while maintaining anonymity."
    },
    {
      question: "What happens after I submit a report?",
      answer: "Your report is encrypted and sent to verified administrators. They review the information, investigate if necessary, and take appropriate action while protecting your identity."
    }
  ];

  return (
    <section id="faq" className="py-16 bg-[#080a17] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fadeIn">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="h-8 w-8 text-blue-400 mr-3" />
            <h2 className="text-3xl md:text-4xl font-bold">Frequently Asked Questions</h2>
          </div>
          <p className="text-gray-300 text-lg">
            Find answers to common questions about using SafeVoice
          </p>
        </div>

        <div className="space-y-4 animate-fadeInUp">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#0d0f1e] rounded-lg border border-blue-900/20 overflow-hidden transition-all duration-300"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-lg">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="h-5 w-5 text-blue-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-blue-400" />
                )}
              </button>
              
              <div
                className={`px-6 transition-all duration-300 ${
                  openIndex === index ? 'py-4 border-t border-blue-900/20' : 'max-h-0 overflow-hidden'
                }`}
              >
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center animate-fadeInUp animation-delay-200">
          <p className="text-gray-300 mb-4">Still have questions?</p>
         Link 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-600/50"
          >
            Contact Support
          </a>
        </div>
      </div>

      {/* Background elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-600/5 rounded-full filter blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-600/5 rounded-full filter blur-3xl"></div>
    </section>
  );
};

export default FAQ;