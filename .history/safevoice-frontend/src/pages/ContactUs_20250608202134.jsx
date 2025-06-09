import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Info } from 'lucide-react'; // Importing icons

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [formStatus, setFormStatus] = useState(''); // 'success', 'error', or ''

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('sending');
    // Simulate API call
    setTimeout(() => {
      console.log('Form Data Submitted:', formData);
      setFormStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' }); // Clear form
    }, 1500); // Simulate network delay

    // In a real application, you would send this data to your backend:
    /*
    axios.post('/api/contact', formData)
      .then(response => {
        setFormStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      })
      .catch(error => {
        setFormStatus('error');
        console.error('Contact form submission error:', error);
      });
    */
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse animation-duration-7000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl animate-pulse animation-delay-2000 animation-duration-8000"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" aria-hidden="true"></div>

      <div className="relative z-10 max-w-4xl w-full bg-gray-800/70 rounded-3xl shadow-2xl p-8 sm:p-10 border border-blue-600/30 backdrop-blur-xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-4 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-300 font-light">
            We'd love to hear from you! Fill out the form below or use our contact details.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Information Section */}
          <div className="space-y-8 p-6 bg-gray-700/60 rounded-2xl border border-gray-600/30 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3 mb-6">
              <Info className="h-7 w-7 text-blue-400" /> Our Details
            </h2>
            <div className="flex items-center gap-4 text-gray-300">
              <Mail className="h-6 w-6 text-blue-400" />
              <div>
                <span className="font-medium text-white">Email:</span>
                <p>support@example.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              <Phone className="h-6 w-6 text-green-400" />
              <div>
                <span className="font-medium text-white">Phone:</span>
                <p>+1 (123) 456-7890</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-300">
              <MapPin className="h-6 w-6 text-red-400" />
              <div>
                <span className="font-medium text-white">Address:</span>
                <p>123 Whistleblower Ave, Complaint City, CC 12345</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mt-6">
              Feel free to reach out to us during business hours (Mon-Fri, 9 AM - 5 PM).
            </p>
          </div>

          {/* Contact Form Section */}
          <div className="p-6 bg-gray-700/60 rounded-2xl border border-gray-600/30 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3 mb-6">
              <Send className="h-7 w-7 text-purple-400" /> Send Us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-300 text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Your Name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-gray-300 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-gray-300 text-sm font-medium mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Subject of your message"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-gray-300 text-sm font-medium mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  placeholder="Your detailed message..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={formStatus === 'sending'}
              >
                {formStatus === 'sending' ? (
                  <>
                    <Mail className="h-5 w-5 animate-pulse" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" /> Send Message
                  </>
                )}
              </button>

              {formStatus === 'success' && (
                <div className="mt-4 p-4 bg-green-500/20 text-green-300 rounded-lg border border-green-500/30 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  <span>Message sent successfully! We'll get back to you soon.</span>
                </div>
              )}
              {formStatus === 'error' && (
                <div className="mt-4 p-4 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30 flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  <span>Failed to send message. Please try again later.</span>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;