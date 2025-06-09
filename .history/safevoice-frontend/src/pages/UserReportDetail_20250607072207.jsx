// src/pages/UserReportDetail.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Send, Loader2, Info, User as UserIcon, Shield, AlertCircle, Link, CheckCircle, XCircle, Clock, FileText } from 'lucide-react'; // Added FileText

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
      const reportResponse = await axios.get(`/api/reportsreports/${reportId}/`, {
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
      <div className="min-h-screen bg-gray-950 text-white flex justify-center items-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="ml-4 text-xl text-gray-400">Loading report details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex justify-center items-center p-6">
        <div className="bg-red-500/20 text-red-300 p-4 rounded-md flex items-center gap-2 max-w-lg text-center">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex justify-center items-center p-6">
        <p className="text-gray-400">Report not found or you do not have access.</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600/30 text-yellow-300';
      case 'under_review': return 'bg-blue-600/30 text-blue-300';
      case 'resolved': return 'bg-green-600/30 text-green-300';
      case 'escalated': return 'bg-red-600/30 text-red-300';
      case 'rejected': return 'bg-red-600/30 text-red-300';
      default: return 'bg-gray-600/30 text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 sm:p-10">
      <div className="max-w-4xl mx-auto bg-[#0a0c1b] rounded-xl shadow-2xl border border-blue-900/20 p-6 sm:p-8">
        {/* Report Header */}
        <div className="pb-5 mb-6 border-b border-blue-900/30 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <MessageSquare className="h-10 w-10 text-blue-400" />
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-300 leading-tight">
                {report.title}
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Category: <span className="font-medium text-gray-300">{report.category}</span>
              </p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(report.status)}`}>
            {report.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Report Details Section */}
        <div className="bg-[#10122a] p-5 rounded-lg mb-6 border border-gray-800 shadow-inner">
          <h3 className="text-xl font-semibold text-gray-200 mb-3 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-400" /> Report Overview
          </h3>
          <p className="text-gray-300 text-base leading-relaxed mb-4">{report.description}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-gray-400 text-sm border-t border-gray-700 pt-4">
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              Submitted: <span className="text-white">{new Date(report.submitted_at).toLocaleString()}</span>
            </p>
            <p className="flex items-center gap-2">
              <Link className="h-4 w-4 text-gray-500" />
              Token: <span className="text-white font-mono text-xs break-all">{report.token}</span>
            </p>
            {report.priority_flag && (
              <p className="flex items-center gap-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                Priority: <span className="font-semibold">Yes</span>
              </p>
            )}
            {report.file_upload && (
              <p className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                Attachment:{' '}
                <a
                  href={report.file_upload}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline transition-colors duration-200"
                >
                  View File
                </a>
              </p>
            )}
            {report.is_anonymous && (
              <p className="flex items-center gap-2 text-yellow-500">
                <Info className="h-4 w-4" />
                Anonymous Submission
              </p>
            )}
          </div>
        </div>

        {/* Conversation Section */}
        <div className="bg-[#1a1c38] p-5 rounded-lg mb-6 flex flex-col h-[400px] sm:h-[500px] overflow-y-auto custom-scrollbar border border-blue-800/30 shadow-md">
          <h3 className="text-xl font-bold text-blue-300 mb-4 sticky top-0 bg-[#1a1c38] pb-2 z-10">Conversation</h3>
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center flex-grow flex items-center justify-center">No messages yet. Start the conversation!</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex mb-4 ${
                  msg.is_current_user_sender
                    ? 'justify-end' // Current user's messages (right-aligned)
                    : 'justify-start' // Other user's (or admin's) messages (left-aligned)
                }`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.01] ${
                    msg.is_current_user_sender
                      ? 'bg-blue-700 text-white rounded-br-none' // Current user (blue)
                      : msg.is_internal && isCurrentUserAdmin // Admin's internal message (red, only seen by admins)
                        ? 'bg-red-800/60 text-red-100 rounded-bl-none border border-red-700'
                        : msg.is_sender_admin // Admin's public message (purple)
                          ? 'bg-purple-700 text-white rounded-bl-none'
                          : 'bg-gray-700 text-gray-100 rounded-tl-none' // Other user (gray)
                  }`}
                >
                  <p className="text-xs text-gray-200 mb-1 font-semibold flex items-center gap-1">
                    {msg.is_internal ? (
                      <>
                        {/* Internal Admin Note */}
                        <Shield className="h-3 w-3 text-red-300" /> Admin (Internal Note)
                      </>
                    ) : msg.is_sender_admin ? (
                      <>
                        {/* Public Admin Message */}
                        <Shield className="h-3 w-3 text-white" /> {msg.display_sender_name}
                      </>
                    ) : (
                      <>
                        {/* User Message (Anonymous or Identified) */}
                        <UserIcon className="h-3 w-3 text-gray-300" /> {msg.display_sender_name}
                      </>
                    )}
                    <span className="ml-2 font-normal text-gray-400"> • {new Date(msg.sent_at).toLocaleString()}</span>
                  </p>
                  <p className="text-gray-100 break-words">{msg.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-blue-900/20">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            rows="3"
            className="flex-grow bg-[#0a0c1b] border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-200 placeholder-gray-500 transition-all duration-200"
            disabled={submitting}
          />
          <div className="flex flex-col gap-2">
            {isCurrentUserAdmin && (
              <div className="flex items-center text-sm text-gray-400 mb-2 sm:mb-0">
                <input
                  type="checkbox"
                  id="isInternal"
                  checked={isInternalMessage}
                  onChange={(e) => setIsInternalMessage(e.target.checked)}
                  className="h-4 w-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500 cursor-pointer"
                />
                <label htmlFor="isInternal" className="ml-2 cursor-pointer">
                  Internal Note
                </label>
              </div>
            )}
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:scale-[1.01]"
              disabled={submitting || !newMessage.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" /> Sending...
                </>
              ) : (
                <>
                  Send Message
                  <Send className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserReportDetail;
