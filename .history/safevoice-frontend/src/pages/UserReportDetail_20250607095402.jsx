import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Send, Loader2, Info, User as UserIcon, Shield, AlertCircle, Link, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

const UserReportDetail = () => {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [isInternalMessage, setIsInternalMessage] = useState(false);

  const messagesEndRef = useRef(null);

  const accessToken = localStorage.getItem('accessToken');

  const getUserRole = () => {
    if (accessToken) {
      try {
        const decodedToken = JSON.parse(atob(accessToken.split('.')[1]));
        return decodedToken.role;
      } catch (e) {
        console.error("Failed to decode token:", e);
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const role = getUserRole();
    setIsCurrentUserAdmin(role === 'admin');
  }, [accessToken]);

  const fetchReportDetails = async () => {
    if (!reportId) {
      setError('No report ID provided in the URL. Please navigate from a valid report link.');
      setLoading(false);
      return;
    }

    try {
      const reportResponse = await axios.get(`/api/reports/${reportId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setReport(reportResponse.data);

      const messagesResponse = await axios.get(`/api/reports/${reportId}/comments/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setMessages(messagesResponse.data);

    } catch (err) {
      setError('Failed to load report details or messages. Please check the report ID or your permissions.');
      console.error('Error fetching report details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetails();
  }, [reportId, accessToken]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        message: newMessage,
      };

      if (isCurrentUserAdmin) {
        payload.is_internal = isInternalMessage;
      }

      const response = await axios.post(`/api/reports/${reportId}/comments/`, payload, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessage('');
      setIsInternalMessage(false);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error("Error sending message:", err.response?.data || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex justify-center items-center">
        <div className="text-center animate-fade-in">
          <Loader2 className="h-16 w-16 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-xl text-slate-300 animate-pulse">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex justify-center items-center p-6">
        <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-300 p-6 rounded-xl flex items-center gap-3 max-w-lg text-center animate-scale-in shadow-2xl">
          <AlertCircle className="h-6 w-6 text-red-400" />
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white flex justify-center items-center p-6">
        <div className="text-center animate-fade-in">
          <Shield className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <p className="text-xl text-slate-400">Report not found or access denied</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'under_review': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'escalated': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-300 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'under_review': return <Info className="h-4 w-4" />;
      case 'resolved': return <Shield className="h-4 w-4" />;
      case 'escalated': return <AlertCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23334155\" fill-opacity=\"0.05\"%3E%3Cpath d=\"m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative z-10 p-6 sm:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 p-6 sm:p-8 animate-scale-in">
            <div className="pb-6 mb-8 border-b border-slate-700/50 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4 animate-fade-in">
                <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                  <MessageSquare className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-2">
                    {report.title}
                  </h1>
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Category: <span className="font-medium text-slate-300">{report.category}</span>
                  </p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-xl text-sm font-semibold border flex items-center gap-2 ${getStatusColor(report.status)} animate-fade-in hover-scale transition-all duration-200`}>
                {getStatusIcon(report.status)}
                {report.status.replace(/_/g, ' ').toUpperCase()}
              </div>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm p-6 rounded-xl mb-8 border border-slate-700/30 animate-fade-in shadow-lg">
              <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Info className="h-5 w-5 text-blue-400" />
                </div>
                Report Overview
              </h3>
              <p className="text-slate-300 text-base leading-relaxed mb-6 pl-11">{report.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-400 text-sm border-t border-slate-700/50 pt-6">
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover-scale transition-all duration-200">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-slate-500 text-xs">Submitted</p>
                    <p className="text-white font-medium">{new Date(report.submitted_at).toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover-scale transition-all duration-200">
                  <Shield className="h-5 w-5 text-emerald-400" />
                  <div>
                    <p className="text-slate-500 text-xs">Token</p>
                    <p className="text-white font-mono text-xs break-all">{report.token}</p>
                  </div>
                </div>

                {report.priority_flag && (
                  <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg hover-scale transition-all duration-200">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div>
                      <p className="text-red-300 text-xs">Priority Report</p>
                      <p className="text-red-200 font-semibold">High Priority</p>
                    </div>
                  </div>
                )}

                {report.file_upload && (
                  <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg hover-scale transition-all duration-200">
                    <FileText className="h-5 w-5 text-purple-400" />
                    <div>
                      <p className="text-slate-500 text-xs">Attachment</p>
                      <a
                        href={report.file_upload}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium"
                      >
                        View File
                      </a>
                    </div>
                  </div>
                )}

                {report.is_anonymous && (
                  <div className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg hover-scale transition-all duration-200">
                    <UserIcon className="h-5 w-5 text-amber-400" />
                    <div>
                      <p className="text-amber-300 text-xs">Submission Type</p>
                      <p className="text-amber-200 font-semibold">Anonymous</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl mb-6 border border-slate-700/30 shadow-lg animate-fade-in">
              <div className="p-6 border-b border-slate-700/30">
                <h3 className="text-xl font-bold text-slate-200 flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-purple-400" />
                  </div>
                  Conversation
                </h3>
              </div>
              
              <div className="p-6 h-[400px] sm:h-[500px] overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="flex-grow flex items-center justify-center text-center">
                    <div className="animate-pulse">
                      <MessageSquare className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                      <p className="text-slate-500">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, index) => (
                    <div
                      key={msg.id}
                      className={`flex mb-4 animate-fade-in ${
                        msg.is_current_user_sender ? 'justify-end' : 'justify-start'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div
                        className={`max-w-[75%] p-4 rounded-2xl shadow-lg transition-all duration-200 hover-scale ${
                          msg.is_current_user_sender
                            ? 'bg-blue-600/90 text-white rounded-br-md backdrop-blur-sm'
                            : msg.is_internal && isCurrentUserAdmin
                              ? 'bg-red-600/20 text-red-100 rounded-bl-md border border-red-500/30 backdrop-blur-sm'
                              : msg.is_sender_admin
                                ? 'bg-purple-600/90 text-white rounded-bl-md backdrop-blur-sm'
                                : 'bg-slate-700/60 text-slate-100 rounded-tl-md backdrop-blur-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2 text-xs opacity-80">
                          {msg.is_internal ? (
                            <>
                              <Shield className="h-3 w-3 text-red-300" />
                              <span className="font-semibold">Admin (Internal Note)</span>
                            </>
                          ) : msg.is_sender_admin ? (
                            <>
                              <Shield className="h-3 w-3 text-white" />
                              <span className="font-semibold">{msg.display_sender_name}</span>
                            </>
                          ) : (
                            <>
                              <UserIcon className="h-3 w-3" />
                              <span className="font-semibold">{msg.display_sender_name}</span>
                            </>
                          )}
                          <span className="ml-auto opacity-60">
                            {new Date(msg.sent_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="break-words leading-relaxed">{msg.message}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-4 animate-fade-in">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-300 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-grow">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows="3"
                    className="w-full bg-slate-800/50 backdrop-blur-sm border border-slate-600/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none text-slate-200 placeholder-slate-500 transition-all duration-200"
                    disabled={submitting}
                  />
                  
                  {isCurrentUserAdmin && (
                    <div className="flex items-center mt-3 text-sm">
                      <input
                        type="checkbox"
                        id="isInternal"
                        checked={isInternalMessage}
                        onChange={(e) => setIsInternalMessage(e.target.checked)}
                        className="h-4 w-4 text-red-500 bg-slate-700 border-slate-600 rounded focus:ring-red-500/50 cursor-pointer"
                      />
                      <label htmlFor="isInternal" className="ml-2 text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                        Internal Note (Only visible to admins)
                      </label>
                    </div>
                  )}
                </div>
                
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover-scale min-w-[140px]"
                    disabled={submitting || !newMessage.trim()}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send
                        <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReportDetail;
