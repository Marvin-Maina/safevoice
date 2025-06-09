import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  FileText, MessageSquare, PlusCircle, Send, XCircle, Loader2, Info, ArrowLeft,
  Calendar, Hash, User, Shield, AlertCircle, CheckCircle, Clock, Link as LinkIcon
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
      // The ReportViewSet's get_queryset should filter by submitted_by=request.user automatically for non-admins.
      const response = await axios.get('/api/reports/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      // Sort reports by newest first
      const sortedReports = response.data.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
      setReports(sortedReports);
    } catch (err) {
      console.error('Error fetching user reports:', err);
      setErrorReports('Failed to fetch your reports. Please try again.');
      if (err.response && err.response.status === 401) {
        navigate('/login'); // Redirect to login if token is invalid
      }
    } finally {
      setLoadingReports(false);
    }
  }, [navigate]);

  // Fetch comments for a specific report
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
        `/api/reports/${selectedReport.id}/comments/`,
        { message: newComment },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      setNewComment(''); // Clear input
      fetchComments(selectedReport.id); // Refresh comments list
    } catch (err) {
      console.error('Error sending comment:', err);
      setErrorComments('Failed to send comment. Please try again.');
    } finally {
      setSendingComment(false);
    }
  };

  useEffect(() => {
    fetchMyReports();
  }, [fetchMyReports]);

  // When a report is selected, fetch its comments
  useEffect(() => {
    if (selectedReport) {
      fetchComments(selectedReport.id);
    } else {
      setComments([]); // Clear comments if no report is selected
    }
  }, [selectedReport, fetchComments]);

  // Function to navigate back to the reports list
  const handleBackToReports = () => {
    setSelectedReport(null);
  };

  // Helper to format date and time
  const formatDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 p-6 font-inter">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-white mb-4 sm:mb-0">My Reports</h1>
        <button
          onClick={() => navigate('/login')} // Assuming /login is your logout/login page
          className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
        >
          Logout
        </button>
      </header>

      {selectedReport ? (
        // Report Detail and Messaging View
        <div className="max-w-4xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
          <button
            onClick={handleBackToReports}
            className="mb-6 flex items-center text-blue-400 hover:text-blue-300 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to My Reports
          </button>

          <h2 className="text-3xl font-bold text-white mb-4 flex items-center">
            <FileText className="mr-3 h-7 w-7 text-green-400" /> {selectedReport.title}
          </h2>
          <div className="text-gray-400 text-sm mb-6 space-y-1">
            <p className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> Submitted: {formatDateTime(selectedReport.submitted_at)}</p>
            <p className="flex items-center"><Hash className="h-4 w-4 mr-2" /> Category: {selectedReport.category}</p>
            <p className="flex items-center">
              <Info className="h-4 w-4 mr-2" /> Status: <span className={`px-2 py-0.5 ml-1 rounded-full text-xs font-semibold ${
                selectedReport.status === 'pending' ? 'bg-yellow-800 text-yellow-200' :
                selectedReport.status === 'under_review' ? 'bg-blue-800 text-blue-200' :
                selectedReport.status === 'resolved' ? 'bg-green-800 text-green-200' :
                selectedReport.status === 'rejected' ? 'bg-red-800 text-red-200' :
                'bg-gray-700 text-gray-300'
              }`}>
                {selectedReport.status.replace('_', ' ').charAt(0).toUpperCase() + selectedReport.status.replace('_', ' ').slice(1)}
              </span>
            </p>
            {selectedReport.priority_flag && (
              <p className="flex items-center text-red-400 font-semibold"><Flag className="h-4 w-4 mr-2" /> Priority Report</p>
            )}
            {selectedReport.is_anonymous && (
              <p className="flex items-center text-gray-500 italic"><Shield className="h-4 w-4 mr-2" /> Submitted Anonymously</p>
            )}
            {selectedReport.file_upload && (
              <p className="flex items-center">
                <LinkIcon className="h-4 w-4 mr-2" /> Attachment:
                <a href={selectedReport.file_upload} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">
                  View File
                </a>
              </p>
            )}
          </div>
          <p className="text-gray-300 mb-6">{selectedReport.description}</p>

          <hr className="border-gray-700 my-6" />

          {/* Comments Section */}
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <MessageSquare className="mr-3 h-6 w-6 text-purple-400" /> Conversation
          </h3>
          <div className="space-y-4 h-96 overflow-y-auto pr-2 custom-scrollbar border border-gray-700 rounded-lg p-4 bg-gray-900/50">
            {loadingComments ? (
              <div className="text-center py-4">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500 mx-auto" />
                <p className="mt-2 text-blue-300">Loading messages...</p>
              </div>
            ) : errorComments ? (
              <div className="bg-red-900/20 border border-red-700 text-red-300 p-3 rounded-lg text-center flex items-center justify-center">
                <AlertCircle className="h-5 w-5 mr-2" /> {errorComments}
              </div>
            ) : comments.length === 0 ? (
              <div className="text-gray-400 text-center py-4">No messages yet.</div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className={`p-3 rounded-lg shadow-md ${
                  comment.is_sender_admin ? 'bg-blue-900/40 border border-blue-700 self-start' : 'bg-gray-700/40 border border-gray-600 self-end'
                }`}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className={`font-semibold ${comment.is_sender_admin ? 'text-blue-300' : 'text-green-300'}`}>
                      {comment.display_sender_name}
                    </span>
                    <span className="text-gray-400">{formatDateTime(comment.sent_at)}</span>
                  </div>
                  <p className="text-gray-200">{comment.message}</p>
                </div>
              ))
            )}
          </div>

          {/* New Comment Input */}
          <div className="mt-6 flex items-center gap-3">
            <textarea
              className="flex-grow p-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              rows="2"
              placeholder="Type your message here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={sendingComment}
            ></textarea>
            <button
              onClick={handleSendComment}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-full transition duration-300 ease-in-out transform hover:scale-105 shadow-md flex-shrink-0"
              disabled={!newComment.trim() || sendingComment}
            >
              {sendingComment ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : (
                <Send className="h-6 w-6" />
              )}
            </button>
          </div>
          {errorComments && <p className="text-red-400 text-sm mt-2">{errorComments}</p>}

        </div>
      ) : (
        // List of User's Reports
        <div className="max-w-4xl mx-auto">
          {loadingReports ? (
            <div className="text-center py-8">
              <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto" />
              <p className="mt-4 text-lg text-blue-300">Loading your reports...</p>
            </div>
          ) : errorReports ? (
            <div className="bg-red-900/20 border border-red-700 text-red-300 p-4 rounded-lg text-center flex items-center justify-center">
              <AlertCircle className="h-5 w-5 mr-2" /> {errorReports}
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-gray-800 p-6 rounded-lg text-center text-gray-400">
              You haven't submitted any reports yet.
              <button
                onClick={() => navigate('/submit-report')} {/* Adjust this path to your report submission page */}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out shadow-md flex items-center mx-auto"
              >
                <PlusCircle className="h-5 w-5 mr-2" /> Submit a New Report
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 cursor-pointer hover:border-blue-500 transition-all duration-200"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-blue-400">{report.title}</h3>
                      <p className="text-sm text-gray-400 flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-1" /> Submitted: {formatDateTime(report.submitted_at)}
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

                  <p className="text-gray-300 mb-4 line-clamp-2">{report.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
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
                    {/* is_premium_report is removed from model/serializer, so no display here */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyReportsPage;
