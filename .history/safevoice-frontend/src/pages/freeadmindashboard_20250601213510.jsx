import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

export function Dashboard() {
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('/api/reports/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        setReports(response.data);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      }
    };

    fetchReports();
  }, []);

  const newReportsCount = reports.filter((report) => report.status === 'new').length;

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.id.toString().includes(searchTerm) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;

    const submittedDate = new Date(report.submittedAt);
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;

    const matchesDateRange =
      (!startDate || submittedDate >= startDate) && (!endDate || submittedDate <= endDate);

    return matchesSearch && matchesStatus && matchesCategory && matchesDateRange;
  });

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await axios.patch(`/api/reports/${reportId}/`, { status: newStatus }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, status: newStatus } : report
        )
      );
    } catch (error) {
      console.error('Failed to update report status:', error);
    }
  };

  const handleNotesChange = async (reportId, notes) => {
    try {
      await axios.patch(`/api/reports/${reportId}/`, { adminNotes: notes }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      setReports((prevReports) =>
        prevReports.map((report) =>
          report.id === reportId ? { ...report, adminNotes: notes } : report
        )
      );
    } catch (error) {
      console.error('Failed to update admin notes:', error);
    }
  };

  return (
    <div className="grid grid-cols-5 gap-4 p-4">
      {/* Filters Panel */}
      <div className="col-span-1 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="font-semibold text-lg">Filters</h2>
            <Input
              placeholder="Search reports"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="theft">Theft</SelectItem>
                <SelectItem value="harassment">Harassment</SelectItem>
                <SelectItem value="corruption">Corruption</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
              <label className="block text-sm font-medium mt-2">End Date</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Panel */}
      <div className="col-span-4 space-y-4">
        <h2 className="text-2xl font-bold">Dashboard ({newReportsCount} new reports)</h2>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all" onClick={() => setStatusFilter('all')}>
              All Reports
            </TabsTrigger>
            <TabsTrigger value="new" onClick={() => setStatusFilter('new')}>
              New
            </TabsTrigger>
            <TabsTrigger value="in_progress" onClick={() => setStatusFilter('in_progress')}>
              In Progress
            </TabsTrigger>
            <TabsTrigger value="resolved" onClick={() => setStatusFilter('resolved')}>
              Resolved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid grid-cols-2 gap-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="cursor-pointer hover:shadow-md transition" onClick={() => setSelectedReport(report)}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg">Report #{report.id}</h3>
                    <p className="text-sm text-muted-foreground">{report.category}</p>
                    <p className="text-sm mt-2 line-clamp-2">{report.description}</p>
                    <p className="text-xs mt-2 text-right">{new Date(report.submittedAt).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Report Details */}
        {selectedReport && (
          <Card className="mt-6">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Report #{selectedReport.id}</h3>
              <p><strong>Category:</strong> {selectedReport.category}</p>
              <p><strong>Description:</strong> {selectedReport.description}</p>
              <p><strong>Status:</strong> {selectedReport.status}</p>
              <Select value={selectedReport.status} onValueChange={(value) => handleStatusChange(selectedReport.id, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Update Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>

              <div>
                <label className="block font-medium mb-1">Admin Notes</label>
                <Textarea
                  placeholder="Enter notes"
                  value={selectedReport.adminNotes || ''}
                  onChange={(e) => handleNotesChange(selectedReport.id, e.target.value)}
                />
              </div>

              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
