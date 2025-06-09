import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Shield, AlertCircle, Loader2, CheckCircle,
  XCircle, Clock, Eye, MessageSquare, FileText, Link, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const FreeAdminDashboard = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortNewest, setSortNewest] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingReportId, setUpdatingReportId] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = filterStatus === 'all'
        ? '/api/admin/reports/'
        : `/api/admin/reports/?status=${filterStatus}`;
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setReports(response.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
      setError('Could not load reports. Please ensure you are logged in as an admin.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleStatusUpdate = async (reportId, newStatus) => {
    setUpdatingReportId(reportId);
    try {
      await axios.patch(
        `/api/admin/reports/${reportId}/update/`, // <--- THIS IS THE CORRECTED LINE!
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      // Optimistically update the UI or refetch reports
      fetchReports();
    } catch (err) {
      console.error(`Failed to update report status to ${newStatus}:`, err);
      setError(`Failed to update report status. Error: ${err.response?.data?.detail || err.message}`);
    } finally {
      setUpdatingReportId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleViewDetails = (reportId) => {
    navigate(`/reports/${reportId}`); // Navigate to the UserReportDetail page
  };

  const sortedAndFilteredReports = reports
    .filter(report =>
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.submitted_at);
      const dateB = new Date(b.submitted_at);
      return sortNewest ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 sm:p-10">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center text-blue-400 mb-8 flex items-center justify-center gap-3">
          <Shield className="h-10 w-10" />
          Admin Dashboard
        </h1>

        {error && (
          <div className="bg-red-500/20 text-red-300 p-4 rounded-md mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search reports..."
            className="flex-grow bg-[#0a0c1b] border border-gray-700 rounded-md px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="bg-[#0a0c1b] border border-gray-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="escalated">Escalated</option>
          </select>
          <button
            onClick={() => setSortNewest(!sortNewest)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Sort: {sortNewest ? 'Newest First' : 'Oldest First'}
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
            <p className="ml-4 text-xl text-gray-400">Loading reports...</p>
          </div>
        ) : sortedAndFilteredReports.length === 0 ? (
          <p className="text-center text-gray-500 text-lg mt-10">No reports found matching your criteria.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-[#0a0c1b] rounded-lg shadow-lg border border-blue-900/20 hover:border-blue-700/30 transition-all duration-200 flex flex-col"
              >
                <div className="p-5 flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold text-blue-300">{report.title}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        report.status === 'pending' ? 'bg-yellow-600/30 text-yellow-300' :
                        report.status === 'under_review' ? 'bg-blue-600/30 text-blue-300' :
                        report.status === 'resolved' ? 'bg-green-600/30 text-green-300' :
                        report.status === 'escalated' ? 'bg-red-600/30 text-red-300' :
                        'bg-gray-600/30 text-gray-300'
                      }`}
                    >
                      {report.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mb-2">
                    Category: <span className="font-medium text-gray-300">{report.category}</span>
                  </p>
                  <p className="text-sm text-gray-400 mb-2">
                    Submitted: <span className="font-medium text-gray-300">{new Date(report.submitted_at).toLocaleString()}</span>
                  </p>
                  {report.submitted_by_username && (
                    <p className="text-sm text-gray-400 mb-2">
                      Submitted by: <span className="font-medium text-gray-300">{report.submitted_by_username}</span>
                    </p>
                  )}
                  {report.is_anonymous && (
                    <p className="text-sm text-gray-400 mb-2 text-yellow-500 flex items-center gap-1">
                      <Info className="h-4 w-4" /> Anonymous Submission
                    </p>
                  )}
                  {report.priority_flag && (
                    <p className="text-sm text-gray-400 mb-2 text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" /> Priority Flagged
                    </p>
                  )}
                   {report.is_premium_report && (
                    <p className="text-sm text-gray-400 mb-2 text-purple-400 flex items-center gap-1">
                      <Shield className="h-4 w-4" /> Premium Report
                    </p>
                  )}


                  {expandedId === report.id && (
                    <div className="mt-4 border-t border-gray-700 pt-4">
                      <p className="text-sm text-gray-300 mb-2">
                        <span className="font-semibold">Description:</span>
                        <br />
                        {report.description} {/* Display full description */}
                      </p>

                      {report.file_upload && (
                        <p className="text-sm text-gray-300 mb-2 flex items-center gap-1">
                          <Link className="h-4 w-4 text-blue-400" />
                          File: <a href={report.file_upload} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Attachment</a>
                        </p>
                      )}

                      {/* Display justification and organization details if applicable */}
                      {report.request_type === 'organization' && ( // Assuming you might link a report to an admin request type
                        <>
                          <p className="text-sm text-gray-300 mb-2 mt-3">
                            <span className="font-semibold">Request Details:</span>
                          </p>
                          <p className="text-xs text-gray-400 mb-1">
                            Organization Name: <span className="font-medium text-gray-300">{report.organization_name}</span>
                          </p>
                          <p className="text-xs text-gray-400 mb-1">
                            Organization Type: <span className="font-medium text-gray-300">{report.organization_type}</span>
                          </p>
                          <p className="text-xs text-gray-400 mb-1">
                            Justification: <span className="font-medium text-gray-300">{report.justification}</span>
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4 bg-[#10122a] border-t border-blue-900/20 flex flex-wrap gap-3 justify-end">
                  <button
                    onClick={() => toggleExpand(report.id)}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md flex items-center text-sm transition-colors duration-300"
                  >
                    {expandedId === report.id ? 'Show Less' : 'View More Details'}
                    <Eye className="ml-2 h-4 w-4" />
                  </button>

                  {/* New "View Details" button to navigate to UserReportDetail */}
                  <button
                    onClick={() => handleViewDetails(report.id)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm transition-colors duration-300"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Communicate / Full View
                  </button>

                  {report.status !== 'resolved' && report.status !== 'rejected' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'under_review')}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center text-sm disabled:opacity-50"
                        disabled={updatingReportId === report.id || report.status === 'under_review'}
                      >
                        {updatingReportId === report.id && report.status === 'pending'
                          ? <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          : <Eye className="mr-2 h-4 w-4" />}
                        Mark Under Review
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center text-sm disabled:opacity-50"
                        disabled={updatingReportId === report.id}
                      >
                        {updatingReportId === report.id
                          ? <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          : <CheckCircle className="mr-2 h-4 w-4" />}
                        Resolve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'rejected')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md flex items-center text-sm disabled:opacity-50"
                        disabled={updatingReportId === report.id}
                      >
                        {updatingReportId === report.id
                          ? <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          : <XCircle className="mr-2 h-4 w-4" />}
                        Reject
                      </button>
                    </>
                  )}
                  {report.status === 'resolved' && (
                    <span className="text-green-400 font-semibold flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> Resolved
                    </span>
                  )}
                   {report.status === 'rejected' && (
                    <span className="text-red-400 font-semibold flex items-center gap-1">
                      <XCircle className="h-4 w-4" /> Rejected
                    </span>
                  )}
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