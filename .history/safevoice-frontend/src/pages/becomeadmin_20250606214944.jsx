import React, { useState } from 'react';
import { Building2, Shield, Loader2 } from 'lucide-react';

const BecomeAdmin = () => {
  const [formData, setFormData] = useState({
    applicantType: 'individual',
    organizationType: '',
    organizationName: '',
    email: '',
    phone: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const payload = {
      request_type: formData.applicantType,
      email: formData.email,
      phone: formData.phone,
      justification: formData.description,
    };

    if (formData.applicantType === 'organization') {
      payload.organization_type = formData.organizationType;
      payload.organization_name = formData.organizationName;
    }

    try {
      // Simulating API call for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setMessage({ type: 'success', text: 'Application submitted successfully! You will be notified upon approval.' });
      setFormData({
        applicantType: 'individual',
        organizationType: '',
        organizationName: '',
        email: '',
        phone: '',
        description: '',
      });
    } catch (error) {
      console.error("Submission error:", error);
      setMessage({ type: 'error', text: `Oops, something went wrong: ${error.message}. Please try again.` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111327] via-[#111327] to-[#0a0c1b] pt-24 pb-16 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="bg-[#111327] p-8 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">
          {/* Header with enhanced styling */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mb-4 shadow-lg">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Admin Access Application
            </h2>
            <p className="text-gray-400">Join our platform as an administrator</p>
          </div>

          {/* Enhanced Messages */}
          {message.text && (
            <div
              className={`p-4 rounded-xl mb-6 border-l-4 shadow-lg ${
                message.type === 'success' 
                  ? 'bg-gradient-to-r from-green-900/80 to-green-800/60 border-green-500 text-green-100' 
                  : 'bg-gradient-to-r from-red-900/80 to-red-800/60 border-red-500 text-red-100'
              } backdrop-blur-sm animate-fade-in`}
            >
              {message.text}
            </div>
          )}

          {/* Enhanced Applicant type toggle */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-200">Application Type</h3>
            <div className="flex space-x-4">
              {['individual', 'organization'].map((type) => (
                <label 
                  key={type}
                  className={`flex-1 relative cursor-pointer transition-all duration-300 ${
                    formData.applicantType === type 
                      ? 'transform scale-105' 
                      : 'hover:scale-102'
                  }`}
                >
                  <input
                    type="radio"
                    name="applicantType"
                    value={type}
                    checked={formData.applicantType === type}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    formData.applicantType === type
                      ? 'border-blue-500 bg-gradient-to-br from-blue-900/40 to-blue-800/20 shadow-lg shadow-blue-500/20'
                      : 'border-gray-600 bg-gradient-to-br from-gray-800/40 to-gray-700/20 hover:border-gray-500'
                  }`}>
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-2 ${
                        formData.applicantType === type
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}>
                        {type === 'individual' ? '👤' : '🏢'}
                      </div>
                      <div className="font-medium capitalize text-gray-200">{type} Admin</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Enhanced Org-only fields */}
            {formData.applicantType === 'organization' && (
              <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-200" htmlFor="organizationType">
                    Organization Type
                  </label>
                  <div className="relative">
                    <select
                      id="organizationType"
                      name="organizationType"
                      value={formData.organizationType}
                      onChange={handleChange}
                      className="w-full bg-[#0a0c1b] border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-200 shadow-inner appearance-none"
                      required
                    >
                      <option value="">Select type</option>
                      <option value="education">Educational Institution</option>
                      <option value="corporate">Corporate Organization</option>
                      <option value="government">Government Agency</option>
                      <option value="nonprofit">Non-profit Organization</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-200" htmlFor="organizationName">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="w-full bg-[#0a0c1b] border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-200 shadow-inner placeholder-gray-500"
                    placeholder="Enter organization name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Enhanced Common fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-200" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#0a0c1b] border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-200 shadow-inner placeholder-gray-500"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-200" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#0a0c1b] border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-200 shadow-inner placeholder-gray-500"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200" htmlFor="description">
                Why do you want to implement SafeVoice?
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full bg-[#0a0c1b] border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-gray-200 shadow-inner placeholder-gray-500 resize-none"
                placeholder="Describe your use case, goals, and how SafeVoice will benefit your organization or community..."
                required
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className={`group relative px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 transform ${
                  loading 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:scale-105 shadow-lg hover:shadow-blue-500/25'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                disabled={loading}
              >
                <div className="flex items-center justify-center">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Application</span>
                      <Shield className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
                {!loading && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BecomeAdmin;