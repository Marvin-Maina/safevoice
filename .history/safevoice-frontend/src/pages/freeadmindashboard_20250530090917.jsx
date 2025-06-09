import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

const FreeAdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('/api/admin/free/reports/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access')}`,
          },
        });
        setReports(response.data);
      } catch (err) {
        setError('Could not load reports. Try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-blue-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-red-400">
          <AlertCircle className="h-6 w-6" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c1b] py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">Free Admin Dashboard</h1>
        </div>

        {reports.length === 0 ? (
          <div className="bg-[#111327] rounded-lg p-6 text-gray-300">
            No reports to review yet.
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="bg-[#111327] rounded-lg p-6 space-y-4 border border-blue-900/20">
                <div>
                  <h2 className="text-xl font-semibold text-white">{report.title}</h2>
                  <p className="text-gray-300 mt-2">{report.description}</p>
                </div>

                <div className="border-t border-blue-900/20 pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">
                      Submitted: {new Date(report.created_at).toLocaleString()}
                    </p>
                    <span className="inline-block px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm">
                      Status: {report.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeAdminDashboard;