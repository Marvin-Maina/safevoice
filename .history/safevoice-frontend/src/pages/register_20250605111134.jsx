import { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '', // Added first_name
    last_name: '',  // Added last_name
  });
  const [message, setMessage] = useState('');
  const [messageIsError, setMessageIsError] = useState(false); // State to track if the message is an error
  const [focusedField, setFocusedField] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    setMessageIsError(false); // Reset error state

    try {
      const response = await axios.post("http://localhost:8000/api/accounts/register/", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.first_name, // Include first_name
        last_name: formData.last_name,   // Include last_name
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
        setMessageIsError(true);
        setMessage('Unexpected server response. Please try again.');
      }
    } catch (error) {
      console.error(error.response || error.message);
      setMessageIsError(true);
      const errMsg = error?.response?.data?.detail || error?.response?.data?.error || error?.response?.data?.username || error?.response?.data?.email || error?.response?.data?.password || '❌ Registration failed. Please check your details and try again.';
      // Handle array of errors for specific fields
      if (Array.isArray(errMsg)) {
        setMessage(`❌ Registration failed: ${errMsg.join(' ')}`);
      } else if (typeof errMsg === 'object') {
        const errorMessages = Object.keys(errMsg)
          .map(key => `${key}: ${Array.isArray(errMsg[key]) ? errMsg[key].join(', ') : errMsg[key]}`)
          .join('; ');
        setMessage(`❌ Registration failed: ${errorMessages}`);
      } else {
        setMessage(`❌ ${errMsg}`);
      }
    }
  };

  // Determine message color based on success or error
  const messageColor = messageIsError ? 'text-red-300' : 'text-green-300';


  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-950 to-gray-800 p-4 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="z-10 w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-lg">
        <h2 className="mb-8 text-center text-4xl font-extrabold text-white drop-shadow-lg">
          Join SafeVoice
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* First Name Input */}
          <div className="relative group">
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              onFocus={() => setFocusedField('first_name')}
              onBlur={() => setFocusedField('')}
              className={`w-full rounded-lg border px-4 py-3 text-white placeholder-transparent outline-none transition-all duration-300
                ${focusedField === 'first_name' ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-600 bg-gray-800/50'}`}
              placeholder="First Name"
              autoComplete="given-name"
            />
            <label
              htmlFor="first_name"
              className={`absolute left-4 -top-3.5 text-sm transition-all duration-300
                ${focusedField === 'first_name' || formData.first_name ? 'text-blue-400 text-opacity-100' : 'text-gray-400'}
                ${focusedField === 'first_name' || formData.first_name ? 'scale-90 bg-gray-900/50 px-1 pt-0.5' : 'scale-100'}
                pointer-events-none`}
            >
              First Name (Optional)
            </label>
          </div>

          {/* Last Name Input */}
          <div className="relative group">
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              onFocus={() => setFocusedField('last_name')}
              onBlur={() => setFocusedField('')}
              className={`w-full rounded-lg border px-4 py-3 text-white placeholder-transparent outline-none transition-all duration-300
                ${focusedField === 'last_name' ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-600 bg-gray-800/50'}`}
              placeholder="Last Name"
              autoComplete="family-name"
            />
            <label
              htmlFor="last_name"
              className={`absolute left-4 -top-3.5 text-sm transition-all duration-300
                ${focusedField === 'last_name' || formData.last_name ? 'text-blue-400 text-opacity-100' : 'text-gray-400'}
                ${focusedField === 'last_name' || formData.last_name ? 'scale-90 bg-gray-900/50 px-1 pt-0.5' : 'scale-100'}
                pointer-events-none`}
            >
              Last Name (Optional)
            </label>
          </div>

          {/* Username Input */}
          <div className="relative group">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField('')}
              className={`w-full rounded-lg border px-4 py-3 text-white placeholder-transparent outline-none transition-all duration-300
                ${focusedField === 'username' ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-600 bg-gray-800/50'}`}
              placeholder="Username"
              required
              autoComplete="username"
            />
            <label
              htmlFor="username"
              className={`absolute left-4 -top-3.5 text-sm transition-all duration-300
                ${focusedField === 'username' || formData.username ? 'text-blue-400 text-opacity-100' : 'text-gray-400'}
                ${focusedField === 'username' || formData.username ? 'scale-90 bg-gray-900/50 px-1 pt-0.5' : 'scale-100'}
                pointer-events-none`}
            >
              Username
            </label>
          </div>

          {/* Email Input */}
          <div className="relative group">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              className={`w-full rounded-lg border px-4 py-3 text-white placeholder-transparent outline-none transition-all duration-300
                ${focusedField === 'email' ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-600 bg-gray-800/50'}`}
              placeholder="Email"
              required
              autoComplete="email"
            />
            <label
              htmlFor="email"
              className={`absolute left-4 -top-3.5 text-sm transition-all duration-300
                ${focusedField === 'email' || formData.email ? 'text-blue-400 text-opacity-100' : 'text-gray-400'}
                ${focusedField === 'email' || formData.email ? 'scale-90 bg-gray-900/50 px-1 pt-0.5' : 'scale-100'}
                pointer-events-none`}
            >
              Email
            </label>
          </div>

          {/* Password Input */}
          <div className="relative group">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              className={`w-full rounded-lg border px-4 py-3 text-white placeholder-transparent outline-none transition-all duration-300
                ${focusedField === 'password' ? 'border-blue-500 ring-2 ring-blue-500/50' : 'border-gray-600 bg-gray-800/50'}`}
              placeholder="Password"
              required
              autoComplete="new-password"
            />
            <label
              htmlFor="password"
              className={`absolute left-4 -top-3.5 text-sm transition-all duration-300
                ${focusedField === 'password' || formData.password ? 'text-blue-400 text-opacity-100' : 'text-gray-400'}
                ${focusedField === 'password' || formData.password ? 'scale-90 bg-gray-900/50 px-1 pt-0.5' : 'scale-100'}
                pointer-events-none`}
            >
              Password
            </label>
          </div>

          {/* Submit Button */}
          <div className="form-submit">
            <button
              type="submit"
              className="w-full transform rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/25 active:scale-[0.98]"
            >
              <span className="flex items-center justify-center gap-2">
                <span></span> Create Account
              </span>
            </button>
          </div>
        </form>

        {/* Animated Message Display */}
        {message && (
          <div className="message-slide mt-6">
            <p className={`text-center text-sm font-medium px-4 py-2 rounded-lg backdrop-blur-sm ${messageColor} ${messageIsError ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
              {message}
            </p>
          </div>
        )}

        {/* Animated Link to Login */}
        <div className="form-link mt-6">
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
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-48 h-24 bg-blue-500 rounded-full blur-xl opacity-30 pointer-events-none"></div>
      </div>
    </div>
  );
}