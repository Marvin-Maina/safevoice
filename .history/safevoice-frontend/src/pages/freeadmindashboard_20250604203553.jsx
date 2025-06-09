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

  // Restored analytics state and related loading state
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
      let sortedReports = response.data;
      if (sortNewest) {
        sortedReports = sortedReports.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
      } else {
        sortedReports = sortedReports.sort((a, b) => new Date(a.submitted_at) - new Date(b.submitted_at));
      }
      setReports(sortedReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports. Please try again.');
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [filterStatus, sortNewest, navigate]);

  // Restored fetchAnalytics function
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
      console.error('Error fetching analytics:', err);
      // Optionally, set an error state for analytics specifically
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
    // Restored analytics fetch here
    fetchAnalytics();
  }, [fetchReports, fetchAnalytics]); // Added fetchAnalytics to dependencies

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
      fetchReports(); // Refresh reports after update
      fetchAnalytics(); // Refresh analytics after status update
    } catch (err) {
      console.error('Error updating report status:', err);
      setError('Failed to update report status.');
    } finally {
      setUpdatingReportId(null);
    }
  };

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (report.submitted_by_username && report.submitted_by_username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6 font-inter">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-4 sm:mb-0">Admin Dashboard</h1>
        <button
          onClick={() => navigate('/login')}
          className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          Logout
        </button>
      </header>

      {/* Restored Analytics Overview Section */}
      <section className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
          <BarChart2 className="mr-3 h-8 w-8 text-blue-400" /> Dashboard Overview
        </h2>
        {analyticsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-800 p-6 rounded-lg shadow-xl animate-pulse h-32"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-blue-600">
              <h3 className="text-lg font-semibold text-blue-400 mb-2 flex items-center">
                <Flag className="mr-2 h-5 w-5" /> Total Reports
              </h3>
              <p className="text-4xl font-extrabold text-white">{analytics?.total_reports || 0}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-green-600">
              <h3 className="text-lg font-semibold text-green-400 mb-2 flex items-center">
                <CheckCircle className="mr-2 h-5 w-5" /> Resolved Reports
              </h3>
              <p className="text-4xl font-extrabold text-white">{analytics?.reports_by_status?.resolved || 0}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-yellow-600">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2 flex items-center">
                <Clock className="mr-2 h-5 w-5" /> Pending Reports
              </h3>
              <p className="text-4xl font-extrabold text-white">{analytics?.reports_by_status?.pending || 0}</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-purple-600">
              <h3 className="text-lg font-semibold text-purple-400 mb-2 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" /> Priority Reports
              </h3>
              <p className="text-4xl font-extrabold text-white">{analytics?.priority_reports_count || 0}</p>
            </div>
          </div>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-6 flex items-center">
          <FileText className="mr-3 h-8 w-8 text-green-400" /> All Reports
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search reports..."
            className="flex-grow p-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-blue-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
            <option value="escalated">Escalated</option>
          </select>
          <button
            onClick={() => setSortNewest(!sortNewest)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            Sort by {sortNewest ? 'Oldest' : 'Newest'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto" />
            <p className="mt-4 text-lg text-blue-300">Loading reports...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg text-center flex items-center justify-center">
            <AlertCircle className="h-5 w-5 mr-2" /> {error}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
            No reports found matching your criteria.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReports.map((report) => (
              <div key={report.id} className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-400">{report.title}</h3>
                    <p className="text-sm text-gray-400 flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-1" /> Submitted: {new Date(report.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    report.status === 'pending' ? 'bg-yellow-800 text-yellow-200' :
                    report.status === 'under_review' ? 'bg-blue-800 text-blue-200' :
                    report.status === 'resolved' ? 'bg-green-800 text-green-200' :
                    report.status === 'rejected' ? 'bg-red-800 text-red-200' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {report.status.replace('_', ' ').charAt(0).toUpperCase() + report.status.replace('_', ' ').slice(1)}
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{report.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center">
                    <span className="font-semibold text-gray-300 mr-1">Category:</span> {report.category}
                  </span>
                  <span className="flex items-center">
                    <span className="font-semibold text-gray-300 mr-1">Submitted By:</span>
                    {report.is_anonymous ? (
                      <span className="flex items-center text-gray-500 italic">
                        <Shield className="h-4 w-4 mr-1" /> Anonymous
                      </span>
                    ) : (
                      report.submitted_by_username || 'N/A'
                    )}
                  </span>
                  {report.priority_flag && (
                    <span className="flex items-center text-red-400 font-semibold">
                      <Flag className="h-4 w-4 mr-1" /> Priority
                    </span>
                  )}
                  {report.is_premium_report && (
                    <span className="flex items-center text-purple-400 font-semibold">
                      <Shield className="h-4 w-4 mr-1" /> Premium Report
                    </span>
                  )}
                </div>

                {report.file_upload && (
                  <div className="mb-4">
                    <a
                      href={report.file_upload}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline flex items-center text-sm"
                    >
                      <Link className="h-4 w-4 mr-1" /> View Attachment
                    </a>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button
                    onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md flex items-center text-sm transition duration-200"
                  >
                    <Eye className="mr-2 h-4 w-4" /> {expandedId === report.id ? 'Collapse' : 'View Details'}
                  </button>

                  {/* Status Update Buttons */}
                  {report.status !== 'resolved' && report.status !== 'rejected' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                        className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center text-sm disabled:opacity-50 group"
                        disabled={updatingReportId === report.id}
                      >
                        {updatingReportId === report.id
                          ? <Loader2 className="animate-spin mr-2 h-4 w-4 text-white" />
                          : <CheckCircle className="mr-2 h-4 w-4 text-white group-hover:text-green-300" />
                        }
                        Resolve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'rejected')}
                        className="bg-gray-900 hover:bg-red-900/40 text-red-400 border border-red-900 px-4 py-2 rounded-md flex items-center text-sm disabled:opacity-50 group"
                        disabled={updatingReportId === report.id}
                      >
                        {updatingReportId === report.id
                          ? <Loader2 className="animate-spin mr-2 h-4 w-4 text-red-400" />
                          : <XCircle className="mr-2 h-4 w-4 text-red-400 group-hover:text-red-300" />
                        }
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
      </section>
    </div>
  );
};

export default FreeAdminDashboard;
