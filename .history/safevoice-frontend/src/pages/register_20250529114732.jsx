import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setMessage('❌ Passwords do not match');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8000/api/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.status === 201 || res.status === 200) {
        setMessage('✅ Registered successfully! Redirecting...');
        setTimeout(() => window.location.href = '/login', 1500);
      } else {
        setMessage('❌ Unexpected response from server');
      }
    } catch (error) {
      console.error(error.response || error.message);
      setMessage(error?.response?.data?.detail || '❌ Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 p-6">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-8">
        <h2 className="text-3xl font-extrabold text-center mb-6 text-indigo-700">Create your account</h2>
        {message && (
          <p className={`mb-4 text-center font-semibold ${
            message.startsWith('✅') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-semibold py-3 rounded-md shadow"
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          Already got an account?{' '}
          <a href="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
