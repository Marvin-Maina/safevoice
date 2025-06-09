import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BadgeCheck, XCircle, Loader2, AlertCircle, Shield, Clock } from 'lucide-react';

const SuperuserDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
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
      const token = localStorage.getItem('access');
      await axios.post(`/api/admin-access-review/${requestId}/`, { action }, {
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-md">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Access Requests</h1>
            <p className="text-gray-500 mt-2">Review and manage access requests</p>
          </div>
          <div className="flex items-center mt-4 sm:mt-0">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600">
            <AlertCircle className="w-6 h-6 mx-auto mb-2" />
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pending Requests</h3>
            <p className="text-gray-500">All access requests have been processed</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">{req.request_type}</h3>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Pending Review
                  </span>
                </div>

                <div className="space-y-3 mb-6">
                  <p className="text-gray-600">
                    <strong className="text-gray-700">Organization:</strong> {req.organization_name || 'N/A'}
                  </p>
                  <p className="text-gray-600">
                    <strong className="text-gray-700">Type:</strong> {req.organization_type || 'N/A'}
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <strong className="text-gray-700 block mb-2">Justification:</strong>
                    <p className="text-gray-600">{req.justification}</p>
                  </div>
                  <p className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-2" />
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
                    onClick={() => handleAction(req.id, 'reject')}
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