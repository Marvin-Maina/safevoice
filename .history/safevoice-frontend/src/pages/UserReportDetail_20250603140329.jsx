// src/pages/UserReportDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

const UserReportDetail = () => {
  const { reportId } = useParams(); // Get reportId from the URL
  const [report, setReport] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const accessToken = localStorage.getItem('accessToken');

  const fetchReportDetails = async () => {
    // Only attempt to fetch if reportId is available
    if (!reportId) {
      setError('No report ID provided in the URL. Please navigate from a valid report link.');
      setLoading(false);
      return; // Exit if no reportId
    }

    try {
      const reportResponse = await axios.get(`/api/reports/${reportId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setReport(reportResponse.data);

      const messagesResponse = await axios.get(`/api/reports/${reportId}/comments/`, { // Corrected endpoint for comments
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

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !reportId) return; // Prevent sending empty messages or if no reportId

    setSubmitting(true);
    const accessToken = localStorage.getItem('accessToken');

    try {
      const response = await axios.post(
        `/api/reports/${reportId}/comments/`, // Corrected endpoint for sending comments
        { message: newMessage },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      setMessages((prevMessages) => [...prevMessages, response.data]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message.');
    } finally {
      setSubmitting(false);
    }
  };


  useEffect(() => {
    fetchReportDetails();
  }, [reportId, accessToken]); // Re-run when reportId or accessToken changes

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-blue-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading report...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center">
        <div className="text-red-400 text-center">
          <p className="text-lg mb-2">Error: {error}</p>
          <p className="text-sm">Please try again or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center">
        <div className="text-gray-400 text-center">
          <p className="text-lg">Report not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c1b] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-[#111327] rounded-lg shadow-xl p-6 border border-blue-900/20">
        <div className="flex items-center space-x-3 mb-6 border-b border-blue-900/20 pb-4">
          <MessageSquare className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Report Details</h1>
        </div>

        <div className="space-y-4 mb-6">
          <h2 className="text-2xl font-semibold text-white">{report.title}</h2>
          <p className="text-gray-300 text-lg">{report.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-400 text-sm">
            <p>
              <strong>Category:</strong> <span className="text-white">{report.category}</span>
            </p>
            <p>
              <strong>Status:</strong>{' '}
              <span className={`font-semibold ${
                report.status === 'resolved' ? 'text-green-400' :
                report.status === 'pending' ? 'text-yellow-400' :
                'text-blue-400'
              }`}>
                {report.status}
              </span>
            </p>
            <p>
              <strong>Submitted:</strong>{' '}
              <span className="text-white">{new Date(report.submitted_at).toLocaleString()}</span>
            </p>
            <p>
              <strong>Token:</strong> <span className="text-white font-mono text-xs break-all">{report.token}</span>
            </p>
            {report.priority_flag && (
              <p>
                <strong>Priority:</strong> <span className="text-red-400">Yes</span>
              </p>
            )}
            {report.file_upload && (
              <p>
                <strong>Attachment:</strong>{' '}
                <a
                  href={report.file_upload}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  View File
                </a>
              </p>
            )}
          </div>
        </div>

        <div className="bg-[#0a0c1b] rounded-lg p-4 h-80 overflow-y-auto border border-blue-900/20 mb-4">
          <h3 className="text-xl font-semibold text-white mb-4">Messages</h3>
          <div className="flex flex-col space-y-3">
            {messages.length === 0 ? (
              <p className="text-gray-400 text-center">No messages yet. Start a conversation!</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.is_internal // Assuming 'is_internal' indicates an admin message
                      ? 'bg-blue-800/50 text-white self-start'
                      : 'bg-gray-700/50 self-end'
                  }`}
                >
                  <p className="text-xs text-gray-400 mb-1">
                    {msg.is_internal ? 'Admin' : msg.sender_username} • {new Date(msg.sent_at).toLocaleString()}
                  </p>
                  <p className="text-gray-200">{msg.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t border-blue-900/20">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            rows="2"
            className="flex-grow bg-[#0a0c1b] border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-200"
            disabled={submitting}
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : 'Send'}
            {!submitting && <Send className="ml-2 h-5 w-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserReportDetail;