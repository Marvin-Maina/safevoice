import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Import jwtDecode

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/accounts/login/', {
        username: formData.username,
        password: formData.password,
      });

      const { access, refresh } = response.data;

      // Store tokens
      localStorage.setItem('accessToken', access);
      localStorage.setItem('refreshToken', refresh);

      // Decode the access token to get user role
      const decodedToken = jwtDecode(access);
      const userRole = decodedToken.role; // Assuming 'role' is in your JWT claims

      setMessage('✅ Logged in successfully!');
      setFormData({ username: '', password: '' });

      // >>> ADDED REDIRECTION LOGIC HERE <<<
      if (userRole === 'admin') {
        navigate('/admin-dashboard'); // Navigate to your admin dashboard path
      } else if (userRole === 'premium_admin') { // Assuming you might have a premium admin dashboard
          navigate('/premium-admin-dashboard'); // Or combine with admin if they share the same dashboard
      }
      else {
        navigate('/user-dashboard'); // Navigate to the regular user dashboard path
      }
      // <<< END ADDED REDIRECTION LOGIC >>>

    } catch (error) {
      setIsLoading(false);
      console.error('Login error:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (error.response.status === 401) {
          setMessage('❌ Invalid username or password. Please try again.');
        } else if (error.response.status === 403) {
            setMessage('❌ Account not approved or forbidden. Please contact support.');
        }
        else {
          setMessage('❌ Login failed: ' + (error.response.data.detail || 'An unexpected error occurred.'));
        }
      } else if (error.request) {
        // The request was made but no response was received
        setMessage('❌ No response from server. Please check your network connection or server status.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setMessage('❌ Error setting up request: ' + error.message);
      }
    }
  };

  const handleFocus = (field) => setFocusedField(field);
  const handleBlur = () => setFocusedField('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-200">
      <div className="relative w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl overflow-hidden animate-fade-in">
        {/* Top accent */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-75"></div>
        </div>

        <h2 className="text-3xl font-bold text-center text-blue-400 mb-6 drop-shadow-md">
          Sign In
        </h2>
        {message && (
          <p
            className={`text-center mb-4 p-2 rounded-md ${
              message.startsWith('✅') ? 'bg-green-600/30 text-green-300' : 'bg-red-600/30 text-red-300'
            }`}
          >
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div className="relative">
            <input
              type="text"
              name="username"
              placeholder=" "
              value={formData.username}
              onChange={handleChange}
              onFocus={() => handleFocus('username')}
              onBlur={handleBlur}
              className={`block w-full px-4 py-3 bg-gray-700 border ${
                focusedField === 'username' ? 'border-blue-500' : 'border-gray-600'
              } rounded-md text-gray-200 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 peer`}
              required
            />
            <label
              htmlFor="username"
              className={`absolute left-3 transition-all duration-200 ${
                focusedField === 'username' || formData.username
                  ? '-top-2.5 text-xs text-blue-400 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base'
                  : 'top-3 text-base text-gray-400'
              } bg-gray-800 px-1`}
            >
              Username
            </label>
          </div>

          {/* Password Field */}
          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder=" "
              value={formData.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
              className={`block w-full px-4 py-3 bg-gray-700 border ${
                focusedField === 'password' ? 'border-blue-500' : 'border-gray-600'
              } rounded-md text-gray-200 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 peer`}
              required
            />
            <label
              htmlFor="password"
              className={`absolute left-3 transition-all duration-200 ${
                focusedField === 'password' || formData.password
                  ? '-top-2.5 text-xs text-blue-400 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:text-base'
                  : 'top-3 text-base text-gray-400'
              } bg-gray-800 px-1`}
            >
              Password
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-5 w-5" /> Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

          {/* Animated Links */}
          <div className="form-link space-y-3">
            <div className="text-center">
              <a
                href="#"
                className="text-xs text-gray-400 hover:text-blue-400 transition-colors duration-200 hover:underline"
              >
                Forgot your password?
              </a>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">
                Don't have an account?{' '}
                <a
                  href="/register"
                  className="font-medium text-blue-400 hover:text-blue-300 hover:underline transition-all duration-200"
                >
                  Create Account →
                </a>
              </p>
            </div>
          </div>

          {/* Security Info */}
          <div className="form-link">
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 bg-slate-800/50 rounded-lg p-2">
              <span></span>
              <span>256-bit SSL encryption</span>
            </div>
          </div>

          {/* Decorative bottom accent */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-75"></div>
          </div>
        </div>
      </div>
  );
}