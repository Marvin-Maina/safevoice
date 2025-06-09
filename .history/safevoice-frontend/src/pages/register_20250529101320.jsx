import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios'; // Assuming this is your configured axios instance

export default function Register() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/accounts/register/', formData);
      setMessage('✅ Registration successful! Redirecting...');
      setTimeout(() => navigate('/login'), 2000); // Increased delay slightly
    } catch (error) {
      setMessage(
        error.response?.data?.detail ||
        (error.response?.data?.username && `Username: ${error.response.data.username[0]}`) ||
        (error.response?.data?.password && `Password: ${error.response.data.password[0]}`) ||
        '❌ Registration failed. Please check your input.'
      );
    }
  };

  // Determine message color based on success or failure
  const messageColor = message.startsWith('✅') ? 'text-green-400' : 'text-red-400';

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 p-4"> {/* Full screen dark background */}
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-900 rounded-xl shadow-2xl border border-slate-700"> {/* Form container with a slightly lighter dark bg and border */}
        <h2 className="text-3xl font-bold text-center text-white">
          Create Your SafeVoice Account
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="text-sm font-medium text-gray-300 block mb-2">
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
              className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-300 block mb-2">
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
              className="w-full px-4 py-3 rounded-lg border border-slate-700 bg-slate-800 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-transform transform hover:scale-105 duration-300 ease-in-out"
          >
            Register
          </button>
        </form>
        {message && (
          <p className={`mt-6 text-center text-sm ${messageColor}`}>
            {message}
          </p>
        )}
        <p className="text-center text-sm text-gray-400">
          Already have an account?{' '}
          <a
            href="/login" // Or use navigate('/login') if you prefer a SPA navigation
            onClick={(e) => { e.preventDefault(); navigate('/login'); }}
            className="font-medium text-blue-500 hover:text-blue-400 hover:underline"
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}