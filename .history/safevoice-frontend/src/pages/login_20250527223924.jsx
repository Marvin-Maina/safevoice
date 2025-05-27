import { useState } from 'react';
import api from '../axios';


export default function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/accounts/login/', formData);
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      setMessage('✅ Logged in successfully!');
      setFormData({ username: '', password: '' });
    } catch (error) {
      setMessage(error.response?.data?.detail || '❌ Login failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-8 border-2 border-teal-600 rounded-lg bg-black text-teal-400 font-sans">
      <h2 className="text-2xl font-bold mb-6 text-teal-300">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
          autoComplete="username"
          className="w-full px-4 py-2 rounded border border-teal-600 bg-blue-900 text-teal-300 placeholder-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
          className="w-full px-4 py-2 rounded border border-teal-600 bg-blue-900 text-teal-300 placeholder-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
        <button
          type="submit"
          className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-black font-bold rounded transition-colors duration-300"
        >
          Login
        </button>
      </form>
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
