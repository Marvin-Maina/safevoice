import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Shield, AlertCircle, Loader2, CheckCircle,
  XCircle, Clock, Eye, MessageSquare, FileText, Link, Info, BarChart2, Users, Flag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FreeAdminDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortNewest, setSortNewest] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingReportId, setUpdatingReportId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

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

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const response = await axios.get('/api/admin/analytics/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setAnalytics(response.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      // Optionally set an error for analytics, but don't block main reports
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    fetchAnalytics();
  }, [fetchReports, fetchAnalytics]);

  const handleStatusUpdate = async (reportId, newStatus) => {
    setUpdatingReportId(reportId);
    try {
      await axios.patch(
        `/api/admin/reports/${reportId}/update/`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      fetchReports();
      fetchAnalytics();
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
    navigate(`/reports/${reportId}`);
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

  // Common card styling for analytics
  const analyticsCardClass = "bg-gradient-to-br from-[#0f1127] to-[#0d0e20] p-4 rounded-xl shadow-lg border border-gray-800 transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-xl flex flex-col justify-center items-center";
  const analyticsValueClass = "text-4xl font-extrabold mt-2";
  const analyticsLabelClass = "text-gray-300 text-sm mt-1";

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

        {/* Analytics Summary Section */}
        <div className="mb-8 p-6 bg-[#0a0c1b] rounded-2xl shadow-2xl border border-blue-900/30 relative overflow-hidden">
          <h2 className="text-2xl font-bold text-blue-300 mb-5 pb-3 border-b border-blue-900/50 flex items-center gap-3">
            <BarChart2 className="h-7 w-7 text-blue-400" /> Dashboard Overview
          </h2>
          {analyticsLoading ? (
            <div className="flex justify-center items-center h-24">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="ml-3 text-lg text-gray-400">Loading analytics...</p>
            </div>
          ) : analytics ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Reports */}
              <div className={analyticsCardClass}>
                <p className={analyticsLabelClass}>Total Reports</p>
                <p className={analyticsValueClass + " text-white"}>{analytics.total_reports}</p>
              </div>
              {/* Pending */}
              <div className={analyticsCardClass}>
                <p className={analyticsLabelClass}>Pending</p>
                <p className={analyticsValueClass + " text-yellow-300"}>{analytics.reports_by_status.pending || 0}</p>
              </div>
              {/* Under Review */}
              <div className={analyticsCardClass}>
                <p className={analyticsLabelClass}>Under Review</p>
                <p className={analyticsValueClass + " text-blue-300"}>{analytics.reports_by_status.under_review || 0}</p>
              </div>
              {/* Resolved */}
              <div className={analyticsCardClass}>
                <p className={analyticsLabelClass}>Resolved</p>
                <p className={analyticsValueClass + " text-green-400"}>{analytics.reports_by_status.resolved || 0}</p>
              </div>
              {/* Rejected */}
              <div className={analyticsCardClass}>
                <p className={analyticsLabelClass}>Rejected</p>
                <p className={analyticsValueClass + " text-red-400"}>{analytics.reports_by_status.rejected || 0}</p>
              </div>
              {/* Escalated */}
              <div className={analyticsCardClass}>
                <p className={analyticsLabelClass}>Escalated</p>
                <p className={analyticsValueClass + " text-orange-400"}>{analytics.reports_by_status.escalated || 0}</p>
              </div>
              {/* Priority Reports */}
              <div className={analyticsCardClass}>
                <Flag className="h-8 w-8 text-red-400 mb-1" />
                <p className={analyticsLabelClass}>Priority Reports</p>
                <p className={analyticsValueClass + " text-red-400"}>{analytics.priority_reports_count || 0}</p>
              </div>
              {/* Anonymous Reports */}
              <div className={analyticsCardClass}>
                <Users className="h-8 w-8 text-purple-400 mb-1" />
                <p className={analyticsLabelClass}>Anonymous Reports</p>
                <p className={analyticsValueClass + " text-purple-400"}>
                 {analytics.anonymous_vs_identified_reports?.[true] || 0}
</p>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">Could not load analytics data.</p>
          )}
        </div>

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
            <option value="rejected">Rejected</option>
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
                        report.status === 'rejected' ? 'bg-red-600/30 text-red-300' :
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
                        {report.description}
                      </p>

                      {report.file_upload && (
                        <p className="text-sm text-gray-300 mb-2 flex items-center gap-1">
                          <Link className="h-4 w-4 text-blue-400" />
                          File: <a href={report.file_upload} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">View Attachment</a>
                        </p>
                      )}

                      {report.request_type === 'organization' && (
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
                    className="bg-gray-900 hover:bg-blue-900/40 text-gray-300 px-4 py-2 rounded-md flex items-center text-sm transition-colors duration-300 border border-gray-700 hover:border-blue-800 group"
                  >
                    {expandedId === report.id ? 'Show Less' : 'View More Details'}
                    <Eye className="ml-2 h-4 w-4 text-gray-400 group-hover:text-blue-300" />
                  </button>

                  <button
                    onClick={() => handleViewDetails(report.id)}
                    className="bg-gray-900 hover:bg-blue-900/40 text-gray-300 px-4 py-2 rounded-md flex items-center text-sm transition-colors duration-300 border border-gray-700 hover:border-blue-800 group"
                  >
                    <MessageSquare className="mr-2 h-4 w-4 text-gray-400 group-hover:text-blue-300" />
                    Communicate / Full View
                  </button>

                  {report.status !== 'resolved' && report.status !== 'rejected' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'under_review')}
                        className="bg-gray-900 hover:bg-blue-900/40 text-blue-400 border border-blue-900 px-4 py-2 rounded-md flex items-center text-sm disabled:opacity-50 group"
                        disabled={updatingReportId === report.id || report.status === 'under_review'}
                      >
                        {updatingReportId === report.id && report.status === 'pending'
                          ? <Loader2 className="animate-spin mr-2 h-4 w-4 text-blue-400" />
                          : <Eye className="mr-2 h-4 w-4 text-blue-400 group-hover:text-blue-300" />}
                        Mark Under Review
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                        className="bg-gray-900 hover:bg-green-900/40 text-green-400 border border-green-900 px-4 py-2 rounded-md flex items-center text-sm disabled:opacity-50 group"
                        disabled={updatingReportId === report.id}
                      >
                        {updatingReportId === report.id
                          ? <Loader2 className="animate-spin mr-2 h-4 w-4 text-green-400" />
                          : <CheckCircle className="mr-2 h-4 w-4 text-green-400 group-hover:text-green-300" />}
                        Resolve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'rejected')}
                        className="bg-gray-900 hover:bg-red-900/40 text-red-400 border border-red-900 px-4 py-2 rounded-md flex items-center text-sm disabled:opacity-50 group"
                        disabled={updatingReportId === report.id}
                      >
                        {updatingReportId === report.id
                          ? <Loader2 className="animate-spin mr-2 h-4 w-4 text-red-400" />
                          : <XCircle className="mr-2 h-4 w-4 text-red-400 group-hover:text-red-300" />}
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
