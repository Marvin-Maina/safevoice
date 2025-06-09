import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  FileText, MessageSquare, PlusCircle, Send, XCircle, Loader2, Info, ArrowLeft,
  Calendar, Hash, User, Shield, AlertCircle, CheckCircle, Clock, Link as LinkIcon, Flag
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

  // Fetch reports submitted by the current user
  const fetchMyReports = useCallback(async () => {
    setLoadingReports(true);
    setErrorReports('');
    try {
      const response = await axios.get('/api/reports/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
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
  }, [navigate]);

  const fetchComments = useCallback(async (reportId) => {
    setLoadingComments(true);
    setErrorComments('');
    try {
      const response = await axios.get(`/api/reports/${reportId}/comments/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setComments(response.data);
    } catch (err) {
      setErrorComments('Failed to load comments. Please try again.');
    } finally {
      setLoadingComments(false);
    }
  }, []);

  const handleSendComment = async () => {
    if (!newComment.trim() || !selectedReport) return;

    setSendingComment(true);
    setErrorComments('');
    try {
      await axios.post(
        `/api/reports/${selectedReport.id}/comments/`,
        { message: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setNewComment('');
      fetchComments(selectedReport.id);
    } catch (err) {
      setErrorComments('Failed to send comment. Please try again.');
    } finally {
      setSendingComment(false);
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

  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString();
  };

  const getStatusStyles = (status) => {
    const styles = {
      pending: 'bg-amber-500/20 text-amber-200 border-amber-500/50',
      under_review: 'bg-blue-500/20 text-blue-200 border-blue-500/50',
      resolved: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/50',
      rejected: 'bg-red-500/20 text-red-200 border-red-500/50',
      default: 'bg-gray-500/20 text-gray-200 border-gray-500/50'
    };
    return styles[status] || styles.default;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-md">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Reports</h1>
            <p className="text-gray-500 mt-2">Track and manage your submitted reports</p>
          </div>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <button
              onClick={() => navigate('/submit-report')}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 shadow-lg"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              New Report
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 shadow-lg"
            >
              <XCircle className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </header>

        {selectedReport ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <button
              onClick={() => setSelectedReport(null)}
              className="flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Reports
            </button>

            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <FileText className="w-8 h-8 mr-3 text-blue-600" />
                  {selectedReport.title}
                </h2>
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusStyles(selectedReport.status)}`}>
                  {selectedReport.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <p className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    Submitted: {formatDateTime(selectedReport.submitted_at)}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <Hash className="w-4 h-4 mr-2 text-gray-400" />
                    Category: {selectedReport.category}
                  </p>
                </div>
                <div className="space-y-2">
                  {selectedReport.priority_flag && (
                    <p className="flex items-center text-red-600">
                      <Flag className="w-4 h-4 mr-2" />
                      Priority Report
                    </p>
                  )}
                  {selectedReport.is_anonymous && (
                    <p className="flex items-center text-gray-500">
                      <Shield className="w-4 h-4 mr-2" />
                      Anonymous Submission
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedReport.description}</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
                  Comments
                </h3>

                <div className="h-96 overflow-y-auto space-y-4 pr-4">
                  {loadingComments ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : comments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No comments yet</p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className={`p-4 rounded-lg ${
                          comment.is_sender_admin
                            ? 'bg-blue-50 border border-blue-200 ml-8'
                            : 'bg-gray-50 border border-gray-200 mr-8'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className={`font-medium ${
                            comment.is_sender_admin ? 'text-blue-600' : 'text-green-600'
                          }`}>
                            {comment.display_sender_name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(comment.sent_at)}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-6">
                  <div className="flex gap-4">
                    <textarea
                      className="flex-1 bg-white border border-gray-300 rounded-lg p-3 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 resize-none"
                      rows="3"
                      placeholder="Type your message..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={sendingComment}
                    />
                    <button
                      onClick={handleSendComment}
                      disabled={!newComment.trim() || sendingComment}
                      className="self-end px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 rounded-lg transition-colors duration-200 flex items-center"
                    >
                      {sendingComment ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errorComments && (
                    <p className="mt-2 text-red-600 text-sm">{errorComments}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {loadingReports ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              </div>
            ) : errorReports ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center text-red-600">
                <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                {errorReports}
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Yet</h3>
                <p className="text-gray-500 mb-6">Start by submitting your first report</p>
                <button
                  onClick={() => navigate('/submit-report')}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 shadow-lg"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Submit a Report
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-blue-200"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">{report.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusStyles(report.status)}`}>
                        {report.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">{report.description}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDateTime(report.submitted_at)}
                      </span>
                      {report.priority_flag && (
                        <span className="flex items-center text-red-600">
                          <Flag className="w-4 h-4 mr-1" />
                          Priority
                        </span>
                      )}
                      {report.is_anonymous && (
                        <span className="flex items-center text-gray-500">
                          <Shield className="w-4 h-4 mr-1" />
                          Anonymous
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReportsPage;