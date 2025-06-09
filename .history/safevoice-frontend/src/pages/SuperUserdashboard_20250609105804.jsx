import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BadgeCheck, XCircle, Loader2, AlertCircle, Shield, Clock } from 'lucide-react';

const SuperuserDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('/api/accounts/admin-access-review/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(res.data);
    } catch (err) {
      setError('Failed to fetch requests.');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`/api/accounts/admin-access-review/${requestId}/`, { action }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error(err);
      setError('Action failed. Please try again.');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString(); // Adjusts to local date and time format
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 h-16 w-16" />
        <p className="text-white text-xl ml-4">Loading access requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <div className="bg-red-500/20 text-red-300 p-6 rounded-2xl flex items-center gap-3 border border-red-500/30">
          <AlertCircle className="h-6 w-6" />
          <span className="text-lg">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-6 sm:p-10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/10 rounded-full filter blur-3xl animate-pulse animation-duration-7000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full filter blur-3xl animate-pulse animation-delay-2000 animation-duration-8000"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" aria-hidden="true"></div>

      <div className="relative z-10 w-full max-w-4xl bg-gray-900/70 rounded-3xl shadow-2xl p-8 sm:p-10 border border-purple-700/30 backdrop-blur-xl text-center">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-3 bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
            Superuser Dashboard
          </h1>
          <p className="text-lg text-gray-300 font-light">
            Review and manage administrator access requests.
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700/30 text-gray-400 text-xl font-medium flex flex-col items-center justify-center min-h-[200px]">
            <Shield className="w-12 h-12 mb-4 text-gray-500" />
            <p>No new access requests at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((req) => (
              <div key={req.id} className="bg-gray-800/70 p-6 rounded-2xl shadow-lg border border-gray-700/50 flex flex-col justify-between transform transition-transform duration-300 hover:scale-105 hover:border-purple-600/50">
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-white flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-purple-400" />
                    {req.username}
                  </h2>
                  <div className="bg-gray-700/20 rounded-lg p-4 mb-3 border border-gray-600/30">
                    <strong className="text-gray-300 block mb-2">Justification:</strong>
                    <p className="text-gray-400">{req.justification}</p>
                  </div>
                  <p className="flex items-center text-sm text-gray-400 mb-4">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    Submitted: {formatDateTime(req.submitted_at)}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(req.id, 'approve')}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <BadgeCheck className="w-5 h-5 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'reject')} {/* Removed the backslash here */}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperuserDashboard;