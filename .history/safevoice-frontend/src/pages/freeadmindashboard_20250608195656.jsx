import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Shield, AlertCircle, Loader2, CheckCircle,
  XCircle, Clock, Eye, MessageSquare, FileText, Link, Info, BarChart2, Users, Flag,
  Filter, Search, TrendingUp, Activity, Zap, Star, Award, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const FreeAdminDashboard = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortNewest, setSortNewest] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingReportId, setUpdatingReportId] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const uniqueCategories = [...new Set(reports.map(report => report.category))];

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
    .filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'all' || report.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const dateA = new Date(a.submitted_at);
      const dateB = new Date(b.submitted_at);
      return sortNewest ? dateB - dateA : dateA - dateB;
    });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30 text-yellow-300';
      case 'under_review': return 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-300';
      case 'resolved': return 'from-green-500/20 to-green-600/10 border-green-500/30 text-green-300';
      case 'escalated': return 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-300';
      case 'rejected': return 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-300';
      default: return 'from-gray-500/20 to-gray-600/10 border-gray-500/30 text-gray-300';
    }
  };

  const categoryData = Object.entries(
    reports.reduce((acc, report) => {
      acc[report.category] = (acc[report.category] || 0) + 1;
      return acc;
    }, {})
  ).map(([category, count]) => ({ name: category, value: count }));

  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1', '#d0ed57', '#a4de6c'];

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Analytics + Category Pie Chart */}
      <div className="p-6 sm:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Analytics Overview */}
            <div className="p-6 bg-gray-800/60 rounded-3xl border border-blue-600/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <BarChart2 className="h-6 w-6 text-blue-400" /> Analytics Overview
              </h2>
              {analyticsLoading ? (
                <p className="text-gray-400">Loading...</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 text-sm text-white">
                  <div>Total: {analytics?.total_reports || 0}</div>
                  <div>Pending: {analytics?.reports_by_status?.pending || 0}</div>
                  <div>Review: {analytics?.reports_by_status?.under_review || 0}</div>
                  <div>Resolved: {analytics?.reports_by_status?.resolved || 0}</div>
                  <div>Rejected: {analytics?.reports_by_status?.rejected || 0}</div>
                  <div>Escalated: {analytics?.reports_by_status?.escalated || 0}</div>
                </div>
              )}
            </div>

            {/* Category Pie Chart */}
            <div className="p-6 bg-gray-800/60 rounded-3xl border border-purple-600/30">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <PieChart className="h-6 w-6 text-purple-400" /> Categories
              </h2>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-400 text-center">No data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeAdminDashboard;
