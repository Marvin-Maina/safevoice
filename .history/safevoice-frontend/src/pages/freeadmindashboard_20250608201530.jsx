import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Shield, AlertCircle, Loader2, CheckCircle,
  XCircle, Clock, Eye, MessageSquare, FileText, Link, Info, BarChart2, Users, Flag,
  Filter, Search, TrendingUp, Activity, Zap, Star, Award, Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Tooltip, Legend, Cell, ResponsiveContainer } from 'recharts'; // Added ResponsiveContainer

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

  // Get unique categories from reports
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
      case 'rejected': return 'from-red-500/20 to-red-600/10 border-red-500/30 text-red-300';
      default: return 'from-gray-500/20 to-gray-600/10 border-gray-500/30 text-gray-300';
    }
  };

  // Prepare data for the category pie chart
  const getCategoryChartData = () => {
    const categoryCounts = {};
    reports.forEach(report => {
      categoryCounts[report.category] = (categoryCounts[report.category] || 0) + 1;
    });
    return Object.keys(categoryCounts).map(category => ({
      name: category,
      value: categoryCounts[category],
    }));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF194F', '#19FFED', '#FFA119'];

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Elements (from HeroSection) */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse animation-duration-7000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl animate-pulse animation-delay-2000 animation-duration-8000"></div>
      
      {/* Background gradient effect (from HeroSection) */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" aria-hidden="true"></div>

      <div className="relative z-10 p-6 sm:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight mb-6 flex items-center justify-center gap-4">
              <Shield className="h-16 w-16 text-blue-400 drop-shadow-2xl" />
              <span className="bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent">Admin Command Center</span>
            </h1>
            <p className="text-xl text-gray-300 font-light">Real-time monitoring and management dashboard</p>
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-500/20 to-red-600/10 text-red-300 p-6 rounded-2xl mb-8 flex items-center gap-3 border border-red-500/30 backdrop-blur-sm">
              <AlertCircle className="h-6 w-6 animate-pulse" />
              <span className="text-lg">{error}</span>
            </div>
          )}

          {/* Analytics Dashboard */}
          <div className="mb-12 p-8 bg-gray-800/60 rounded-3xl shadow-2xl border border-blue-600/30 backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-600/5 rounded-3xl"></div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-300 bg-clip-text text-transparent mb-8 flex items-center gap-4">
                <BarChart2 className="h-8 w-8 text-blue-400" />
                Analytics Overview
                <TrendingUp className="h-6 w-6 text-green-400 ml-auto" />
              </h2>
              
              {analyticsLoading ? (
                <div className="flex justify-center items-center h-32">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
                  <p className="ml-4 text-xl text-gray-300">Analyzing data...</p>
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Reports */}
                  <div className="bg-gray-700/60 p-6 rounded-2xl border border-gray-600/30 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <Activity className="h-8 w-8 text-white/80 group-hover:text-white transition-colors" />
                      <span className="text-4xl font-bold text-white">{analytics.total_reports}</span>
                    </div>
                    <p className="text-gray-300 font-medium">Total Reports</p>
                  </div>

                  {/* Pending */}
                  <div className="bg-yellow-500/20 p-6 rounded-2xl border border-yellow-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <Clock className="h-8 w-8 text-yellow-300 group-hover:text-yellow-200 transition-colors" />
                      <span className="text-4xl font-bold text-yellow-300">{analytics.reports_by_status.pending || 0}</span>
                    </div>
                    <p className="text-yellow-200 font-medium">Pending Review</p>
                  </div>

                  {/* Under Review */}
                  <div className="bg-blue-500/20 p-6 rounded-2xl border border-blue-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <Eye className="h-8 w-8 text-blue-300 group-hover:text-blue-200 transition-colors" />
                      <span className="text-4xl font-bold text-blue-300">{analytics.reports_by_status.under_review || 0}</span>
                    </div>
                    <p className="text-blue-200 font-medium">Under Review</p>
                  </div>

                  {/* Resolved */}
                  <div className="bg-green-500/20 p-6 rounded-2xl border border-green-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <CheckCircle className="h-8 w-8 text-green-300 group-hover:text-green-200 transition-colors" />
                      <span className="text-4xl font-bold text-green-300">{analytics.reports_by_status.resolved || 0}</span>
                    </div>
                    <p className="text-green-200 font-medium">Resolved</p>
                  </div>

                  {/* Rejected */}
                  <div className="bg-red-500/20 p-6 rounded-2xl border border-red-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <XCircle className="h-8 w-8 text-red-300 group-hover:text-red-200 transition-colors" />
                      <span className="text-4xl font-bold text-red-300">{analytics.reports_by_status.rejected || 0}</span>
                    </div>
                    <p className="text-red-200 font-medium">Rejected</p>
                  </div>

                  {/* Escalated */}
                  <div className="bg-orange-500/20 p-6 rounded-2xl border border-orange-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <Zap className="h-8 w-8 text-orange-300 group-hover:text-orange-200 transition-colors" />
                      <span className="text-4xl font-bold text-orange-300">{analytics.reports_by_status.escalated || 0}</span>
                    </div>
                    <p className="text-orange-200 font-medium">Escalated</p>
                  </div>

                  {/* Priority Reports */}
                  <div className="bg-red-500/20 p-6 rounded-2xl border border-red-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <Flag className="h-8 w-8 text-red-300 group-hover:text-red-200 transition-colors" />
                      <span className="text-4xl font-bold text-red-300">{analytics.priority_reports_count || 0}</span>
                    </div>
                    <p className="text-red-200 font-medium">Priority Reports</p>
                  </div>

                  {/* Anonymous Reports */}
                  <div className="bg-purple-500/20 p-6 rounded-2xl border border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-3">
                      <Users className="h-8 w-8 text-purple-300 group-hover:text-purple-200 transition-colors" />
                      <span className="text-4xl font-bold text-purple-300">{analytics.anonymous_vs_identified_reports?.[true] || 0}</span>
                    </div>
                    <p className="text-purple-200 font-medium">Anonymous Reports</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-gray-400 text-lg">Analytics data unavailable</p>
              )}

              {/* Category Distribution Pie Chart */}
              <div className="mt-8 p-6 bg-gray-700/60 rounded-2xl border border-gray-600/30 backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-400" /> Report Categories Distribution
                </h3>
                {reports.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getCategoryChartData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        isAnimationActive={true} // Enabled animation
                        animationBegin={800}    // Animation starts after 800ms
                        animationDuration={1000} // Animation lasts 1000ms
                        animateNewValues={true} // Animate changes in data
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getCategoryChartData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(55, 65, 81, 0.9)', 
                          border: 'none', 
                          borderRadius: '8px', 
                          color: 'white' 
                        }} 
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }} 
                        formatter={(value) => <span style={{ color: '#E0E0E0' }}>{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-400">No reports to display category distribution.</p>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Filters and Search */}
          <div className="mb-8 p-6 bg-gray-800/60 rounded-2xl border border-gray-600/30 backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-grow relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports by title, description, or category..."
                  className="w-full bg-gray-700/50 border border-gray-600/50 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Category Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  className="bg-gray-700/50 border border-gray-600/50 rounded-xl pl-12 pr-8 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none min-w-[200px] backdrop-blur-sm"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <select
                className="bg-gray-700/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-[180px] backdrop-blur-sm"
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

              {/* Sort Button */}
              <button
                onClick={() => setSortNewest(!sortNewest)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-medium border border-blue-500/30 backdrop-blur-sm hover:scale-105 hover:bg-blue-700"
              >
                <Clock className="h-5 w-5" />
                {sortNewest ? 'Newest First' : 'Oldest First'}
              </button>
            </div>
          </div>

          {/* Reports Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-blue-400" />
                <div className="absolute inset-0 h-16 w-16 border-4 border-blue-400/20 rounded-full animate-ping"></div>
              </div>
              <p className="ml-6 text-2xl text-gray-300">Loading reports...</p>
            </div>
          ) : sortedAndFilteredReports.length === 0 ? (
            <div className="text-center py-16">
              <Target className="h-24 w-24 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-xl">No reports found matching your criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {sortedAndFilteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-gray-800/60 rounded-2xl shadow-2xl border border-gray-700/30 hover:border-blue-500/50 transition-all duration-300 flex flex-col backdrop-blur-xl hover:scale-[1.02] group"
                >
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors truncate pr-2">
                        {report.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r border backdrop-blur-sm ${getStatusColor(report.status)}`}>
                        {report.status.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Award className="h-4 w-4 text-blue-400" />
                        <span className="font-medium">Category:</span>
                        <span className="text-blue-300">{report.category}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-300">
                        <Clock className="h-4 w-4 text-green-400" />
                        <span className="font-medium">Submitted:</span>
                        <span>{new Date(report.submitted_at).toLocaleString()}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-3">
                        {report.is_anonymous && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg text-xs border border-yellow-500/30">
                            <Info className="h-3 w-3" /> Anonymous
                          </span>
                        )}
                        {report.priority_flag && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-300 rounded-lg text-xs border border-red-500/30">
                            <Flag className="h-3 w-3" /> Priority
                          </span>
                        )}
                        {report.is_premium_report && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs border border-purple-500/30">
                            <Star className="h-3 w-3" /> Premium
                          </span>
                        )}
                      </div>

                      {expandedId === report.id && (
                        <div className="mt-4 pt-4 border-t border-gray-600/50 space-y-3">
                          <div>
                            <span className="font-semibold text-white block mb-2">Description:</span>
                            <p className="text-gray-300 leading-relaxed">{report.description}</p>
                          </div>

                          {report.file_upload && (
                            <div className="flex items-center gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                              <Link className="h-4 w-4 text-blue-400" />
                              <a 
                                href={report.file_upload} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-blue-400 hover:text-blue-300 font-medium hover:underline"
                              >
                                View Attachment
                              </a>
                            </div>
                          )}

                          {report.request_type === 'organization' && (
                            <div className="p-3 bg-gray-700/30 rounded-lg border border-gray-600/30">
                              <h4 className="font-semibold text-white mb-2">Organization Details:</h4>
                              <div className="space-y-1 text-xs text-gray-300">
                                <p><span className="font-medium">Name:</span> {report.organization_name}</p>
                                <p><span className="font-medium">Type:</span> {report.organization_type}</p>
                                <p><span className="font-medium">Justification:</span> {report.justification}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="p-4 bg-gray-800/60 border-t border-gray-700/30 flex flex-wrap gap-2">
                    <button
                      onClick={() => toggleExpand(report.id)}
                      className="flex-1 bg-gray-700/80 hover:bg-blue-600/60 text-white px-3 py-2 rounded-lg flex items-center justify-center text-sm transition-all duration-300 border border-gray-600/30 hover:border-blue-500/50 backdrop-blur-sm"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {expandedId === report.id ? 'Less' : 'Details'}
                    </button>

                    <button
                      onClick={() => handleViewDetails(report.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center justify-center text-sm transition-all duration-300 border border-blue-500/30 backdrop-blur-sm"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Manage
                    </button>

                    {report.status !== 'resolved' && report.status !== 'rejected' && (
                      <div className="w-full flex gap-2 mt-2">
                        <button
                          onClick={() => handleStatusUpdate(report.id, 'under_review')}
                          className="flex-1 bg-blue-600/60 hover:bg-blue-700/60 text-blue-200 px-3 py-2 rounded-lg flex items-center justify-center text-sm disabled:opacity-50 transition-all duration-300 border border-blue-500/30 backdrop-blur-sm"
                          disabled={updatingReportId === report.id || report.status === 'under_review'}
                        >
                          {updatingReportId === report.id ? (
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          ) : (
                            <Eye className="mr-2 h-4 w-4" />
                          )}
                          Review
                        </button>
                        
                        <button
                          onClick={() => handleStatusUpdate(report.id, 'resolved')}
                          className="flex-1 bg-green-600/60 hover:bg-green-700/60 text-green-200 px-3 py-2 rounded-lg flex items-center justify-center text-sm disabled:opacity-50 transition-all duration-300 border border-green-500/30 backdrop-blur-sm"
                          disabled={updatingReportId === report.id}
                        >
                          {updatingReportId === report.id ? (
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          Resolve
                        </button>
                        
                        <button
                          onClick={() => handleStatusUpdate(report.id, 'rejected')}
                          className="flex-1 bg-red-600/60 hover:bg-red-700/60 text-red-200 px-3 py-2 rounded-lg flex items-center justify-center text-sm disabled:opacity-50 transition-all duration-300 border border-red-500/30 backdrop-blur-sm"
                          disabled={updatingReportId === report.id}
                        >
                          {updatingReportId === report.id ? (
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          ) : (
                            <XCircle className="mr-2 h-4 w-4" />
                          )}
                          Reject
                        </button>
                      </div>
                    )}

                    {(report.status === 'resolved' || report.status === 'rejected') && (
                      <div className="w-full mt-2">
                        <span className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                          report.status === 'resolved' 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {report.status === 'resolved' ? (
                            <><CheckCircle className="h-4 w-4" /> Resolved</>
                          ) : (
                            <><XCircle className="h-4 w-4" /> Rejected</>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreeAdminDashboard;