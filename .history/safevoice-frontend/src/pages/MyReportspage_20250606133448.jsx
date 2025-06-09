import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  FileText, MessageSquare, PlusCircle, Send, XCircle, Loader2, Info, ArrowLeft,
  Calendar, Hash, Shield, AlertCircle, Clock, Link as LinkIcon, Flag, Trash2, Ban,
  BarChart2, PieChart, Activity, CheckSquare, List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyReportsPage = () => {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [errorReports, setErrorReports] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [errorComments, setErrorComments] = useState('');
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const [actionInProgress, setActionInProgress] = useState(false);

  const [viewMode, setViewMode] = useState('list');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [errorAnalytics, setErrorAnalytics] = useState('');

  // Grab token once, safely
  const token = localStorage.getItem('accessToken');

  const fetchMyReports = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoadingReports(true);
    setErrorReports('');
    try {
      const response = await axios.get('/api/reports/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sortedReports = response.data.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
      setReports(sortedReports);
    } catch (err) {
      console.error('Error fetching user reports:', err);
      setErrorReports('Failed to fetch your reports. Please try again.');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoadingReports(false);
    }
  }, [navigate, token]);

  const fetchAnalytics = useCallback(async () => {
    if (!token) return;
    setLoadingAnalytics(true);
    setErrorAnalytics('');
    setAnalyticsData(null);
    try {
      const response = await axios.get('/api/reports/reports/user-analytics/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalyticsData(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setErrorAnalytics('Could not load analytics data. Please try again later.');
    } finally {
      setLoadingAnalytics(false);
    }
  }, [token]);

  const fetchComments = useCallback(async (reportId) => {
    if (!token) return;
    setLoadingComments(true);
    setErrorComments('');
    try {
      const response = await axios.get(`/api/reports/${reportId}/comments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComments(response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setErrorComments('Failed to load comments. Please try again.');
    } finally {
      setLoadingComments(false);
    }
  }, [token]);

  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedReport || !token) return;
    setSendingComment(true);
    setErrorComments('');
    try {
      await axios.post(
        `/api/reports/${selectedReport.id}/comments/`,
        { message: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewComment('');
      fetchComments(selectedReport.id);
    } catch (err) {
      console.error('Error sending comment:', err);
      setErrorComments('Failed to send comment. Please try again.');
    } finally {
      setSendingComment(false);
    }
  };

  const handleCancelReport = async () => {
    if (!selectedReport || actionInProgress || !token) return;
    setActionInProgress(true);
    try {
      await axios.post(
        `/api/reports/${selectedReport.id}/cancel/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedReport(prev => ({ ...prev, status: 'cancelled' }));
      setReports(prevReports =>
        prevReports.map(r => r.id === selectedReport.id ? { ...r, status: 'cancelled' } : r)
      );
    } catch (err) {
      console.error('Error cancelling report:', err);
      alert('Failed to cancel the report. Please try again.');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport || actionInProgress || !token) return;
    if (!window.confirm("Are you sure you want to permanently delete this report? This action cannot be undone.")) {
      return;
    }
    setActionInProgress(true);
    try {
      await axios.delete(`/api/reports/${selectedReport.id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleBackToReports();
      setReports(prevReports => prevReports.filter(r => r.id !== selectedReport.id));
    } catch (err) {
      console.error('Error deleting report:', err);
      alert(err.response?.data?.error || 'Failed to delete the report. Please try again.');
    } finally {
      setActionInProgress(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  useEffect(() => {
    if (selectedReport) {
      fetchComments(selectedReport.id);
    } else {
      setComments([]);
    }
  }, [selectedReport, fetchComments]);

  const handleBackToReports = () => setSelectedReport(null);

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString();
  };

  const toTitleCase = (str) =>
    str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) =>
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );

  const canCancel = selectedReport && !['cancelled', 'resolved', 'rejected'].includes(selectedReport.status);
  const canDelete = selectedReport && selectedReport.status !== 'resolved';

  const handleSwitchToAnalytics = () => {
    fetchAnalytics();
    setViewMode('analytics');
  };

  // Your renderContent remains unchanged, no styling changed

  return (
    <div>
      {/* Add your UI from original here unchanged */}
      {renderContent()}
    </div>
  );
};

export default MyReportsPage;
