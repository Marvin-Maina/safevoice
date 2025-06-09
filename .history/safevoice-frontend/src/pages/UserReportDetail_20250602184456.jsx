// src/pages/UserReportDetail.jsx (New file)

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MessageSquare, Send, Loader2 } from 'lucide-react';

const UserReportDetail = () => {
  const { reportId } = useParams(); // Assuming your route is /reports/:reportId
  const [report, setReport] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const accessToken = localStorage.getItem('accessToken'); // Or wherever you store it

  const fetchReportDetails = async () => {
    try {
      const reportResponse = await axios.get(`/api/reports/${reportId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setReport(reportResponse.data);

      const messagesResponse = await axios.get(`/api/reports/${reportId}/messages/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setMessages(messagesResponse.data);

    } catch (err) {
      setError('Failed to load report details or messages.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportDetails();
  }, [reportId, accessToken]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSubmitting(true);
    try {
      const response = await axios.post(`/api/reports/${reportId}/messages/create/`,
        { message_text: newMessage },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setMessages([...messages, response.data]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <span className="ml-2 text-gray-300">Loading report...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center text-gray-400">
        Report not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c1b] text-white p-8 pt-20">
      <div className="max-w-3xl mx-auto bg-[#111327] rounded-lg shadow-xl p-6 space-y-6 border border-blue-900/20">
        <h1 className="text-3xl font-bold text-blue-400 mb-4">{report.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300 text-sm">
          <div>
            <p><span className="font-semibold">Category:</span> {report.category}</p>
            <p><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                report.status === 'resolved' ? 'bg-green-600' :
                report.status === 'under_review' ? 'bg-yellow-600' :
                report.status === 'escalated' ? 'bg-red-600' : 'bg-gray-600'
              }`}>{report.status.replace(/_/g, ' ')}</span></p>
            <p><span className="font-semibold">Submitted:</span> {new Date(report.submitted_at).toLocaleString()}</p>
          </div>
          <div>
            <p><span className="font-semibold">Token:</span> {report.token}</p>
            <p><span className="font-semibold">Premium Report:</span> {report.is_premium ? 'Yes' : 'No'}</p>
            <p><span className="font-semibold">Priority Flag:</span> {report.priority_flag ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="border-t border-blue-900/20 pt-4 mt-4">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-300 leading-relaxed">{report.description}</p>
        </div>

        {report.file_upload && (
          <div className="border-t border-blue-900/20 pt-4 mt-4">
            <h2 className="text-xl font-semibold mb-2">Attachment</h2>
            <a href={report.file_upload} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              View Attached File
            </a>
          </div>
        )}

        <div className="border-t border-blue-900/20 pt-4 mt-4 space-y-4">
          <h2 className="text-xl font-semibold flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" /> Communication Log
          </h2>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.is_admin_message ? 'bg-blue-900/30 self-start' : 'bg-gray-700/50 self-end'
                  }`}
                >
                  <p className="text-xs text-gray-400 mb-1">
                    {msg.is_admin_message ? 'Admin' : msg.sender_username} • {new Date(msg.timestamp).toLocaleString()}
                  </p>
                  <p className="text-gray-200">{msg.message_text}</p>
                </div>
              ))
            )}
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
              {submitting ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="h-5 w-5 mr-2" />}
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserReportDetail;