// src/pages/SubmitReport.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FileUp, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const SubmitReport = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: 'abuse', // Default category
    description: '',
    file_upload: null,
    priority_flag: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isPremiumUser, setIsPremiumUser] = useState(false);

  const categories = [
    { value: 'abuse', label: 'Abuse' },
    { value: 'corruption', label: 'Corruption' },
    { value: 'harassment', label: 'Harassment' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      try {
        const decodedToken = jwtDecode(accessToken);
        // Assuming your JWT token has a 'plan' field
        if (decodedToken.plan === 'premium') {
          setIsPremiumUser(true);
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        // Handle token decoding error, e.g., clear token, redirect to login
        setIsPremiumUser(false);
      }
    } else {
      // If no token, user is not premium
      setIsPremiumUser(false);
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
    // Only send priority_flag if it's true AND the user is premium
    if (formData.priority_flag && isPremiumUser) {
      formDataToSend.append('priority_flag', true);
    } else {
        // Ensure it's explicitly false if not premium or not checked
        formDataToSend.append('priority_flag', false);
    }

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

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4 bg-gray-950">
      <div className="bg-[#0a0c1b] p-8 rounded-lg shadow-lg w-full max-w-2xl border border-blue-900/20">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Submit a New Report</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Illegal dumping in XYZ park"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Provide a detailed description of the incident..."
            ></textarea>
          </div>

          <div>
            <label htmlFor="file_upload" className="block text-sm font-medium text-gray-300 mb-2">
              Upload File (Image or Video)
            </label>
            <div className="flex items-center space-x-4">
              <label
                htmlFor="file_upload"
                className="cursor-pointer bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center space-x-2"
              >
                <FileUp className="h-5 w-5" />
                <span>Choose File</span>
              </label>
              <input
                type="file"
                id="file_upload"
                name="file_upload"
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
              />
              {formData.file_upload && (
                <p className="text-gray-400 text-sm">{formData.file_upload.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="priority_flag"
              name="priority_flag"
              checked={formData.priority_flag}
              onChange={handleChange}
              disabled={!isPremiumUser}
              className="h-4 w-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="priority_flag" className={`ml-2 text-sm font-medium ${isPremiumUser ? 'text-white' : 'text-gray-500 cursor-not-allowed'}`}>
              Mark as Priority (Premium feature)
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" /> Submitting...
                </>
              ) : (
                <>
                  Submit Report
                  <Send className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>

          {message.type && (
            <div
              className={`mt-4 p-3 rounded-md flex items-center space-x-2 ${
                message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <p className="text-sm font-medium">{message.text}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SubmitReport;