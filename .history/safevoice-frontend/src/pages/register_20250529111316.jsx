import { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Using window.location for simplicity here, but useNavigate is fine
import api from '../axios'; // Assuming this is your configured axios instance

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '', // Added email to state
    password: '',
  });
  const [message, setMessage] = useState('');
  // const navigate = useNavigate(); // If using React Router for navigation

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    try {
      // Actual API call - will now send username, email, and password
      await api.post('/accounts/register/', formData);
      setMessage('✅ Registration successful! Redirecting to login...');
      setTimeout(() => {
        // navigate('/login'); // Use this if you have React Router and prefer SPA navigation
        window.location.href = '/login'; // Simple redirect
      }, 2000); // Redirect after 2 seconds
    } catch (error) {
      // Enhanced error message handling
      let errorMessage = '❌ Registration failed. Please try again.';
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.detail) {
          errorMessage = `❌ ${errorData.detail}`;
        } else if (errorData.username) {
          errorMessage = `❌ Username: ${Array.isArray(errorData.username) ? errorData.username[0] : errorData.username}`;
        } else if (errorData.email) { // Check for email specific errors
          errorMessage = `❌ Email: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`;
        } else if (errorData.password) {
          errorMessage = `❌ Password: ${Array.isArray(errorData.password) ? errorData.password[0] : errorData.password}`;
        } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
          // Generic handler for other object-based errors
          const firstErrorKey = Object.keys(errorData)[0];
          const firstErrorMessage = errorData[firstErrorKey];
          if (Array.isArray(firstErrorMessage)) {
            errorMessage = `❌ ${firstErrorKey}: ${firstErrorMessage[0]}`;
          } else {
            errorMessage = `❌ ${firstErrorKey}: ${firstErrorMessage}`;
          }
        }
      }
      setMessage(errorMessage);
    }
  };

  // Determine message color based on content
  const messageIsError = message.startsWith('❌');
  const messageColor = messageIsError ? 'text-red-400' : 'text-green-400';

  return (
    // Full page container with dark background, centering content, and subtle grid graphic
    <div
      className="flex items-center justify-center min-h-screen bg-slate-950 p-4 font-sans
                 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]
                 bg-[background-size:2rem_2rem]" // Subtle grid pattern
    >
      {/* Form card */}
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-900 rounded-xl shadow-2xl border border-slate-700">
        <h2 className="text-3xl font-bold text-center text-white">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-medium text-gray-300"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              required
              autoComplete="username"
              className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-300"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email" // Email type for basic validation
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
            />
          </div>

          {/* Password Field */}
          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out transform hover:scale-[1.02]"
          >
            Register
          </button>
        </form>

        {/* Message Display */}
        {message && (
          <p className={`mt-6 text-center text-sm ${messageColor}`}>
            {message}
          </p>
        )}

        {/* Link to Login */}
        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <a
            href="/login" // Or use onClick with navigate if using React Router
            // onClick={(e) => { e.preventDefault(); navigate('/login'); }}
            className="font-medium text-blue-500 hover:text-blue-400 hover:underline"
          >
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
