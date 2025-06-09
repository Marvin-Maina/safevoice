import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Loader2, AlertCircle, Save } from 'lucide-react'; // Icons

const EditProfile = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          setError('No access token found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:8000/api/accounts/profile/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        // Pre-fill form with current profile data
        setFormData({
          username: response.data.username || '',
          email: response.data.email || '',
          // Note: 'role' and 'plan' are usually not editable by the user themselves
        });
      } catch (err) {
        console.error("Failed to fetch profile for editing:", err);
        setError('Could not load profile data for editing. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const accessToken = localStorage.getItem('accessToken');
      await axios.put('http://localhost:8000/api/accounts/profile/', formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        navigate('/profile'); // Redirect back to profile page after success
      }, 1500);
    } catch (err) {
      console.error("Failed to update profile:", err.response ? err.response.data : err);
      setError('Failed to update profile. Please check your input.');
      if (err.response && err.response.data) {
        // Display specific error messages from backend validation
        if (err.response.data.username) {
          setError(prev => prev + ` Username: ${err.response.data.username.join(', ')}`);
        }
        if (err.response.data.email) {
          setError(prev => prev + ` Email: ${err.response.data.email.join(', ')}`);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center pt-24">
        <div className="flex items-center space-x-2 text-blue-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c1b] p-8 pt-24 flex justify-center items-start">
      <div className="max-w-md w-full bg-[#111327] rounded-xl p-8 shadow-2xl backdrop-blur-sm backdrop-filter space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <User className="w-16 h-16 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
        </div>

        {error && (
          <div className="bg-red-900/30 text-red-400 p-3 rounded-md flex items-center space-x-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="bg-green-900/30 text-green-400 p-3 rounded-md flex items-center space-x-2">
            <Save className="h-5 w-5" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-[#0a0c1b] border border-gray-600 rounded-md px-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#0a0c1b] border border-gray-600 rounded-md px-10 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;