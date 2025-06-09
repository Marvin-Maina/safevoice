import { useState } from 'react';

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful login
      setMessage('✅ Logged in successfully!');
      setFormData({ username: '', password: '' });

      setTimeout(() => {
        console.log('Redirecting to dashboard...');
      }, 1500);
    } catch (error) {
      setMessage('❌ Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const messageIsError = message.startsWith('❌');
  const messageColor = messageIsError ? 'text-red-400' : 'text-green-400';

  const backgroundAnimationStyle = `...`; // [Keep your full CSS string here, unchanged for brevity]

  return (
    <>
      <style>{backgroundAnimationStyle}</style>
      <div className="relative flex items-center justify-center min-h-screen bg-slate-950 p-4 font-sans overflow-hidden enhanced-grid">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="orb orb1"></div>
          <div className="orb orb2 orb-pulse"></div>
          <div className="orb orb3"></div>
          <div className="orb orb4 orb-pulse"></div>
          <div className="orb orb5"></div>
          <div className="orb orb6"></div>
        </div>

        <div className="absolute inset-0 z-0 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-500/20 rounded-full floating-element"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="absolute top-8 right-8 z-0 security-badge opacity-30">
          <div className="flex items-center gap-2 text-blue-400/60 text-sm">
            <span>🔒</span>
            <span>Secure Login</span>
          </div>
        </div>

        <div className="form-container relative z-10 w-full max-w-md p-8 space-y-6 bg-slate-900/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 hover:border-slate-600/70 transition-all duration-300">
          <div className="welcome-badge absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              Welcome Back
            </div>
          </div>

          <div className="form-title text-center pt-4">
            <h2 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
              Sign In
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Access your secure account
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-800/80 text-gray-100 placeholder-gray-500 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    transition-all duration-300 hover:bg-slate-800 backdrop-blur-sm
                    ${
                      focusedField === 'username'
                        ? 'border-blue-500 shadow-lg shadow-blue-500/25'
                        : 'border-slate-700'
                    }`}
                />
                {focusedField === 'username' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                )}
              </div>
            </div>

            <div className="form-field">
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-300 transition-colors duration-200"
              >
                <span className="flex items-center gap-2">
                  <span>🔑</span> Password
                </span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-800/80 text-gray-100 placeholder-gray-500 
                    focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 
                    transition-all duration-300 hover:bg-slate-800 backdrop-blur-sm
                    ${
                      focusedField === 'password'
                        ? 'border-purple-500 shadow-lg shadow-purple-500/25'
                        : 'border-slate-700'
                    }`}
                />
                {focusedField === 'password' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
                )}
              </div>
            </div>

            {message && (
              <div
                className={`message-slide text-center font-medium text-sm ${messageColor}`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className={`form-button w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-300 
                ${
                  isLoading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'shimmer-button hover:scale-105 active:scale-95'
                }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex justify-center items-center gap-2">
                  <span className="loading-spinner w-5 h-5 border-2 border-t-transparent border-white rounded-full"></span>
                  Signing in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="form-link text-center text-gray-400 text-sm pt-4">
            Don’t have an account?{' '}
            <a href="/register" className="text-blue-400 hover:underline">
              Register
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
