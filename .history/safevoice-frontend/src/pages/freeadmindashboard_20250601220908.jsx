import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Shield, AlertCircle, Loader2, CheckCircle,
  XCircle, Clock, Eye
} from 'lucide-react';

const FreeAdminDashboard = () => {
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
      await axios.put(`/api/admin/reports/${reportId}/`, { status: newStatus }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });
      setReports(prev =>
        prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r)
      );
    } catch (err) {
      console.error(`Failed to update report ${reportId}:`, err);
      setError(`Failed to update report status.`);
    } finally {
      setUpdatingReportId(null);
    }
  };

  const renderStatusBadge = (status) => {
    let bg = 'bg-gray-700', text = 'text-gray-300', Icon = Clock;
    if (status === 'pending') [bg, text, Icon] = ['bg-yellow-900/30', 'text-yellow-400', Clock];
    if (status === 'approved') [bg, text, Icon] = ['bg-green-900/30', 'text-green-400', CheckCircle];
    if (status === 'resolved') [bg, text, Icon] = ['bg-blue-900/30', 'text-blue-400', Eye];
    if (status === 'rejected') [bg, text, Icon] = ['bg-red-900/30', 'text-red-400', XCircle];
    return (
      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${bg} ${text}`}>
        <Icon className="h-4 w-4 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredReports = reports.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedReports = [...filteredReports].sort((a, b) =>
    sortNewest
      ? new Date(b.submitted_at) - new Date(a.submitted_at)
      : new Date(a.submitted_at) - new Date(b.submitted_at)
  );

  const statusCounts = reports.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

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

        {/* 🔍 Filter + Search + Sort */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-2 items-center">
            <label htmlFor="status-filter" className="text-gray-300">Filter:</label>
            <select
              id="status-filter"
              className="bg-[#111327] border border-gray-600 text-white rounded-md p-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search title/description..."
            className="bg-[#111327] border border-gray-600 text-white rounded-md p-2 w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={() => setSortNewest(prev => !prev)}
            className="text-sm text-blue-400 underline"
          >
            Sort by: {sortNewest ? 'Newest First' : 'Oldest First'}
          </button>
        </div>

        {/* 🚦 Status Progress Summary */}
        <div className="flex gap-4 mb-6">
          {['pending', 'approved', 'resolved', 'rejected'].map(status => (
            <div key={status} className="flex items-center space-x-2">
              {renderStatusBadge(status)}
              <span className="text-white text-sm">{statusCounts[status] || 0}</span>
            </div>
          ))}
        </div>

        {sortedReports.length === 0 ? (
          <div className="bg-[#111327] rounded-lg p-6 text-gray-300">
            No reports match your filter or search.
          </div>
        ) : (
          <div className="space-y-4">
            {sortedReports.map((report) => (
              <div key={report.id} className="bg-[#111327] rounded-lg p-6 space-y-4 border border-blue-900/20">
                <div>
                  <h2 className="text-xl font-semibold text-white">{report.title || 'No Title'}</h2>
                  <p className="text-gray-300 mt-2">{report.description || 'No Description'}</p>
                </div>

                {/* 🔍 Expandable details */}
                <button
                  className="text-xs text-blue-400 underline"
                  onClick={() => setExpandedId(expandedId === report.id ? null : report.id)}
                >
                  {expandedId === report.id ? 'Hide details' : 'View details'}
                </button>
                {expandedId === report.id && (
                  <div className="mt-2 text-sm text-gray-400">
                    <p>Location: {report.location || 'N/A'}</p>
                    <p>Category: {report.category || 'N/A'}</p>
                    {/* Add more fields if needed */}
                  </div>
                )}

                <div className="border-t border-blue-900/20 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <p className="text-gray-400 text-sm">
                      Submitted: {new Date(report.submitted_at).toLocaleString()}
                    </p>
                    {renderStatusBadge(report.status)}
                  </div>

                  {/* ✅ Status Change Buttons */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {report.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(report.id, 'approved')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center text-sm disabled:opacity-50"
                          disabled={updatingReportId === report.id}
                        >
                          {updatingReportId === report.id
                            ? <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            : <CheckCircle className="mr-2 h-4 w-4" />}
                          Approve
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
                    {report.status === 'approved' && (
                      <button
                        onClick={() => handleStatusUpdate(report.id, 'resolved')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center text-sm disabled:opacity-50"
                        disabled={updatingReportId === report.id}
                      >
                        {updatingReportId === report.id
                          ? <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          : <Eye className="mr-2 h-4 w-4" />}
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
