import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  FileText, MessageSquare, PlusCircle, Send, XCircle, Loader2, Info, ArrowLeft,
  Calendar, Hash, User, Shield, Clock, Link2Icon} from 'lucide-react';
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
      const response = await axios.get('/api/reports/reports/', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      // Ensure response.data is an array before attempting to sort
      const reportsArray = Array.isArray(response.data) ? response.data : []; // Default to empty array if not array
      
      // Sort reports by newest first
      const sortedReports = [...reportsArray].sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
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

  // Handle canceling a report
  const handleCancelReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to cancel this report? This action cannot be undone if the report status changes.')) {
      return;
    }
    try {
      await axios.post(
        `/api/reports/${reportId}/cancel/`,
        {}, // Empty body for a POST request
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      // Update the status of the selected report in the state
      setSelectedReport(prev => ({ ...prev, status: 'cancelled' }));
      // Also update the status in the main reports list
      setReports(prevReports => prevReports.map(report =>
        report.id === reportId ? { ...report, status: 'cancelled' } : report
      ));
      alert('Report cancelled successfully!');
    } catch (err) {
      console.error('Error cancelling report:', err);
      // Check if the error is due to the report already being cancelled or other server-side messages
      if (err.response && err.response.data && err.response.data.message) {
        alert(`Failed to cancel report: ${err.response.data.message}`);
      } else if (err.response && err.response.data && err.response.data.error) {
        alert(`Failed to cancel report: ${err.response.data.error}`);
      }
      else {
        alert('Failed to cancel report. Please try again.');
      }
    }
  };

  // Handle deleting a report
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to permanently delete this report? This action cannot be undone.')) {
      return;
    }
    try {
      await axios.delete(
        `/api/reports/${reportId}/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      // Remove the deleted report from the list and clear selected report
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      setSelectedReport(null); // Go back to the list view
      alert('Report permanently deleted successfully!');
    } catch (err) {
      console.error('Error deleting report:', err);
      if (err.response && err.response.data && err.response.data.error) {
        alert(`Failed to delete report: ${err.response.data.error}`);
      } else {
        alert('Failed to delete report. Please try again.');
      }
    }
  };

  // Handle exporting report certificate
  const handleExportCertificate = async (reportId) => {
    try {
      const response = await axios.get(
        `/api/reports/reports/${reportId}/certificate/`,
        {
          responseType: 'blob', // Important: receive the response as a Blob
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      // Create a URL for the blob and trigger download
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const fileLink = document.createElement('a');
      fileLink.href = fileURL;
      fileLink.setAttribute('download', `report_certificate_${reportId}.pdf`); // Set a suitable filename
      document.body.appendChild(fileLink);
      fileLink.click();
      fileLink.remove(); // Clean up the DOM
      window.URL.revokeObjectURL(fileURL); // Clean up the URL object
      alert('Certificate downloaded successfully!');
    } catch (err) {
      console.error('Error exporting certificate:', err);
      alert('Failed to export certificate. Please try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-[#111327] via-[#111327] to-[#0a0c1b] pt-24 pb-16 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-400/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-4 sm:mb-0 flex items-center">
            <FileText className="mr-3 h-8 w-8 text-blue-400" />
            My Reports
          </h1>
          <button
            onClick={() => navigate('/login')}
            className="group relative overflow-hidden bg-[#111327] hover:bg-gray-700 text-gray-300 hover:text-white px-6 py-3 rounded-xl transition-all duration-300 flex items-center space-x-2 border border-gray-600 hover:border-gray-500 shadow-lg hover:shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 font-medium">Logout</span>
          </button>
        </header>

        {selectedReport ? (
          // Report Detail and Messaging View
          <div className="max-w-4xl mx-auto bg-[#111327] p-8 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm">
            <button
              onClick={handleBackToReports}
              className="group mb-6 flex items-center bg-[#0a0c1b] hover:bg-gray-600 text-gray-300 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 border border-gray-600 hover:border-gray-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" />
              Back to My Reports
            </button>

            <h2 className="text-3xl font-bold text-white mb-4 flex items-center">
              <FileText className="mr-3 h-7 w-7 text-green-400" /> {selectedReport.title}
            </h2>
            <div className="text-gray-400 text-sm mb-6 space-y-2">
              <p className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-400" /> 
                <span className="text-gray-300 mr-1">Submitted:</span> 
                {formatDateTime(selectedReport.submitted_at)}
              </p>
              <p className="flex items-center">
                <Hash className="h-4 w-4 mr-2 text-purple-400" /> 
                <span className="text-gray-300 mr-1">Category:</span> 
                {selectedReport.category}
              </p>
              <p className="flex items-center">
                <Info className="h-4 w-4 mr-2 text-cyan-400" /> 
                <span className="text-gray-300 mr-1">Status:</span>
                <span className={`px-3 py-1 ml-2 rounded-full text-xs font-semibold border ${
                  selectedReport.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300 border-yellow-600/50' :
                  selectedReport.status === 'under_review' ? 'bg-blue-900/50 text-blue-300 border-blue-600/50' :
                  selectedReport.status === 'resolved' ? 'bg-green-900/50 text-green-300 border-green-600/50' :
                  selectedReport.status === 'rejected' ? 'bg-red-900/50 text-red-300 border-red-600/50' :
                  'bg-gray-800 text-gray-300 border-gray-600'
                }`}>
                  {selectedReport.status.replace('_', ' ').charAt(0).toUpperCase() + selectedReport.status.replace('_', ' ').slice(1)}
                </span>
              </p>
              {selectedReport.priority_flag && (
                <p className="flex items-center text-red-400 font-semibold">
                  <Flag className="h-4 w-4 mr-2 text-red-400" fill="currentColor" /> 
                  Priority Report
                </p>
              )}
              {selectedReport.is_anonymous && (
                <p className="flex items-center text-gray-500 italic">
                  <Shield className="h-4 w-4 mr-2 text-gray-500" /> 
                  Submitted Anonymously
                </p>
              )}
              {selectedReport.file_upload && (
                <p className="flex items-center">
                  <LinkIcon className="h-4 w-4 mr-2 text-indigo-400" /> 
                  <span className="text-gray-300 mr-1">Attachment:</span>
                  <a href={selectedReport.file_upload} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline ml-1 transition-colors duration-200">
                    View File
                  </a>
                </p>
              )}
            </div>
            
            <div className="bg-[#0a0c1b] p-4 rounded-lg border border-gray-700 mb-6">
              <p className="text-gray-300 leading-relaxed">{selectedReport.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {/* Cancel Button */}
              {selectedReport.status !== 'cancelled' && selectedReport.status !== 'resolved' && selectedReport.status !== 'rejected' && (
                <button
                  onClick={() => handleCancelReport(selectedReport.id)}
                  className="group relative overflow-hidden bg-[#111327] hover:bg-yellow-600 text-gray-300 hover:text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-600 hover:border-yellow-500 flex items-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Ban className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">Cancel Report</span>
                </button>
              )}

              {/* Delete Button */}
              {selectedReport.status !== 'resolved' && (
                <button
                  onClick={() => handleDeleteReport(selectedReport.id)}
                  className="group relative overflow-hidden bg-[#111327] hover:bg-red-600 text-gray-300 hover:text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-600 hover:border-red-500 flex items-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Trash2 className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">Delete Report</span>
                </button>
              )}

              {/* Export Certificate Button */}
              {selectedReport.status === 'resolved' && (
                <button
                  onClick={() => handleExportCertificate(selectedReport.id)}
                  className="group relative overflow-hidden bg-[#111327] hover:bg-purple-600 text-gray-300 hover:text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-600 hover:border-purple-500 flex items-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <Download className="h-4 w-4 mr-2 relative z-10" />
                  <span className="relative z-10">Export Certificate</span>
                </button>
              )}
            </div>

            <hr className="border-gray-700 my-6" />

            {/* Comments Section */}
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
              <MessageSquare className="mr-3 h-6 w-6 text-purple-400" /> Conversation
            </h3>
            <div className="space-y-4 h-96 overflow-y-auto pr-2 custom-scrollbar border border-gray-700 rounded-lg p-4 bg-[#0a0c1b]">
              {loadingComments ? (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-blue-400 mx-auto" />
                  <p className="mt-3 text-blue-300 font-medium">Loading messages...</p>
                </div>
              ) : errorComments ? (
                <div className="bg-red-900/20 border border-red-600/50 text-red-300 p-4 rounded-lg text-center flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-red-400" /> {errorComments}
                </div>
              ) : comments.length === 0 ? (
                <div className="text-gray-400 text-center py-8 flex flex-col items-center">
                  <MessageSquare className="h-12 w-12 text-gray-600 mb-3" />
                  <p className="text-lg">No messages yet.</p>
                  <p className="text-sm mt-1">Start the conversation below.</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className={`p-4 rounded-lg shadow-md border ${
                    comment.is_sender_admin 
                      ? 'bg-blue-900/30 border-blue-600/30 self-start' 
                      : 'bg-gray-700/50 border-gray-600/50 self-end'
                  }`}>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className={`font-semibold flex items-center ${
                        comment.is_sender_admin ? 'text-blue-300' : 'text-green-300'
                      }`}>
                        <User className="h-3 w-3 mr-1" />
                        {comment.display_sender_name}
                      </span>
                      <span className="text-gray-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDateTime(comment.sent_at)}
                      </span>
                    </div>
                    <p className="text-gray-200 leading-relaxed">{comment.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* New Comment Input */}
            <div className="mt-6 flex items-end gap-3">
              <div className="flex-grow">
                <textarea
                  className="w-full p-4 rounded-lg bg-[#0a0c1b] border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none transition-all duration-200"
                  rows="3"
                  placeholder="Type your message here..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={sendingComment}
                ></textarea>
              </div>
              <button
                onClick={handleSendComment}
                className="group relative overflow-hidden bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white font-medium p-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none flex-shrink-0 border border-blue-500 hover:border-blue-400 disabled:border-gray-600"
                disabled={!newComment.trim() || sendingComment}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {sendingComment ? (
                  <Loader2 className="animate-spin h-5 w-5 relative z-10" />
                ) : (
                  <Send className="h-5 w-5 relative z-10 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                )}
              </button>
            </div>
            {errorComments && (
              <div className="mt-3 p-3 bg-red-900/20 border border-red-600/50 text-red-300 rounded-lg flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-red-400" />
                {errorComments}
              </div>
            )}

          </div>
        ) : (
          // List of User's Reports
          <div className="max-w-4xl mx-auto">
            {loadingReports ? (
              <div className="text-center py-12">
                <Loader2 className="animate-spin h-12 w-12 text-blue-400 mx-auto" />
                <p className="mt-4 text-lg text-blue-300 font-medium">Loading your reports...</p>
              </div>
            ) : errorReports ? (
              <div className="bg-red-900/20 border border-red-600/50 text-red-300 p-6 rounded-xl text-center flex items-center justify-center">
                <AlertCircle className="h-6 w-6 mr-3 text-red-400" /> 
                <span className="text-lg">{errorReports}</span>
              </div>
            ) : reports.length === 0 ? (
              <div className="bg-[#111327] p-8 rounded-2xl text-center border border-gray-700/50 shadow-2xl backdrop-blur-sm">
                <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg mb-6">You haven't submitted any reports yet.</p>
                <button
                  onClick={() => navigate('/submit-report')} 
                  className="group relative overflow-hidden bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl flex items-center mx-auto border border-blue-500 hover:border-blue-400"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <PlusCircle className="h-5 w-5 mr-2 relative z-10" />
                  <span className="relative z-10">Submit a New Report</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="group bg-[#111327] p-6 rounded-2xl shadow-2xl border border-gray-700/50 backdrop-blur-sm cursor-pointer hover:border-blue-500/50 hover:bg-[#111327]/80 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-blue-400 group-hover:text-blue-300 transition-colors duration-200 flex items-center">
                          <FileText className="h-5 w-5 mr-2" />
                          {report.title}
                        </h3>
                        <p className="text-sm text-gray-400 flex items-center mt-2">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" /> 
                          <span className="text-gray-300 mr-1">Submitted:</span>
                          {new Date(report.submitted_at).toLocaleString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                        report.status === 'pending' ? 'bg-yellow-900/50 text-yellow-300 border-yellow-600/50' :
                        report.status === 'under_review' ? 'bg-blue-900/50 text-blue-300 border-blue-600/50' :
                        report.status === 'resolved' ? 'bg-green-900/50 text-green-300 border-green-600/50' :
                        report.status === 'rejected' ? 'bg-red-900/50 text-red-300 border-red-600/50' :
                        'bg-gray-800 text-gray-300 border-gray-600'
                      }`}>
                        {report.status.replace('_', ' ').charAt(0).toUpperCase() + report.status.replace('_', ' ').slice(1)}
                      </div>
                    </div>

                    <div className="bg-[#0a0c1b] p-3 rounded-lg border border-gray-700/50 mb-4">
                      <p className="text-gray-300 line-clamp-2 leading-relaxed">{report.description}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center">
                        <Hash className="h-4 w-4 mr-1 text-purple-400" />
                        <span className="font-medium text-gray-300 mr-1">Category:</span> 
                        {report.category}
                      </span>
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-green-400" />
                        <span className="font-medium text-gray-300 mr-1">Submitted By:</span>
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
                          <Flag className="h-4 w-4 mr-1 text-red-400" fill="currentColor" /> 
                          Priority
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

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0a0c1b;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #374151;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #4b5563;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default MyReportsPage;