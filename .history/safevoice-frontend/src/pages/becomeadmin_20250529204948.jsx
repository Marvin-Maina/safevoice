import React, { useState } from 'react';
import { Building2, Shield } from 'lucide-react';

const BecomeAdmin = () => {
  const [formData, setFormData] = useState({
    applicantType: 'single', // default to single admin
    organizationType: '',
    organizationName: '',
    email: '',
    phone: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔧 Build the payload with applicantType included
    const payload = {
      applicantType: formData.applicantType,
      email: formData.email,
      phone: formData.phone,
      description: formData.description
    };

    if (formData.applicantType === 'organization') {
      payload.organizationType = formData.organizationType;
      payload.organizationName = formData.organizationName;
    }

    try {
      const response = await fetch('/api/accounts/admin-access-request/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}` // 🔐 JWT from storage
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Submission failed');

      const data = await response.json();
      console.log('Success:', data);
      alert('Application submitted successfully!');

      // Reset form
      setFormData({
        applicantType: 'single',
        organizationType: '',
        organizationName: '',
        email: '',
        phone: '',
        description: ''
      });

    } catch (error) {
      console.error(error);
      alert('Oops, something went wrong. Try again.');
    }
  };

  return (
    <div className="pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#111327] p-8 rounded-lg">
          <h2 className="text-2xl font-semibold mb-6 flex items-center">
            <Building2 className="w-6 h-6 mr-2 text-blue-400" />
            Application Form
          </h2>

          {/* Applicant type toggle */}
          <div className="mb-6 flex space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="applicantType"
                value="single"
                checked={formData.applicantType === 'single'}
                onChange={handleChange}
                className="form-radio text-blue-500"
              />
              <span>Single Admin</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="applicantType"
                value="organization"
                checked={formData.applicantType === 'organization'}
                onChange={handleChange}
                className="form-radio text-blue-500"
              />
              <span>Organization</span>
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Org-only fields */}
            {formData.applicantType === 'organization' && (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="organizationType">
                    Organization Type
                  </label>
                  <select
                    id="organizationType"
                    name="organizationType"
                    value={formData.organizationType}
                    onChange={handleChange}
                    className="w-full bg-[#0a0c1b] border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select type</option>
                    <option value="education">Educational Institution</option>
                    <option value="corporate">Corporate Organization</option>
                    <option value="government">Government Agency</option>
                    <option value="nonprofit">Non-profit Organization</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" htmlFor="organizationName">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="w-full bg-[#0a0c1b] border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            {/* Common fields */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="email">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#0a0c1b] border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" htmlFor="phone">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#0a0c1b] border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="description">
                Why do you want to implement SafeVoice?
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full bg-[#0a0c1b] border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors duration-300 flex items-center"
              >
                Submit Application
                <Shield className="ml-2 h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BecomeAdmin;
