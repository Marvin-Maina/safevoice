import { useState } from 'react';

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
      // TODO: Replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage('✅ Registration successful! Redirecting to login...');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      setMessage('❌ Registration failed. Please try again.');
    }
  };

  const messageIsError = message.startsWith('❌');
  const messageColor = messageIsError ? 'text-red-400' : 'text-green-400';

  const backgroundAnimationStyle = `
    @keyframes drift {
      0% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); opacity: 0.1; }
      100% { transform: translateY(-20px) translateX(20px) scale(1.1) rotate(360deg); opacity: 0.1; }
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .orb {
      position: absolute;
      border-radius: 9999px;
      filter: blur(20px);
      opacity: 0.4;
      animation: drift 30s infinite alternate ease-in-out;
    }

    .shimmer {
      background-size: 200% 100%;
      animation: shimmer 2s infinite linear;
    }

    .float {
      animation: float 3s infinite ease-in-out;
    }

    .grid-bg {
      background-image:
        radial-gradient(circle at 25% 25%, rgba(59,130,246,0.05) 0%, transparent 50%),
        radial-gradient(circle at 75% 75%, rgba(99,102,241,0.05) 0%, transparent 50%);
    }
  `;

  return (
    <>
      <style>{backgroundAnimationStyle}</style>

      <div className="relative flex items-center justify-center min-h-screen bg-slate-950 p-4 grid-bg overflow-hidden">

        {/* Orbs */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="orb w-72 h-72 bg-blue-500 top-10 left-20"></div>
          <div className="orb w-96 h-96 bg-purple-500 top-1/2 right-10"></div>
          <div className="orb w-48 h-48 bg-indigo-400 bottom-10 left-10"></div>
        </div>

        {/* Floating sparkles */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-400/30 rounded-full float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Form Card */}
        <form
          onSubmit={handleSubmit}
          className="relative z-10 w-full max-w-md space-y-6 bg-slate-900/90 p-8 rounded-2xl shadow-2xl border border-slate-700/60 backdrop-blur-md transition"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent">
              Create an Account
            </h2>
            <p className="text-gray-400 mt-1 text-sm">Let’s get you started ✨</p>
          </div>

          {message && (
            <div className={`text-center text-sm font-medium ${messageColor}`}>
              {message}
            </div>
          )}

          <div className="space-y-4">
            {/* Username */}
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField('')}
              className={`w-full px-4 py-3 rounded-xl border text-sm bg-slate-800/80 text-white placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                ${focusedField === 'username' ? 'border-blue-400 shadow-blue-500/30 shadow-lg' : 'border-slate-700'}
              `}
            />

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              className={`w-full px-4 py-3 rounded-xl border text-sm bg-slate-800/80 text-white placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                ${focusedField === 'email' ? 'border-blue-400 shadow-blue-500/30 shadow-lg' : 'border-slate-700'}
              `}
            />

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              className={`w-full px-4 py-3 rounded-xl border text-sm bg-slate-800/80 text-white placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition
                ${focusedField === 'password' ? 'border-blue-400 shadow-blue-500/30 shadow-lg' : 'border-slate-700'}
              `}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 px-6 text-white text-sm font-semibold rounded-xl shimmer bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:scale-105 transition-all shadow-lg"
          >
            Register
          </button>

          {/* Redirect to login */}
          <p className="text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <a href="/login" className="text-blue-400 hover:underline">
              Sign in
            </a>
          </p>
        </form>
      </div>
    </>
  );
}
