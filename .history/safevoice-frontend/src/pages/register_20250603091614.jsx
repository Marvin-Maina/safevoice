// src/pages/register.jsx

import { useState } from 'react';
import axios from 'axios';
export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '', // Add this
    last_name: '',  // Add this
  });
  const [message, setMessage] = useState('');
  const [focusedField, setFocusedField] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('');

  try {
    const response = await axios.post("http://localhost:8000/api/accounts/register/", {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      first_name: formData.first_name, // Send this
      last_name: formData.last_name,   // Send this
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 201 || response.status === 200) {
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      setMessage('Unexpected server response. Please try again.');
    }
  } catch (error) {
    console.error(error.response || error.message);
    // This part is crucial for displaying specific backend errors
    let errMsg = '❌ Registration failed. Please try again.';
    if (error.response && error.response.data) {
        // DRF sends validation errors in the response.data object
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
            errMsg = Object.keys(errorData).map(key => {
                // Capitalize the field name for display
                const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
                return `${fieldName}: ${errorData[key].join(', ')}`;
            }).join('\n'); // Join multiple errors with newline
        } else if (errorData.detail) {
            errMsg = errorData.detail;
        } else if (errorData.error) { // If your backend sends a generic 'error' field
            errMsg = errorData.error;
        }
    }
    setMessage('❌ ' + errMsg); // Prefix with ❌ to mark as error
  }
};

  const messageIsError = message.startsWith('❌');
  const messageColor = messageIsError ? 'text-red-400' : 'text-green-400';

  // ... (rest of your component, including the JSX for first_name and last_name inputs if you want them visible) ...

  return (
    <>
      <style>{backgroundAnimationStyle}</style>
      <div className="relative flex items-center justify-center min-h-screen bg-slate-950 p-4 font-sans overflow-hidden enhanced-grid">
        {/* ... animated background ... */}

        <div className="form-container relative z-10 w-full max-w-md p-8 space-y-6 bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 hover:border-slate-600/70 transition-all duration-300">
          <div className="form-title text-center">
            <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
              Create Your Account
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-6">
            {/* Username Field */}
            <div className="form-field">
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-300">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField('')}
                className={`w-full px-4 py-3 rounded-xl border bg-slate-800/80 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${focusedField === 'username' ? 'border-blue-500 shadow-lg shadow-blue-500/25' : 'border-slate-700'}`}
              />
            </div>

            {/* Email Field */}
            <div className="form-field">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                className={`w-full px-4 py-3 rounded-xl border bg-slate-800/80 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${focusedField === 'email' ? 'border-blue-500 shadow-lg shadow-blue-500/25' : 'border-slate-700'}`}
              />
            </div>

            {/* Password Field */}
            <div className="form-field">
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-300">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                className={`w-full px-4 py-3 rounded-xl border bg-slate-800/80 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${focusedField === 'password' ? 'border-blue-500 shadow-lg shadow-blue-500/25' : 'border-slate-700'}`}
              />
            </div>

            {/* Optional First Name Field */}
            <div className="form-field">
              <label htmlFor="first_name" className="block mb-2 text-sm font-medium text-gray-300">First Name (Optional)</label>
              <input
                id="first_name"
                type="text"
                name="first_name"
                placeholder="Your first name"
                value={formData.first_name}
                onChange={handleChange}
                onFocus={() => setFocusedField('first_name')}
                onBlur={() => setFocusedField('')}
                className={`w-full px-4 py-3 rounded-xl border bg-slate-800/80 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${focusedField === 'first_name' ? 'border-blue-500 shadow-lg shadow-blue-500/25' : 'border-slate-700'}`}
              />
            </div>

            {/* Optional Last Name Field */}
            <div className="form-field">
              <label htmlFor="last_name" className="block mb-2 text-sm font-medium text-gray-300">Last Name (Optional)</label>
              <input
                id="last_name"
                type="text"
                name="last_name"
                placeholder="Your last name"
                value={formData.last_name}
                onChange={handleChange}
                onFocus={() => setFocusedField('last_name')}
                onBlur={() => setFocusedField('')}
                className={`w-full px-4 py-3 rounded-xl border bg-slate-800/80 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 ${focusedField === 'last_name' ? 'border-blue-500 shadow-lg shadow-blue-500/25' : 'border-slate-700'}`}
              />
            </div>

            {/* Animated Submit Button */}
            <button
              type="submit" {/* Changed to type="submit" */}
              onClick={handleSubmit}
              className="form-button w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25 active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <span></span> Create Account
              </span>
            </button>
          </div>

          {/* Animated Message Display */}
          {message && (
            <div className="message-slide">
              <p className={`text-center text-sm font-medium px-4 py-2 rounded-lg backdrop-blur-sm ${messageColor} ${messageIsError ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
                {message}
              </p>
            </div>
          )}

          {/* Animated Link to Login */}
          <div className="form-link">
            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <a
                href="/login"
                className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-all duration-200 hover:shadow-sm"
              >
                Log In →
              </a>
            </p>
          </div>

          {/* Decorative bottom accent */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 blur-sm"></div>
          </div>
        </div>
      </div>
    </>
  );
}