import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Shield, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Archive,
  Search,
  Filter,
  Calendar,
  Eye,
  Edit,
  X
} from 'lucide-react';

const DUMMY_REPORTS = [
  {
    id: 'a1b2c3',
    category: 'misconduct',
    submittedAt: '2025-04-06T10:30:00Z',
    status: 'new',
    description: 'Observed inappropriate behavior during office hours.',
    trackingToken: 'TRK-123456',
    adminNotes: ''
  },
  {
    id: 'd4e5f6',
    category: 'unsafe-environment',
    submittedAt: '2025-04-05T15:45:00Z',
    status: 'in-review',
    description: 'Faulty equipment in workspace creating hazardous conditions.',
    trackingToken: 'TRK-789012',
    adminNotes: 'Maintenance team notified'
  },
  {
    id: 'g7h8i9',
    category: 'corruption',
    submittedAt: '2025-04-04T09:15:00Z',
    status: 'action-taken',
    description: 'Suspicious financial transactions observed.',
    trackingToken: 'TRK-345678',
    adminNotes: 'Investigation completed'
  }
];

const STATUS_COLORS = {
  'new': 'bg-red-100 text-red-800',
  'in-review': 'bg-yellow-100 text-yellow-800',
  'action-taken': 'bg-green-100 text-green-800',
  'archived': 'bg-gray-100 text-gray-800'
};

const STATUS_ICONS = {
  'new': AlertCircle,
  'in-review': Clock,
  'action-taken': CheckCircle,
  'archived': Archive
};

export function Dashboard() {
  const [reports, setReports] = useState(DUMMY_REPORTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const newReportsCount = reports.filter(report => report.status === 'new').length;

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.id.includes(searchTerm) || 
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleStatusChange = (reportId, newStatus) => {
    setReports(reports.map(report => 
      report.id === reportId ? { ...report, status: newStatus } : report
    ));
  };

  const handleNotesChange = (reportId, notes) => {
    setReports(reports.map(report =>
      report.id === reportId ? { ...report, adminNotes: notes } : report
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <Shield className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              You're reviewing reports submitted anonymously. Handle with care and respect.
            </p>
          </div>
        </div>
      </div>

      {/* New Reports Counter */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex items-center">
          <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
          <span className="text-lg font-semibold">
            {newReportsCount} New {newReportsCount === 1 ? 'Report' : 'Reports'} Require Attention
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                className="pl-10 w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="relative">
              <Filter className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                className="pl-10 w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-review">In Review</option>
                <option value="action-taken">Action Taken</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="corruption">Corruption</option>
              <option value="misconduct">Misconduct</option>
              <option value="unsafe-environment">Unsafe Environment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <div className="flex space-x-2">
              <input
                type="date"
                className="w-full rounded-lg border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredReports.map((report) => (
            <div key={report.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">#{report.id}</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[report.status]}`}>
                    {STATUS_ICONS[report.status] && <STATUS_ICONS[report.status] className="h-4 w-4 mr-1" />}
                    {report.status.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Category: {report.category.replace('-', ' ').toUpperCase()}
                </p>
                <p className="text-sm text-gray-500">
                  Submitted: {format(new Date(report.submittedAt), 'MMM d, yyyy HH:mm')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-900">Report Details</h2>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="rounded-md text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Report ID</label>
                  <p className="mt-1 text-sm text-gray-900">#{selectedReport.id}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tracking Token</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.trackingToken}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedReport.category.replace('-', ' ').toUpperCase()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Submitted</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {format(new Date(selectedReport.submittedAt), 'PPpp')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReport.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={selectedReport.status}
                    onChange={(e) => handleStatusChange(selectedReport.id, e.target.value)}
                  >
                    <option value="new">New</option>
                    <option value="in-review">In Review</option>
                    <option value="action-taken">Action Taken</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    rows={4}
                    value={selectedReport.adminNotes}
                    onChange={(e) => handleNotesChange(selectedReport.id, e.target.value)}
                    placeholder="Add administrative notes here..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}