import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FileText, Link as LinkIcon, Download, Loader2, XCircle } from 'lucide-react';

const UserReportDetail = () => {
  const { id } = useParams(); // Get the report ID from the URL
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          navigate('/login'); // Redirect to login if not authenticated
          return;
        }

        // Fetch the specific report using its ID
        // The ReportViewSet (from your backend) handles fetching individual reports by ID
        const response = await axios.get(`/api/reports/${id}/`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setReport(response.data);
      } catch (err) {
        console.error('Failed to fetch report:', err.response ? err.response.data : err);
        if (err.response && err.response.status === 404) {
          setError('Report not found or you do not have permission to view it.');
        } else if (err.response && err.response.status === 401) {
          navigate('/login'); // Token expired or invalid
        } else {
          setError('An error occurred while fetching the report.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-blue-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading report details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center p-4">
        <div className="bg-red-500/20 text-red-300 p-4 rounded-md flex items-center">
          <XCircle className="h-5 w-5 mr-2" /> {error}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] text-white flex items-center justify-center">
        Report data not available.
      </div>
    );
  }

  // Determine file type icon
  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return null;
    const extension = fileUrl.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
      return <ImageIcon className="h-5 w-5 mr-2" />; // Assuming you have an ImageIcon or similar
    } else if (['mp4', 'mov', 'avi'].includes(extension)) {
      return <VideoIcon className="h-5 w-5 mr-2" />; // Assuming a VideoIcon
    } else if (extension === 'pdf') {
      return <FileText className="h-5 w-5 mr-2" />;
    }
    return <FileText className="h-5 w-5 mr-2" />; // Default icon
  };

  return (
    <div className="min-h-screen bg-[#0a0c1b] text-white flex items-center justify-center p-4">
      <div className="bg-[#111327] rounded-lg shadow-lg p-8 max-w-2xl w-full border border-blue-900/20">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-400">Report Details</h1>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Title: {report.title}</h2>
            <p className="text-gray-300 mt-2">{report.description}</p>
          </div>

          <div className="border-t border-blue-900/20 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">
                <span className="font-medium text-white">Category:</span> {report.category}
              </p>
              <p className="text-gray-400">
                <span className="font-medium text-white">Status:</span>{' '}
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  report.status === 'resolved' ? 'bg-green-500/30 text-green-300' :
                  report.status === 'under_review' ? 'bg-yellow-500/30 text-yellow-300' :
                  'bg-blue-500/30 text-blue-300'
                }`}>
                  {report.status.replace(/_/g, ' ')}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-400">
                <span className="font-medium text-white">Submitted:</span> {new Date(report.submitted_at).toLocaleString()}
              </p>
              <p className="text-gray-400">
                <span className="font-medium text-white">Priority Flag:</span>{' '}
                <span className={`font-semibold ${report.priority_flag ? 'text-red-400' : 'text-gray-400'}`}>
                  {report.priority_flag ? 'Yes' : 'No'}
                </span>
              </p>
            </div>
          </div>

          {report.file_upload && (
            <div className="border-t border-blue-900/20 pt-4">
              <h3 className="text-lg font-medium text-white flex items-center mb-2">
                <FileText className="h-5 w-5 mr-2" /> Attached File
              </h3>
              <a
                href={report.file_upload}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center"
              >
                <Download className="h-4 w-4 mr-1" /> Download File
              </a>
            </div>
          )}

          <div className="border-t border-blue-900/20 pt-4">
            <h3 className="text-lg font-medium text-white flex items-center mb-2">
              <LinkIcon className="h-5 w-5 mr-2" /> Report Verification
            </h3>
            <p className="text-gray-400">
              Unique Token: <span className="font-mono text-blue-300">{report.token}</span>
            </p>
            <p className="text-gray-400 mt-2">
              You can use this token to verify the report's authenticity.
            </p>
            {/* Link to certificate view (if available and accessible publicly by token) */}
            <a
              href={`/api/reports/${report.id}/certificate/`} // Use the certificate endpoint
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mt-4 inline-flex items-center"
            >
              <FileText className="h-4 w-4 mr-2" /> View Certificate (PDF)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReportDetail;