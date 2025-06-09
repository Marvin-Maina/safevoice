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
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'file' ? files[0] : type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' }); // Clear previous messages

    const accessToken = localStorage.getItem('accessToken');
    const config = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'multipart/form-data', // Correct for file uploads
      },
    };

    const data = new FormData();
    for (const key in formData) {
      // Append file_upload only if it exists
      if (key === 'file_upload' && formData[key]) {
        data.append(key, formData[key]);
      } else if (key !== 'file_upload') {
        data.append(key, formData[key]);
      }
    }

    try {
      const response = await axios.post('/api/reports/', data, config);
      // Assuming the backend returns the created report object including its ID
      const newReportId = response.data.id; // Get the new report's ID

      setMessage({ type: 'success', text: 'Report submitted successfully!' });
      setFormData({
        title: '',
        category: 'abuse',
        description: '',
        file_upload: null,
        priority_flag: false,
      });

      // IMPORTANT: Navigate to the detail page of the newly submitted report
      navigate(`/reports/${newReportId}`); // <--- ADD THIS LINE!

    } catch (error) {
      console.error('Report submission failed:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.message || 'An unexpected error occurred.';
      setMessage({ type: 'error', text: errorMsg });
      if (error.response && error.response.status === 400 && error.response.data) {
        const errors = error.response.data;
        if (typeof errors === 'object') {
          let detailedErrors = '';
          for (const key in errors) {
            detailedErrors += `${key}: ${errors[key].join(', ')}\n`;
          }
          setMessage({ type: 'error', text: `Validation failed:\n${detailedErrors}` });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center p-4">
      <div className="bg-[#111327] rounded-lg shadow-xl p-8 w-full max-w-lg border border-blue-900/20">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Submit New Report</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief title of the report"
              className="w-full bg-[#0a0c1b] border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-[#0a0c1b] border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Provide detailed information about the incident..."
              className="w-full bg-[#0a0c1b] border border-gray-600 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="file_upload" className="block text-sm font-medium text-gray-300 mb-1">
              Attach Evidence (Image/Video/PDF - Optional)
            </label>
            <input
              type="file"
              id="file_upload"
              name="file_upload"
              onChange={handleChange}
              className="w-full text-white text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
            />
            {formData.file_upload && (
              <p className="mt-2 text-sm text-gray-400">Selected file: {formData.file_upload.name}</p>
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
              <p className="text-sm">{message.text}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SubmitReport;