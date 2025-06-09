import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BadgeCheck, XCircle, Loader2, AlertCircle, Shield, Clock, UserCircle, Mail, Building, Info } from 'lucide-react'; // Added icons for user details
import { useNavigate } from 'react-router-dom'; // Import useNavigate for logout

const SuperuserDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingRequestId, setProcessingRequestId] = useState(null); // To disable buttons during action
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get('/api//access-requests-review/', { // Corrected endpoint as per latest backend
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to fetch requests. Ensure you are logged in as a Superuser and have the correct permissions.');
      if (err.response && err.response.status === 401) {
        navigate('/login'); // Redirect to login if token is invalid
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId, action) => {
    setProcessingRequestId(requestId); // Set processing state for the specific request
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`/api/reports/access-requests-review/${requestId}/`, { action }, { // Corrected endpoint
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(prev => prev.filter(r => r.id !== requestId)); // Remove processed request from list
      // Optionally show a success message here
    } catch (err) {
      console.error('Action failed:', err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(`Action failed: ${err.response.data.detail}`);
      } else {
        setError('Action failed. Please try again.');
      }
    } finally {
      setProcessingRequestId(null); // Clear processing state
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Logout handler for the page
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6 font-inter"> {/* Dark background, light text */}
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700"> {/* Darker header, styled border/shadow */}
          <div>
            <h1 className="text-4xl font-extrabold text-white">Admin Access Requests</h1> {/* White heading */}
            <p className="text-gray-400 mt-2">Review and manage admin role access requests</p> {/* Lighter gray text */}
          </div>
          <div className="flex items-center mt-4 sm:mt-0">
            <Shield className="w-8 h-8 text-blue-500 mr-4" /> {/* Blue icon, slight margin */}
            <button
              onClick={handleLogout}
              className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
            >
              Logout
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" /> {/* Blue spinner */}
            <p className="ml-4 text-blue-300">Loading requests...</p> {/* Blue loading text */}
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 text-center text-red-300 flex items-center justify-center"> {/* Darker red error */}
            <AlertCircle className="w-6 h-6 mr-2" />
            {error}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-8 text-center"> {/* Darker empty state */}
            <Shield className="w-16 h-16 mx-auto text-gray-600 mb-4" /> {/* Darker gray icon */}
            <h3 className="text-xl font-semibold text-white mb-2">No Pending Requests</h3> {/* White heading */}
            <p className="text-gray-400">All access requests have been processed or there are none currently.</p> {/* Lighter gray text */}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-gray-800 rounded-lg shadow-xl p-6 transition-all duration-300 hover:shadow-2xl hover:border-blue-500 border border-gray-700" // Darker card, blue hover border
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-orange-400 flex items-center"> {/* Orange text for emphasis */}
                    <UserCircle className="h-6 w-6 mr-2 text-orange-500" /> {req.username}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-800 text-yellow-200"> {/* Yellow badge */}
                    Pending Review
                  </span>
                </div>

                <div className="space-y-3 mb-6 text-gray-300"> {/* Lighter gray for general text */}
                  <p className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" /> <strong className="text-white mr-1">Email:</strong> {req.email}
                  </p>
                  <p className="flex items-center">
                    <UserCircle className="w-4 h-4 mr-2 text-gray-400" /> <strong className="text-white mr-1">Request Type:</strong> {req.request_type.replace('_', ' ').charAt(0).toUpperCase() + req.request_type.replace('_', ' ').slice(1)}
                  </p>
                  {req.organization_name && ( // Only show if organization_name exists
                    <p className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-400" /> <strong className="text-white mr-1">Organization:</strong> {req.organization_name}
                    </p>
                  )}
                  {req.organization_description && ( // Only show if organization_description exists
                    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600"> {/* Darker justification box */}
                      <strong className="text-white block mb-2 flex items-center"><Info className="w-4 h-4 mr-2" />Justification:</strong>
                      <p className="text-gray-300">{req.organization_description}</p> {/* Lighter text for description */}
                    </div>
                  )}
                  <p className="flex items-center text-sm text-gray-400"> {/* Lighter gray for date */}
                    <Clock className="w-4 h-4 mr-2" />
                    Submitted: {formatDateTime(req.submitted_at)}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(req.id, 'approve')}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={processingRequestId === req.id} // Disable button while processing
                  >
                    {processingRequestId === req.id ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <BadgeCheck className="w-5 h-5 mr-2" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'reject')}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={processingRequestId === req.id} // Disable button while processing
                  >
                    {processingRequestId === req.id ? (
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="w-5 h-5 mr-2" />
                    )}
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
