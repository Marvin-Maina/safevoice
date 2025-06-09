import React, { useEffect, useState } from "react";
import axios from "axios";

const FreeAdminDashboard = () => {
  const [reports, setReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get("/api/reports/reports/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setReports(response.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesStatus = filterStatus ? report.status === filterStatus : true;
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Free Admin Dashboard</h1>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded w-full sm:w-1/2"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded w-full sm:w-1/4"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="in_review">In Review</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="p-4 border rounded shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{report.title}</h2>
            <p className="text-sm text-gray-600 mb-2">{report.status}</p>
            <p className="text-gray-800">{report.description}</p>
            <p className="text-xs text-gray-400 mt-2">Submitted on: {new Date(report.created_at).toLocaleString()}</p>
          </div>
        ))}
        {filteredReports.length === 0 && (
          <div className="text-center text-gray-500">No reports found.</div>
        )}
      </div>
    </div>
  );
};

export default FreeAdminDashboard;
