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
    priority_flag: false, // Default to false, allow user to check if they want
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isAuthenticatedUser, setisAuthenticatedUser] = useState(false); // Keep this for other potential premium features if any

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
        } else {
          setisAuthenticatedUser(false);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        setisAuthenticatedUser(false);
      }
    } else {
      setisAuthenticatedUser(false);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      file_upload: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const data = new FormData();
    for (const key in formData) {
      if (formData[key] !== null) {
        data.append(key, formData[key]);
      }
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      await axios.post('http://localhost:8000/api/reports/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setMessage({ type: 'success', text: 'Report submitted successfully!' });
      setFormData({
        title: '',
        category: 'abuse',
        description: '',
        file_upload: null,
        priority_flag: false,
      });
      // Optionally navigate after a short delay
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error("Report submission error:", err);
      setMessage({ type: 'error', text: `Failed to submit report: ${err.response?.data?.detail || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse animation-duration-7000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl animate-pulse animation-delay-2000 animation-duration-8000"></div>
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" aria-hidden="true"></div>

      <div className="relative z-10 w-full max-w-2xl bg-gray-800/70 rounded-3xl shadow-2xl p-8 sm:p-10 border border-blue-600/30 backdrop-blur-xl animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-3 bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">
            Submit a New Report
          </h1>
          <p className="text-lg text-gray-300 font-light">
            Your voice matters. Fill out the form below to report an issue.
          </p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 animate-slide-up ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {message.type === 'success' ? <CheckCircle className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            <span className="text-lg">{message.text}</span>
          </div>
        )}

        <div className="space-y-6">
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title" className="block text-gray-300 text-lg font-medium mb-2">
                Report Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="A concise summary of the issue"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-gray-300 text-lg font-medium mb-2">
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none pr-10 transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-gray-300 text-lg font-medium mb-2">
                Detailed Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="Provide all relevant details about the issue..."
              ></textarea>
            </div>

            {/* Priority Flag - now freely available, styling unchanged */}
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="priority_flag"
                name="priority_flag"
                checked={formData.priority_flag}
                onChange={handleChange}
                className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 bg-gray-700 border-gray-600"
              />
              <label htmlFor="priority_flag" className="ml-2 text-white text-lg">
                Mark as Priority
              </label>
            </div>

            <div>
              <label htmlFor="file_upload" className="block text-gray-300 text-lg font-medium mb-2">
                Upload Supporting File (Optional)
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file_upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-900/50 hover:bg-gray-700/50 transition-colors duration-300"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-400">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.file_upload ? formData.file_upload.name : 'SVG, PNG, JPG, or PDF (MAX. 5MB)'}
                    </p>
                  </div>
                  <input
                    id="file_upload"
                    type="file"
                    name="file_upload"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".jpg,.jpeg,.png,.pdf,.svg"
                  />
                </label>
              </div>
              {formData.file_upload && (
                <p className="mt-2 text-sm text-gray-400">Selected file: {formData.file_upload.name}</p>
              )}
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-lg font-bold rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed group"
                disabled={loading}
              >
                <div className="flex items-center">
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin mr-3 h-6 w-6" />
                      Submitting...
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
          animation: bounce-in 0.7s ease-out;
        }
      `}</style>
    </div>
  );
};

export default SubmitReport;