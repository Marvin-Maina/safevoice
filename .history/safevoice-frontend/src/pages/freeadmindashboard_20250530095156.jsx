import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Shield, AlertCircle, Loader2, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'; // Added icons for status

const FreeAdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // New state for filtering
  const [updatingReportId, setUpdatingReportId] = useState(null); // To track which report is being updated

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Use the correct API endpoint from your documentation
      // Append filterStatus if it's not 'all'
      const endpoint = filterStatus === 'all'
        ? '/api/admin/reports/'
        : `/api/admin/reports/?status=${filterStatus}`; // Assuming backend supports ?status= query param

      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`, // Ensure you're using 'accessToken'
        },
      });
      setReports(response.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError('Could not load reports. Please ensure you are logged in as an admin.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]); // Re-run fetchReports when filterStatus changes

  useEffect(() => {
    fetchReports();
  }, [fetchReports]); // Depend on fetchReports memoized callback

  // Function to handle status updates for a report
  const handleStatusUpdate = async (reportId, newStatus) => {
    setUpdatingReportId(reportId); // Set the ID of the report being updated
    try {
      await axios.put(`/api/admin/reports/${reportId}/`,
        { status: newStatus }, // Send the new status
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
          },
        }
      );
      // Update the status of the specific report in the local state
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
      // Optionally re-fetch all reports to ensure consistency, especially if filters are active
      // fetchReports();
    } catch (err) {
      console.error(`Failed to update report ${reportId} status to ${newStatus}:`, err);
      setError(`Failed to update report status for ID: ${reportId}.`);
    } finally {
      setUpdatingReportId(null); // Clear the updating ID
    }
  };

  // Helper function to render status badge with icon
  const renderStatusBadge = (status) => {
    let bgColor = 'bg-gray-700';
    let textColor = 'text-gray-300';
    let Icon = Clock; // Default icon

    switch (status) {
      case 'pending':
        bgColor = 'bg-yellow-900/30';
        textColor = 'text-yellow-400';
        Icon = Clock;
        break;
      case 'approved':
        bgColor = 'bg-green-900/30';
        textColor = 'text-green-400';
        Icon = CheckCircle;
        break;
      case 'resolved':
        bgColor = 'bg-blue-900/30';
        textColor = 'text-blue-400';
        Icon = Eye; // Or another appropriate icon for resolved
        break;
      case 'rejected':
        bgColor = 'bg-red-900/30';
        textColor = 'text-red-400';
        Icon = XCircle;
        break;
      default:
        break;
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${bgColor} ${textColor}`}>
        <Icon className="h-4 w-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-blue-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-red-400">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c1b] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Free Admin Dashboard</h1>
        </div>

        {/* Filter Section */}
        <div className="mb-6 flex items-center space-x-4">
          <label htmlFor="status-filter" className="text-gray-300">Filter by Status:</label>
          <select
            id="status-filter"
            className="bg-[#111327] border border-gray-600 text-white rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="resolved">Resolved</option>
            {/* Add other statuses as defined in your backend */}
          </select>
        </div>

        {reports.length === 0 ? (
          <div className="bg-[#111327] rounded-lg p-6 text-gray-300">
            No reports to review yet for the current filter.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-[#111327] rounded-lg p-6 space-y-4 border border-blue-900/20">
                <div>
                  <h2 className="text-xl font-semibold text-white">{report.title || 'No Title'}</h2>
                  <p className="text-gray-300 mt-2">{report.description || 'No Description'}</p>
                </div>

                <div className="border-t border-blue-900/20 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <p className="text-gray-400 text-sm">
                      Submitted: {new Date(report.submitted_at).toLocaleString()}
                    </p>
                    {renderStatusBadge(report.status)}
                  </div>
                  {/* Action Buttons for Status Update */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {report.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(report.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={updatingReportId === report.id}
                        >
                          {updatingReportId === report.id ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(report.id, 'rejected')}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={updatingReportId === report.id}
                        >
                          {updatingReportId === report.id ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                          Reject
                        </button>
                      </>
                    )}
                    {/* Optionally add a 'Resolve' button if the report is already approved */}
                    {report.status === 'approved' && (
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={updatingReportId === report.id}
                      >
                        {updatingReportId === report.id ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                        Mark as Resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeAdminDashboard;