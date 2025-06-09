import React, { useState } from 'react';
import { FileUp, Send, Loader2, CheckCircle, XCircle, Shield, AlertTriangle, Upload, Star } from 'lucide-react';
import axios from 'axios';
const SubmitReport = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'abuse',
    description: '',
    file_upload: null,
    priority_flag: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isPremiumUser, setIsPremiumUser] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    { value: 'abuse', label: 'Abuse', icon: Shield },
    { value: 'corruption', label: 'Corruption', icon: AlertTriangle },
    { value: 'harassment', label: 'Harassment', icon: XCircle },
    { value: 'other', label: 'Other', icon: FileUp },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : (type === 'file' ? files[0] : value),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        file_upload: file,
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setFormData((prevData) => ({
          ...prevData,
          file_upload: file,
        }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('description', formData.description);
    if (formData.file_upload) {
      formDataToSend.append('file_upload', formData.file_upload);
    }
    formDataToSend.append('priority_flag', formData.priority_flag);

    try {
      // Replace '/api/reports/submit/' with your actual backend API endpoint
      const response = await axios.post('/api/reports/submit/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for file uploads
          // Include authorization token if your API requires it
          // Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.status === 201 || response.status === 200) {
        setMessage({ type: 'success', text: 'Report submitted successfully!' });
        setFormData({ // Reset form after successful submission
          title: '',
          category: 'abuse',
          description: '',
          file_upload: null,
          priority_flag: false,
        });
      } else {
        setMessage({ type: 'error', text: `Submission failed: ${response.data.detail || 'Unknown error'}` });
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setMessage({
        type: 'error',
        text: `Error submitting report: ${error.response?.data?.detail || error.message || 'Please try again.'}`
      });
    } finally {
      setLoading(false);
      
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    }
  };

  const selectedCategory = categories.find(cat => cat.value === formData.category);
  const CategoryIcon = selectedCategory?.icon || FileUp;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)",
          backgroundSize: "20px 20px"
        }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700/50 ring-1 ring-white/10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              Submit Report
            </h2>
            <p className="text-slate-400">Help make your community safer</p>
          </div>

          <div className="space-y-6">
            <div className="group">
              <label htmlFor="title" className="block text-sm font-semibold text-slate-300 mb-3">
                Report Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 group-hover:border-slate-500"
                placeholder="e.g., Illegal dumping in Central Park"
              />
            </div>

            <div className="group">
              <label htmlFor="category" className="block text-sm font-semibold text-slate-300 mb-3">
                Category
              </label>
              <div className="relative">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pl-12 bg-slate-800/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer group-hover:border-slate-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <CategoryIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                <div className="absolute right-4 top-3.5 pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="group">
              <label htmlFor="description" className="block text-sm font-semibold text-slate-300 mb-3">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                required
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-y group-hover:border-slate-500"
                placeholder="Provide a detailed description of the incident, including when and where it occurred..."
              />
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-slate-300 mb-3">
                Upload Evidence (Optional)
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 cursor-pointer group-hover:border-slate-500 ${
                  dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 bg-slate-800/30'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file_upload').click()}
              >
                <input
                  type="file"
                  id="file_upload"
                  name="file_upload"
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="hidden"
                />
                <div className="text-center">
                  {formData.file_upload ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{formData.file_upload.name}</p>
                        <p className="text-slate-400 text-sm">Click to change file</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <div className="p-3 bg-slate-700/50 rounded-xl">
                          <Upload className="h-8 w-8 text-slate-400" />
                        </div>
                      </div>
                      <div>
                        <p className="text-white font-medium">Drop files here or click to upload</p>
                        <p className="text-slate-400 text-sm">Images and videos only</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="group">
              <div className={`flex items-center p-4 rounded-xl border transition-all duration-300 ${
                isPremiumUser 
                  ? 'border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20' 
                  : 'border-slate-600 bg-slate-800/30'
              }`}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="priority_flag"
                    name="priority_flag"
                    checked={formData.priority_flag}
                    onChange={handleChange}
                    disabled={!isPremiumUser}
                    className={`h-5 w-5 rounded border-2 transition-all duration-300 ${
                      isPremiumUser 
                        ? 'text-amber-500 bg-transparent border-amber-500 focus:ring-amber-500' 
                        : 'text-slate-500 bg-slate-700 border-slate-600 cursor-not-allowed'
                    }`}
                  />
                  <label 
                    htmlFor="priority_flag" 
                    className={`ml-3 font-medium flex items-center space-x-2 ${
                      isPremiumUser ? 'text-white cursor-pointer' : 'text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <span>Mark as Priority</span>
                    <Star className={`h-4 w-4 ${isPremiumUser ? 'text-amber-400' : 'text-slate-500'}`} />
                  </label>
                </div>
                {isPremiumUser && (
                  <div className="ml-auto">
                    <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full">
                      PREMIUM
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                onClick={handleSubmit}
                className={`w-full px-6 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-3 ${
                  loading
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Submitting Report...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Report</span>
                    <Send className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>

            {message.type && (
              <div
                className={`p-4 rounded-xl flex items-center space-x-3 transition-all duration-300 ${
                  message.type === 'success' 
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                <div className={`p-1 rounded-full ${
                  message.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {message.type === 'success' ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                </div>
                <p className="font-medium">{message.text}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitReport;