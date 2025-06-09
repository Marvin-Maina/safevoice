// src/pages/submitreport.jsx
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
        if (decodedToken.plan === 'premium') {
          setIsPremiumUser(true);
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'file' ? files[0] : value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const data = new FormData();
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('description', formData.description);
    if (formData.file_upload) {
      data.append('file_upload', formData.file_upload);
    }
    if (isPremiumUser && formData.priority_flag) {
      data.append('priority_flag', true);
    } else {
      data.append('priority_flag', false);
    }

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setMessage({ type: 'error', text: 'Authentication required. Please log in.' });
        setLoading(false);
        navigate('/login');
        return;
      }

      const response = await axios.post('/api/reports/reports/', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      // --- NEW: Redirect to the newly created report's detail page ---
      setMessage({ type: 'success', text: 'Report submitted successfully!' });
      // Clean form after success
      setFormData({
        title: '',
        category: 'abuse',
        description: '',
        file_upload: null,
        priority_flag: false,
      });

      // Redirect to the new report's view page using its ID
      // This assumes your backend returns the report ID upon creation
      navigate(`/my-reports/${response.data.id}`);

    } catch (error) {
      console.error('Report submission failed:', error.response ? error.response.data : error);
      let errorMessage = 'Failed to submit report. Please try again.';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.non_field_errors) {
            errorMessage = error.response.data.non_field_errors[0];
        } else if (error.response.data.detail === "Free tier limit reached: max 3 reports/month. Upgrade to premium for unlimited.") {
            errorMessage = "Free tier limit reached: max 3 reports/month. Upgrade to premium for unlimited.";
        }
        // General error handling for other fields if needed
        else {
          errorMessage = Object.values(error.response.data).flat().join(', ');
        }
      }
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c1b] text-white flex items-center justify-center p-4">
      <div className="bg-[#111327] rounded-lg shadow-lg p-8 max-w-2xl w-full border border-blue-900/20">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-400">Submit a Report</h1>

        {message.text && (
          <div className={`p-3 rounded-md mb-4 text-center ${message.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {message.type === 'success' ? <CheckCircle className="inline-block mr-2" size={20} /> : <XCircle className="inline-block mr-2" size={20} />}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Report Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-[#0a0c1b] border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-[#0a0c1b] border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              className="w-full bg-[#0a0c1b] border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="file_upload" className="block text-sm font-medium mb-2">
              Attach File (Image, Video, or PDF) - Max 5MB for images, 20MB for videos, 10MB for PDFs
            </label>
            <input
              type="file"
              id="file_upload"
              name="file_upload"
              onChange={handleChange}
              className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {formData.file_upload && (
              <p className="mt-2 text-gray-400 text-sm">Selected file: {formData.file_upload.name}</p>
            )}
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
        </form>
      </div>
    </div>
  );
};

export default SubmitReport;