// pages/become-admin.jsx
import React, { useState } from 'react';
import axios from 'axios';

const BecomeAdmin = () => {
  const [requestType, setRequestType] = useState('individual');
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        request_type: requestType,
        ...(requestType === 'organization' && {
          organization_name: orgName,
          organization_description: orgDescription,
        }),
      };

      const token = localStorage.getItem('token'); // Adjust based on your JWT auth setup

      const res = await axios.post('/api/admin-access-requests/', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage({ type: 'success', text: 'Request submitted successfully!' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Something went wrong.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gray-950 text-white py-20 px-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Become an Admin</h1>

        {message && (
          <div
            className={`mb-6 p-4 rounded ${
              message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-2 font-medium">Request Type</label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full p-2 bg-gray-800 rounded border border-gray-700"
            >
              <option value="individual">Individual</option>
              <option value="organization">Organization</option>
            </select>
          </div>

          {requestType === 'organization' && (
            <>
              <div>
                <label className="block mb-2 font-medium">Organization Name</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">Organization Description</label>
                <textarea
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  required
                  rows={4}
                  className="w-full p-2 bg-gray-800 rounded border border-gray-700"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded text-white font-semibold transition"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default BecomeAdmin;
