import { useState } from 'react';
import axios
export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [focusedField, setFocusedField] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage('');

  try {
    const response = await axios.post('http://localhost:8000/api/register/', {
      username: formData.username,
      email: formData.email,
      password: formData.password,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 201 || response.status === 200) {
      setMessage('✅ Registration successful! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } else {
      setMessage('❌ Unexpected server response. Please try again.');
    }
  } catch (error) {
    console.error(error.response || error.message);
    const errMsg = error?.response?.data?.detail || error?.response?.data?.error || '❌ Registration failed. Please try again.';
    setMessage(errMsg);
  }
};


  const messageIsError = message.startsWith('❌');
  const messageColor = messageIsError ? 'text-red-400' : 'text-green-400';

  // Enhanced CSS animations
  const backgroundAnimationStyle = `
    @keyframes drift {
      0% { transform: translateY(0px) translateX(0px) scale(1) rotate(0deg); opacity: 0.1; }
      25% { transform: translateY(-30px) translateX(25px) scale(1.1) rotate(90deg); opacity: 0.4; }
      50% { transform: translateY(15px) translateX(-20px) scale(0.9) rotate(180deg); opacity: 0.2; }
      75% { transform: translateY(-25px) translateX(30px) scale(1.05) rotate(270deg); opacity: 0.5; }
      100% { transform: translateY(0px) translateX(0px) scale(1) rotate(360deg); opacity: 0.1; }
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.1; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(1.05); }
    }

    @keyframes slideInUp {
      0% { opacity: 0; transform: translateY(50px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    @keyframes slideInDown {
      0% { opacity: 0; transform: translateY(-30px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes glow {
      0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.2); }
      50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.5), 0 0 60px rgba(59, 130, 246, 0.3); }
    }

    @keyframes floatUpDown {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      background-image: radial-gradient(circle, rgba(59, 130, 246, 0.4), rgba(129, 140, 248, 0.2) 50%, transparent 70%);
      filter: blur(15px);
      animation: drift 20s infinite ease-in-out;
    }

    .orb-pulse {
      animation: pulse 8s infinite ease-in-out;
    }

    .orb1 { 
      width: 250px; height: 250px; top: 8%; left: 12%; 
      animation-duration: 25s; animation-delay: -3s; 
      background-image: radial-gradient(circle, rgba(59, 130, 246, 0.5), rgba(99, 102, 241, 0.3) 60%, transparent 80%);
    }
    .orb2 { 
      width: 350px; height: 350px; top: 45%; left: 65%; 
      animation-duration: 30s; animation-delay: -8s; 
      background-image: radial-gradient(circle, rgba(129, 140, 248, 0.4), rgba(99, 102, 241, 0.2) 50%, transparent 70%);
    }
    .orb3 { 
      width: 180px; height: 180px; top: 75%; left: 8%; 
      animation-duration: 22s; animation-delay: -12s; 
      background-image: radial-gradient(circle, rgba(99, 102, 241, 0.6), rgba(59, 130, 246, 0.2) 60%, transparent 80%);
    }
    .orb4 { 
      width: 300px; height: 300px; top: 15%; left: 78%; 
      animation-duration: 28s; animation-delay: -5s; 
      background-image: radial-gradient(circle, rgba(79, 70, 229, 0.4), rgba(129, 140, 248, 0.3) 50%, transparent 70%);
    }
    .orb5 { 
      width: 200px; height: 200px; top: 60%; left: 85%; 
      animation-duration: 35s; animation-delay: -15s; 
      background-image: radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent 70%);
    }

    .form-container {
      animation: slideInUp 0.8s ease-out;
    }

    .form-title {
      animation: slideInDown 0.6s ease-out 0.2s both;
    }

    .form-field {
      animation: slideInUp 0.6s ease-out both;
    }

    .form-field:nth-child(1) { animation-delay: 0.3s; }
    .form-field:nth-child(2) { animation-delay: 0.4s; }
    .form-field:nth-child(3) { animation-delay: 0.5s; }

    .form-button {
      animation: slideInUp 0.6s ease-out 0.6s both, glow 3s infinite ease-in-out 1s;
    }

    .form-link {
      animation: slideInUp 0.6s ease-out 0.7s both;
    }

    .input-focus {
      animation: glow 0.3s ease-out;
    }

    .shimmer-button {
      background: linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #3b82f6 100%);
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
    }

    .floating-element {
      animation: floatUpDown 3s ease-in-out infinite;
    }

    .message-slide {
      animation: slideInDown 0.5s ease-out;
    }

    /* Enhanced grid pattern */
    .enhanced-grid {
      background-image: 
        radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(129, 140, 248, 0.1) 0%, transparent 50%),
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 3rem 3rem, 3rem 3rem;
    }
  `;

  return (
    <>
      <style>{backgroundAnimationStyle}</style>
      <div className="relative flex items-center justify-center min-h-screen bg-slate-950 p-4 font-sans overflow-hidden enhanced-grid">
        
        {/* Enhanced Animated Orbs Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="orb orb1"></div>
          <div className="orb orb2 orb-pulse"></div>
          <div className="orb orb3"></div>
          <div className="orb orb4 orb-pulse"></div>
          <div className="orb orb5"></div>
        </div>

        {/* Additional floating particles */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-500/20 rounded-full floating-element"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        {/* Enhanced Form Card */}
        <div className="form-container relative z-10 w-full max-w-md p-8 space-y-6 bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 hover:border-slate-600/70 transition-all duration-300">
          
          {/* Animated Title */}
          <div className="form-title text-center">
            <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
              Create Your Account
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          <div className="space-y-6">
            {/* Username Field */}
            <div className="form-field">
              <label
                htmlFor="username"
                className="block mb-2 text-sm font-medium text-gray-300 transition-colors duration-200"
              >
                <span className="flex items-center gap-2">
                  <span>👤</span> Username
                </span>
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  name="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-800/80 text-gray-100 placeholder-gray-500 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    transition-all duration-300 hover:bg-slate-800 backdrop-blur-sm
                    ${focusedField === 'username' ? 'border-blue-500 shadow-lg shadow-blue-500/25' : 'border-slate-700'}
                  `}
                />
                {focusedField === 'username' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="form-field">
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-300 transition-colors duration-200"
              >
                <span className="flex items-center gap-2">
                  <span></span> Email Address
                </span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-800/80 text-gray-100 placeholder-gray-500 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    transition-all duration-300 hover:bg-slate-800 backdrop-blur-sm
                    ${focusedField === 'email' ? 'border-blue-500 shadow-lg shadow-blue-500/25' : 'border-slate-700'}
                  `}
                />
                {focusedField === 'email' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="form-field">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-300 transition-colors duration-200"
              >
                <span className="flex items-center gap-2">
                  <span></span> Password
                </span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-800/80 text-gray-100 placeholder-gray-500 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    transition-all duration-300 hover:bg-slate-800 backdrop-blur-sm
                    ${focusedField === 'password' ? 'border-blue-500 shadow-lg shadow-blue-500/25' : 'border-slate-700'}
                  `}
                />
                {focusedField === 'password' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                )}
              </div>
            </div>

            {/* Animated Submit Button */}
            <button
              type="button"
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