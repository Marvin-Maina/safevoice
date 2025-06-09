import React, { useState } from 'react';
import { Building2, Shield, Loader2, CheckCircle, AlertCircle, User, Users, Mail, Phone, FileText } from 'lucide-react';

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
      const response = await fetch('/api/accounts/admin-access-request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Submission failed');
      }

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
    <div className="min-h-screen bg-[#0f1419] pt-24 pb-16 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#4f46e5]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#4f46e5]/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4f46e5]/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-20 left-20 w-2 h-2 bg-[#4f46e5] rounded-full animate-ping"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-[#4f46e5] rounded-full animate-ping delay-700"></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-[#4f46e5]/60 rounded-full animate-pulse delay-300"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#4f46e5] rounded-full mb-6 shadow-2xl transform hover:scale-110 transition-all duration-500 animate-bounce">
            <Shield className="w-10 h-10 text-white drop-shadow-lg" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">
            Become an Admin
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Join our trusted community of administrators and help maintain a safe, secure environment for everyone.
          </p>
        </div>

        <div className="bg-[#1a1f2e]/80 backdrop-blur-xl border border-gray-700/50 p-10 rounded-3xl shadow-2xl hover:shadow-[#4f46e5]/10 transition-all duration-700 animate-slide-up">
          <h2 className="text-3xl font-semibold mb-8 flex items-center text-white">
            <div className="p-2 bg-[#4f46e5] rounded-xl mr-4 shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            Application Form
          </h2>

          {/* Messages */}
          {message.text && (
            <div
              className={`p-5 rounded-2xl mb-8 flex items-center space-x-4 transition-all duration-500 transform animate-bounce-in shadow-lg ${
                message.type === 'success' 
                  ? 'bg-green-500/20 border border-green-400/40 text-green-100' 
                  : 'bg-red-500/20 border border-red-400/40 text-red-100'
              }`}
            >
              <div className={`p-2 rounded-full ${message.type === 'success' ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-6 h-6 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                )}
              </div>
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          {/* Applicant type toggle */}
          <div className="mb-8 p-6 bg-[#0f1419]/50 rounded-2xl border border-gray-700/30">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-[#4f46e5]" />
              Application Type
            </h3>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="radio"
                    name="applicantType"
                    value="individual"
                    checked={formData.applicantType === 'individual'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                    formData.applicantType === 'individual' 
                      ? 'border-[#4f46e5] bg-[#4f46e5] shadow-lg shadow-[#4f46e5]/50' 
                      : 'border-gray-400 group-hover:border-[#4f46e5]/60'
                  }`}>
                    {formData.applicantType === 'individual' && (
                      <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-scale-in"></div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-[#4f46e5]" />
                  <span className="text-white font-medium">Individual Admin</span>
                </div>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="radio"
                    name="applicantType"
                    value="organization"
                    checked={formData.applicantType === 'organization'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                    formData.applicantType === 'organization' 
                      ? 'border-[#4f46e5] bg-[#4f46e5] shadow-lg shadow-[#4f46e5]/50' 
                      : 'border-gray-400 group-hover:border-[#4f46e5]/60'
                  }`}>
                    {formData.applicantType === 'organization' && (
                      <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-scale-in"></div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-[#4f46e5]" />
                  <span className="text-white font-medium">Organization</span>
                </div>
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Org-only fields */}
            {formData.applicantType === 'organization' && (
              <div className="grid md:grid-cols-2 gap-6 animate-slide-down">
                <div className="group">
                  <label className="block text-sm font-medium mb-3 text-gray-300 flex items-center\" htmlFor="organizationType">
                    <Building2 className="w-4 h-4 mr-2" />
                    Organization Type
                  </label>
                  <select
                    id="organizationType"
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    className="w-full bg-[#0f1419]/80 backdrop-blur-sm border-2 border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/20 transition-all duration-300 hover:bg-[#0f1419]"
                    required
                  >
                    <option value="" className="bg-[#0f1419] text-white">Select type</option>
                    <option value="education" className="bg-[#0f1419] text-white">Educational Institution</option>
                    <option value="corporate" className="bg-[#0f1419] text-white">Corporate Organization</option>
                    <option value="government" className="bg-[#0f1419] text-white">Government Agency</option>
                    <option value="nonprofit" className="bg-[#0f1419] text-white">Non-profit Organization</option>
                  </select>
                </div>

                <div className="group">
                  <label className="block text-sm font-medium mb-3 text-gray-300 flex items-center" htmlFor="organizationName">
                    <FileText className="w-4 h-4 mr-2" />
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="w-full bg-[#0f1419]/80 backdrop-blur-sm border-2 border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/20 transition-all duration-300 hover:bg-[#0f1419]"
                    placeholder="Enter organization name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Common fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-medium mb-3 text-gray-300 flex items-center" htmlFor="email">
                  <Mail className="w-4 h-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#0f1419]/80 backdrop-blur-sm border-2 border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/20 transition-all duration-300 hover:bg-[#0f1419]"
                  placeholder="your.email@domain.com"
                  required
                />
              </div>

              <div className="group">
                <label className="block text-sm font-medium mb-3 text-gray-300 flex items-center" htmlFor="phone">
                  <Phone className="w-4 h-4 mr-2" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#0f1419]/80 backdrop-blur-sm border-2 border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/20 transition-all duration-300 hover:bg-[#0f1419]"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-sm font-medium mb-3 text-gray-300 flex items-center" htmlFor="description">
                <FileText className="w-4 h-4 mr-2" />
                Why do you want to implement SafeVoice?
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full bg-[#0f1419]/80 backdrop-blur-sm border-2 border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/20 transition-all duration-300 hover:bg-[#0f1419] resize-none"
                placeholder="Describe your motivation and how you plan to contribute to the SafeVoice community..."
                required
              />
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="group relative bg-[#4f46e5] hover:bg-[#4338ca] text-white px-8 py-4 rounded-2xl transition-all duration-500 flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-[#4f46e5]/25 transform hover:scale-105 hover:-translate-y-1"
                disabled={loading}
              >
                <div className="absolute inset-0 bg-[#4f46e5] rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin h-6 w-6 mr-3" />
                      <span className="font-semibold text-lg">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-lg mr-3">Submit Application</span>
                      <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all duration-300">
                        <Shield className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes scale-in {
          from { transform: translate(-50%, -50%) scale(0); }
          to { transform: translate(-50%, -50%) scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.4s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BecomeAdmin;