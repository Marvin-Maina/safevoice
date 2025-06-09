import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FileUp, Send, Loader2, CheckCircle, XCircle, AlertTriangle, Shield, Star, Upload } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const SubmitReport = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'abuse', // Default category
    description: '',
    file_upload: null,
    priority_flag: false, // Default to false, making it opt-in
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isAuthenticatedUser, setisAuthenticatedUser] = useState(false);

  const categories = [
    { value: 'abuse', label: 'Abuse', icon: AlertTriangle },
    { value: 'corruption', label: 'Corruption', icon: Shield },
    { value: 'harassment', label: 'Harassment', icon: XCircle },
    { value: 'other', label: 'Other', icon: FileUp },
  ];

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        // Assuming your JWT token has a 'plan' field
        if (decodedToken.plan === 'premium') {
          setisAuthenticatedUser(true);
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        // Handle token decoding error, e.g., clear token, redirect to login
        setisAuthenticatedUser(false);
      }
    } else {
      // If no token, user is not premium
      setisAuthenticatedUser(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : (type === 'file' ? files[0] : value),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        file_upload: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setMessage({ type: 'error', text: 'You must be logged in to submit a report.' });
      setLoading(false);
      navigate('/login'); // Redirect to login if no token
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('description', formData.description);
    if (formData.file_upload) {
      formDataToSend.append('file_upload', formData.file_upload);
    }
    // Send priority_flag based on its current state for all users
    formDataToSend.append('priority_flag', formData.priority_flag);

    try {
      // CORRECTED LINE: Ensure the URL is '/api/reports/'
      const response = await axios.post('/api/reports/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setMessage({ type: 'success', text: 'Report submitted successfully!' });
      // Navigate to the newly created report's detail page
      if (response.data && response.data.id) {
          navigate(`/reports/${response.data.id}`);
      } else {
          // Fallback, e.g., if ID is not returned (though it should be)
          navigate('/dashboard'); // Or show a list of user's reports
      }

    } catch (err) {
      console.error('Submission error:', err.response?.data || err.message);
      if (err.response && err.response.data) {
        if (err.response.data.detail) {
          setMessage({ type: 'error', text: `Error: ${err.response.data.detail}` });
        } else if (err.response.data.non_field_errors) {
          setMessage({ type: 'error', text: `Error: ${err.response.data.non_field_errors.join(', ')}` });
        } else {
          setMessage({ type: 'error', text: 'Submission failed. Please try again.' });
        }
      } else {
        setMessage({ type: 'error', text: 'Network error or server unavailable.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.value === formData.category);
  const CategoryIcon = selectedCategory?.icon || AlertTriangle;

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
            Submit a Report
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto leading-relaxed animate-slide-up">
            Your voice matters. Report incidents safely and anonymously to help create a better environment for everyone.
          </p>
        </div>

        <div className="bg-[#1a1f2e]/80 backdrop-blur-xl border border-gray-700/50 p-10 rounded-3xl shadow-2xl hover:shadow-[#4f46e5]/10 transition-all duration-700 animate-slide-up">
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
                  <XCircle className="w-6 h-6 flex-shrink-0" />
                )}
              </div>
              <span className="font-medium">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Title Field */}
            <div className="group">
              <label htmlFor="title" className="block text-sm font-medium mb-3 text-gray-300 flex items-center">
                <FileUp className="w-4 h-4 mr-2" />
                Report Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-[#0f1419]/80 backdrop-blur-sm border-2 border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/20 transition-all duration-300 hover:bg-[#0f1419]"
                placeholder="e.g., Illegal dumping in XYZ park"
              />
            </div>

            {/* Category Field */}
            <div className="group">
              <label htmlFor="category" className="block text-sm font-medium mb-3 text-gray-300 flex items-center">
                <CategoryIcon className="w-4 h-4 mr-2" />
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-[#0f1419]/80 backdrop-blur-sm border-2 border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/20 transition-all duration-300 hover:bg-[#0f1419] appearance-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-[#0f1419] text-white">
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <CategoryIcon className="w-5 h-5 text-[#4f46e5]" />
                </div>
              </div>
            </div>

            {/* Description Field */}
            <div className="group">
              <label htmlFor="description" className="block text-sm font-medium mb-3 text-gray-300 flex items-center">
                <FileUp className="w-4 h-4 mr-2" />
                Detailed Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="6"
                required
                className="w-full bg-[#0f1419]/80 backdrop-blur-sm border-2 border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-[#4f46e5] focus:ring-4 focus:ring-[#4f46e5]/20 transition-all duration-300 hover:bg-[#0f1419] resize-none"
                placeholder="Provide a detailed description of the incident. Include when, where, and what happened. The more details you provide, the better we can help."
              />
            </div>

            {/* File Upload Field */}
            <div className="group">
              <label className="block text-sm font-medium mb-3 text-gray-300 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Supporting Evidence (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  id="file_upload"
                  name="file_upload"
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="sr-only"
                />
                <label
                  htmlFor="file_upload"
                  className="group cursor-pointer bg-[#0f1419]/80 backdrop-blur-sm border-2 border-dashed border-gray-600/50 rounded-xl px-6 py-8 text-center hover:border-[#4f46e5]/60 hover:bg-[#0f1419] transition-all duration-300 flex flex-col items-center space-y-3"
                >
                  <div className="p-3 bg-[#4f46e5]/20 rounded-full group-hover:bg-[#4f46e5]/30 transition-all duration-300">
                    <FileUp className="w-8 h-8 text-[#4f46e5]" />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {formData.file_upload ? formData.file_upload.name : 'Click to upload file'}
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Images or videos (Max 10MB)
                    </p>
                  </div>
                </label>
              </div>
            </div>

            Priority Flag
            <div className="p-6 bg-[#0f1419]/50 rounded-2xl border border-gray-700/30">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <input
                    type="checkbox"
                    id="priority_flag"
                    name="priority_flag"
                    checked={formData.priority_flag}
                    onChange={handleChange}
                    // No longer disabled based on premium status
                    className="sr-only"
                  />
                  <div 
                    className={`w-6 h-6 rounded border-2 transition-all duration-300 cursor-pointer ${
                      formData.priority_flag // Style based on checked state only
                        ? 'border-[#4f46e5] bg-[#4f46e5] shadow-lg shadow-[#4f46e5]/50'
                        : 'border-gray-400 hover:border-[#4f46e5]/60' // Default style for unchecked
                    }`}
                    // Allow toggle for all users
                    onClick={() => handleChange({ target: { name: 'priority_flag', type: 'checkbox', checked: !formData.priority_flag } })}
                  >
                    {formData.priority_flag && ( // Show checkmark if checked
                      <CheckCircle className="w-4 h-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-5 h-5 text-yellow-400" /> {/* Always yellow */}
                    <label 
                      htmlFor="priority_flag" 
                      className="text-sm font-medium text-white cursor-pointer" /* Always white */
                    >
                      Mark as Priority Report
                    </label>
                    {/* Premium badge removed from here as feature is for all */}
                  </div>
                  <p className="text-xs text-gray-400"> {/* Consistent text for all users */}
                    Priority reports may receive expedited review and response times.
                  </p>
                </div>
              </div>
            </div>
            {/* Submit Button */}
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
                      <span className="font-semibold text-lg mr-3">Submit Report</span>
                      <div className="p-1 bg-white/20 rounded-lg group-hover:bg-white/30 transition-all duration-300">
                        <Send className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
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
        
        @keyframes bounce-in {
          0% { opacity: 0; transform: scale(0.3); }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SubmitReport;