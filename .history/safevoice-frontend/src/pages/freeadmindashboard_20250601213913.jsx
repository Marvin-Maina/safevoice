import React, { useEffect, useState } from "react";
import axios from "axios";

const FreeAdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchApprovedRequests = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get("/api/admin-access-requests/approved/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setRequests(response.data);
      } catch (error) {
        console.error("Error fetching approved requests:", error);
      }
    };

    fetchApprovedRequests();
  }, []);

  const filteredRequests = filter === "all"
    ? requests
    : requests.filter((req) => req.role === filter);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Approved Access Requests</h1>

      <div className="mb-6">
        <label className="block font-medium mb-1">Filter by Role:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 p-2 rounded-md w-full sm:w-1/2"
        >
          <option value="all">All</option>
          <option value="free_admin">Free Admin</option>
          <option value="premium_admin">Premium Admin</option>
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <p className="text-gray-600">No approved requests found.</p>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="border rounded-md p-4 shadow-sm">
              <h2 className="font-semibold text-lg">{request.name}</h2>
              <p><strong>Email:</strong> {request.email}</p>
              <p><strong>Organization:</strong> {request.organization}</p>
              <p><strong>Requested Role:</strong> {request.role}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreeAdminDashboard;
