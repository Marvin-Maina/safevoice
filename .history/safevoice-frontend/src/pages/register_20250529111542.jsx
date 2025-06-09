import { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Using window.location for simplicity here, but useNavigate is fine
import api from '../axios'; // Assuming this is your configured axios instance

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  // const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/accounts/register/', formData);
      setMessage('✅ Registration successful! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      let errorMessage = '❌ Registration failed. Please try again.';
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        if (errorData.detail) {
          errorMessage = `❌ ${errorData.detail}`;
        } else if (errorData.username) {
          errorMessage = `❌ Username: ${Array.isArray(errorData.username) ? errorData.username[0] : errorData.username}`;
        } else if (errorData.email) {
          errorMessage = `❌ Email: ${Array.isArray(errorData.email) ? errorData.email[0] : errorData.email}`;
        } else if (errorData.password) {
          errorMessage = `❌ Password: ${Array.isArray(errorData.password) ? errorData.password[0] : errorData.password}`;
        } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
          const firstErrorKey = Object.keys(errorData)[0];
          const firstErrorMessage = errorData[firstErrorKey];
          errorMessage = `❌ ${firstErrorKey}: ${Array.isArray(firstErrorMessage) ? firstErrorMessage[0] : firstErrorMessage}`;
        }
      }
      setMessage(errorMessage);
    }
  };

  const messageIsError = message.startsWith('❌');
  const messageColor = messageIsError ? 'text-red-400' : 'text-green-400';

  // CSS for the animated background orbs
  // This can be moved to a separate CSS file for larger applications
  const backgroundAnimationStyle = `
    @keyframes drift {
      0% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.1; }
      25% { transform: translateY(-20px) translateX(15px) scale(1.05); opacity: 0.3; }
      50% { transform: translateY(10px) translateX(-10px) scale(0.95); opacity: 0.2; }
      75% { transform: translateY(-15px) translateX(20px) scale(1); opacity: 0.4; }
      100% { transform: translateY(0px) translateX(0px) scale(1); opacity: 0.1; }
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      background-image: radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent 70%); /* Blueish glow */
      filter: blur(10px); /* Soft blur effect */
      animation: drift 15s infinite ease-in-out;
    }

    .orb1 { width: 200px; height: 200px; top: 10%; left: 15%; animation-duration: 18s; animation-delay: -2s; opacity: 0.1; }
    .orb2 { width: 300px; height: 300px; top: 50%; left: 60%; animation-duration: 22s; animation-delay: -5s; opacity: 0.15; background-image: radial-gradient(circle, rgba(129, 140, 248, 0.3), transparent 70%); /* Indigo glow */}
    .orb3 { width: 150px; height: 150px; top: 70%; left: 5%; animation-duration: 20s; animation-delay: -8s; opacity: 0.08; background-image: radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent 70%); /* Violet glow */}
    .orb4 { width: 250px; height: 250px; top: 20%; left: 80%; animation-duration: 16s; animation-delay: -3s; opacity: 0.12; }
  `;

  return (
    <>
      <style>{backgroundAnimationStyle}</style>
      {/* Full page container with dark background, centering content */}
      <div
        className="relative flex items-center justify-center min-h-screen bg-slate-950 p-4 font-sans overflow-hidden
                   bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]
                   bg-[background-size:2.5rem_2.5rem]" // Slightly more subtle grid pattern
      >
        {/* Animated Orbs Background Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="orb orb1"></div>
          <div className="orb orb2"></div>
          <div className="orb orb3"></div>
          <div className="orb orb4"></div>
        </div>

        {/* Form card - ensure it's above the background animation with z-10 */}
        <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-slate-900/80 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-700">
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
                type="email"
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
              href="/login"
              className="font-medium text-blue-500 hover:text-blue-400 hover:underline"
            >
              Log In
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
