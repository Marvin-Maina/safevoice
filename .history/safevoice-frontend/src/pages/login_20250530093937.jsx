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

      setMessage('Logged in successfully!');
      setFormData({ username: '', password: '' });

      // Redirect based on user role
      setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/free-admin-dashboard'); // Redirect to admin dashboard
        } else {
          navigate('/'); // Redirect to homepage or regular user dashboard
        }
      }, 1500); // Give a short delay for message to show
    } catch (error) {
      console.error("Login error:", error);
      setMessage('Login failed. Please check your credentials or try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ... rest of your Login component JSX remains the same
    // Ensure you have the input fields, button, and message display as before
    <section className="relative flex min-h-screen items-center justify-center bg-gray-950 p-4">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/path/to/your/background-image.jpg')" }}></div>
      <div className="absolute inset-0 bg-black opacity-60"></div>

      <div className="relative z-10 w-full max-w-md rounded-xl bg-[#111327] p-8 shadow-2xl backdrop-blur-sm backdrop-filter sm:p-10">
        <div className="flex items-center justify-center space-x-3 text-blue-400 mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-shield-half"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="M12 22v-20" />
          </svg>
          <h2 className="text-3xl font-bold text-white">Login</h2>
        </div>

        {message && (
          <div className={`p-3 rounded-md mb-4 ${message.includes('successfully') ? 'bg-green-600' : 'bg-red-600'} text-white`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField('')}
              className={`peer w-full rounded-md border-2 ${
                focusedField === 'username' ? 'border-blue-500' : 'border-gray-600'
              } bg-[#0a0c1b] px-4 py-2 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Username"
              required
            />
            <label
              htmlFor="username"
              className={`absolute left-3 -top-2.5 bg-[#111327] px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-500 ${
                focusedField === 'username' || formData.username ? 'text-blue-500 text-sm -top-2.5' : ''
              }`}
            >
              Username
            </label>
          </div>

          <div className="relative">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              className={`peer w-full rounded-md border-2 ${
                focusedField === 'password' ? 'border-blue-500' : 'border-gray-600'
              } bg-[#0a0c1b] px-4 py-2 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Password"
              required
            />
            <label
              htmlFor="password"
              className={`absolute left-3 -top-2.5 bg-[#111327] px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-500 ${
                focusedField === 'password' || formData.password ? 'text-blue-500 text-sm -top-2.5' : ''
              }`}
            >
              Password
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-colors duration-300 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {isLoading ? 'Logging In...' : 'Login'}
          </button>
        </form>

         {/* Animated Links */}
          <div className="form-link space-y-3">
            <div className="text-center">
              <a
                href="#"
                className="text-xs text-gray-400 hover:text-blue-400 transition-colors duration-200"
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
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl"></div>
          </div>
      </div>
    </section>
  );
}