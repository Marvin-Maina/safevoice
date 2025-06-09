You said:
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
  // State for reports list and detail view
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [errorReports, setErrorReports] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  
  // State for comments
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [errorComments, setErrorComments] = useState('');
  const [newComment, setNewComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  // State for report actions
  const [actionInProgress, setActionInProgress] = useState(false);

  // State for Analytics View
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'analytics'
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [errorAnalytics, setErrorAnalytics] = useState('');


  // Fetch reports submitted by the current user
  const fetchMyReports = useCallback(async () => {
    setLoadingReports(true);
    setErrorReports('');
    try {
      const response = await axios.get('/api/reports/reports/', {
        headers: {
          Authorization: Bearer ${localStorage.getItem('accessToken')},
        },
      });
      const reportsArray = response.data.results || response.data;
      if (Array.isArray(reportsArray)) {
        const sortedReports = reportsArray.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
        setReports(sortedReports);
      } else {
        console.error("API response is not an array:", response.data);
        setErrorReports('Received an unexpected data format from the server.');
      }
    } catch (err) {
      console.error('Error fetching user reports:', err);
      setErrorReports('Failed to fetch your reports. Please try again.');
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoadingReports(false);
    }
  }, [navigate]);

  // Fetch user-specific analytics
  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    setErrorAnalytics('');
    setAnalyticsData(null);
    try {
      const response = await axios.get('/reports/user-analytics/', {
  headers: {
    Authorization: Bearer ${localStorage.getItem('accessToken')},
  },
});
      setAnalyticsData(response.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setErrorAnalytics('Could not load analytics data. Please try again later.');
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  const handleSwitchToAnalytics = () => {
    fetchAnalytics();
    setViewMode('analytics');
  };

  // Fetch comments for a specific report
  const fetchComments = useCallback(async (reportId) => {
    setLoadingComments(true);
    setErrorComments('');
    try {
      const response = await axios.get(/api/reports/${reportId}/comments/, {
        headers: {
          Authorization: Bearer ${localStorage.getItem('accessToken')},
        },
      });
      setComments(response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setErrorComments('Failed to load comments. Please try again.');
    } finally {
      setLoadingComments(false);
    }
  }, []);

  // Handle sending a new comment
  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedReport) return;
    setSendingComment(true);
    setErrorComments('');
    try {
      await axios.post(
        /api/reports/${selectedReport.id}/comments/,
        { message: newComment },
        {
          headers: {
            Authorization: Bearer ${localStorage.getItem('accessToken')},
          },
        }
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
    if (!selectedReport || actionInProgress) return;
    
    setActionInProgress(true);
    try {
      await axios.post(
        /api/reports/${selectedReport.id}/cancel/, {},
        { headers: { Authorization: Bearer ${localStorage.getItem('accessToken')} } }
      );
      setSelectedReport(prev => ({ ...prev, status: 'cancelled' }));
      setReports(prevReports => prevReports.map(r => r.id === selectedReport.id ? { ...r, status: 'cancelled' } : r));
    } catch (err) {
      console.error('Error cancelling report:', err);
      alert('Failed to cancel the report. Please try again.');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport || actionInProgress) return;
    
    if (!window.confirm("Are you sure you want to permanently delete this report? This action cannot be undone.")) {
      return;
    }

    setActionInProgress(true);
    try {
      await axios.delete(/api/reports/${selectedReport.id}/, {
        headers: { Authorization: Bearer ${localStorage.getItem('accessToken')} },
      });
      handleBackToReports();
      setReports(prevReports => prevReports.filter(r => r.id !== selectedReport.id));
    } catch (err) {
      console.error('Error deleting report:', err);
      const errorMessage = err.response?.data?.error || 'Failed to delete the report. Please try again.';
      alert(errorMessage);
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

  const handleBackToReports = () => {
    setSelectedReport(null);
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString();
  };

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }

  const canCancel = selectedReport && !['cancelled', 'resolved', 'rejected'].includes(selectedReport.status);
  const canDelete = selectedReport && selectedReport.status !== 'resolved';

  // Main Render Logic
  const renderContent = () => {
    // Analytics View
    if (viewMode === 'analytics') {
      return (
        <div className="max-w-4xl mx-auto bg-gray-800/90 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-gray-700">
          <button
            onClick={() => setViewMode('list')}
            className="mb-6 flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to My Reports
          </button>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center"><BarChart2 className="mr-3 h-7 w-7 text-green-400" /> My Analytics</h2>
          
          {loadingAnalytics && (
            <div className="text-center py-8"><Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto" /><p className="mt-4 text-lg text-blue-300">Loading analytics...</p></div>
          )}

          {errorAnalytics && (
            <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg text-center flex items-center justify-center"><AlertCircle className="h-5 w-5 mr-2" /> {errorAnalytics}</div>
          )}

          {analyticsData && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 flex items-center gap-4">
                <List className="h-10 w-10 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Total Reports</p>
                  <p className="text-3xl font-bold text-white">{analyticsData.total_reports}</p>
                </div>
              </div>
              <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 flex items-center gap-4">
                <Flag className="h-10 w-10 text-red-400" />
                <div>
                  <p className="text-gray-400 text-sm">Priority Reports</p>
                  <p className="text-3xl font-bold text-white">{analyticsData.priority_count}</p>
                </div>
              </div>

              <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center"><CheckSquare className="h-6 w-6 mr-2 text-purple-400" />Reports by Status</h3>
                <ul className="space-y-2 text-gray-300">
                  {(analyticsData.status_counts || []).map(item => (
                    <li key={item.status} className="flex justify-between items-center">
                      <span>{toTitleCase(item.status)}</span>
                      <span className="font-bold bg-gray-700 px-2 py-0.5 rounded-md">{item.count}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                <h3 className="text-xl font-semibold mb-4 flex items-center"><PieChart className="h-6 w-6 mr-2 text-yellow-400" />Reports by Category</h3>
                <ul className="space-y-2 text-gray-300">
                  {(analyticsData.category_counts || []).map(item => (
                    <li key={item.category} className="flex justify-between items-center">
                      <span>{toTitleCase(item.category)}</span>
                      <span className="font-bold bg-gray-700 px-2 py-0.5 rounded-md">{item.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Report Detail View
    if (selectedReport) {
      return (
        <div className="max-w-4xl mx-auto bg-gray-800/90 backdrop-blur-sm p-8 rounded-lg shadow-xl border border-gray-700">
            <button onClick={handleBackToReports} className="mb-6 flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200">
              <ArrowLeft className="h-5 w-5 mr-2" /> Back to My Reports
            </button>
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center"><FileText className="mr-3 h-7 w-7 text-green-400" /> {selectedReport.title}</h2>
            <div className="text-gray-400 text-sm mb-6 space-y-1">
               <p className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> Submitted: {formatDateTime(selectedReport.submitted_at)}</p>
              <p className="flex items-center"><Hash className="h-4 w-4 mr-2" /> Category: {selectedReport.category}</p>
              <p className="flex items-center"><Info className="h-4 w-4 mr-2" /> Status: <span className={px-2 py-0.5 ml-1 rounded-full text-xs font-semibold ${selectedReport.status === 'pending' ? 'bg-yellow-800 text-yellow-200' : selectedReport.status === 'under_review' ? 'bg-blue-800 text-blue-200' : selectedReport.status === 'resolved' ? 'bg-green-800 text-green-200' : selectedReport.status === 'cancelled' ? 'bg-gray-700 text-gray-300' : selectedReport.status === 'rejected' ? 'bg-red-800 text-red-200' : 'bg-gray-700 text-gray-300'}}>{toTitleCase(selectedReport.status)}</span></p>
              {selectedReport.priority_flag && <p className="flex items-center text-red-400 font-semibold"><Flag className="h-4 w-4 mr-2" /> Priority Report</p>}
              {selectedReport.is_anonymous && <p className="flex items-center text-gray-500 italic"><Shield className="h-4 w-4 mr-2" /> Submitted Anonymously</p>}
              {selectedReport.file_upload && <p className="flex items-center"><LinkIcon className="h-4 w-4 mr-2" /> Attachment: <a href={selectedReport.file_upload} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">View File</a></p>}
            </div>
            <p className="text-gray-300 mb-6">{selectedReport.description}</p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button onClick={handleCancelReport} disabled={!canCancel || actionInProgress} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-yellow-600 rounded-lg shadow-md hover:bg-yellow-700 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed">{actionInProgress && canCancel ? <Loader2 className="h-5 w-5 animate-spin" /> : <Ban className="h-5 w-5" />} Cancel Report</button>
              <button onClick={handleDeleteReport} disabled={!canDelete || actionInProgress} className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-700 rounded-lg shadow-md hover:bg-red-800 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed">{actionInProgress && canDelete ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />} Delete Report</button>
            </div>
            <hr className="border-gray-700 my-6" />
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center"><MessageSquare className="mr-3 h-6 w-6 text-purple-400" /> Conversation</h3>
            <div className="space-y-4 h-96 overflow-y-auto pr-2 custom-scrollbar border border-gray-700 rounded-lg p-4 bg-gray-900/50 backdrop-blur-sm">
              {loadingComments ? (<div className="text-center py-4"><Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto" /><p className="mt-2 text-blue-300">Loading messages...</p></div>) : errorComments ? (<div className="bg-red-900/20 border border-red-700 text-red-300 p-3 rounded-lg text-center flex items-center justify-center"><AlertCircle className="h-5 w-5 mr-2" /> {errorComments}</div>) : comments.length === 0 ? (<div className="text-gray-400 text-center py-4">No messages yet.</div>) : (comments.map((comment) => (<div key={comment.id} className={p-3 rounded-lg shadow-md ${comment.is_sender_admin ? 'bg-blue-900/40 border border-blue-700 self-start' : 'bg-gray-700/40 border border-gray-600 self-end'}}><div className="flex items-center justify-between text-sm mb-1"><span className={font-semibold ${comment.is_sender_admin ? 'text-blue-300' : 'text-green-300'}}>{comment.display_sender_name}</span><span className="text-gray-400">{formatDateTime(comment.sent_at)}</span></div><p className="text-gray-200">{comment.message}</p></div>)))}
            </div>
            <div className="mt-6 flex items-center gap-3">
              <textarea className="flex-grow p-3 rounded-lg bg-gray-700/80 backdrop-blur-sm border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none" rows="2" placeholder="Type your message here..." value={newComment} onChange={(e) => setNewComment(e.target.value)} disabled={sendingComment}></textarea>
              <button onClick={handleSendComment} className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-md flex-shrink-0" disabled={!newComment.trim() || sendingComment}>{sendingComment ? <Loader2 className="animate-spin h-6 w-6" /> : <Send className="h-6 w-6" />}</button>
            </div>
            {errorComments && <p className="text-red-400 text-sm mt-2">{errorComments}</p>}
        </div>
      );
    }

    // Reports List View (Default)
    return (
      <div className="max-w-4xl mx-auto">
        {loadingReports ? (
          <div className="text-center py-8"><Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto" /><p className="mt-4 text-lg text-blue-300">Loading your reports...</p></div>
        ) : errorReports ? (
          <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg text-center flex items-center justify-center"><AlertCircle className="h-5 w-5 mr-2" /> {errorReports}</div>
        ) : reports.length === 0 ? (
          <div className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg text-center text-gray-400">
            You haven't submitted any reports yet.
            <button onClick={() => navigate('/submit-report')} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md flex items-center mx-auto"><PlusCircle className="h-5 w-5 mr-2" /> Submit a New Report</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-right">
              <button onClick={handleSwitchToAnalytics} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md flex items-center ml-auto">
                <BarChart2 className="h-5 w-5 mr-2" /> View My Analytics
              </button>
            </div>
            {reports.map((report) => (
              <div key={report.id} className="bg-gray-800/90 backdrop-blur-sm p-6 rounded-lg shadow-xl border border-gray-700 cursor-pointer hover:border-blue-500 transition-all duration-200" onClick={() => setSelectedReport(report)}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-400">{report.title}</h3>
                    <p className="text-sm text-gray-400 flex items-center mt-1"><Clock className="h-4 w-4 mr-1" /> Submitted: {formatDateTime(report.submitted_at)}</p>
                  </div>
                  <div className={px-3 py-1 rounded-full text-sm font-semibold ${report.status === 'pending' ? 'bg-yellow-800 text-yellow-200' : report.status === 'under_review' ? 'bg-blue-800 text-blue-200' : report.status === 'resolved' ? 'bg-green-800 text-green-200' : report.status === 'cancelled' ? 'bg-gray-700 text-gray-300' : report.status === 'rejected' ? 'bg-red-800 text-red-200' : 'bg-gray-700 text-gray-300'}}>{toTitleCase(report.status)}</div>
                </div>
                <p className="text-gray-300 mb-4 line-clamp-2">{report.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center"><span className="font-semibold text-gray-300 mr-1">Category:</span> {report.category}</span>
                  <span className="flex items-center"><span className="font-semibold text-gray-300 mr-1">Submitted By:</span>{report.is_anonymous ? <span className="flex items-center text-gray-500 italic"><Shield className="h-4 w-4 mr-1" /> Anonymous</span> : (report.submitted_by_username || 'N/A')}</span>
                  {report.priority_flag && <span className="flex items-center text-red-400 font-semibold"><Flag className="h-4 w-4 mr-1" /> Priority</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6 font-inter relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse animation-duration-7000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl animate-pulse animation-delay-2000 animation-duration-8000"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" aria-hidden="true"></div>
      <div className="relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-4 sm:mb-0">My Reports</h1>
          <button onClick={() => navigate('/login')} className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg">Logout</button>
        </header>
        {renderContent()}
      </div>
    </div>
  );
};

export default MyReportsPage; 