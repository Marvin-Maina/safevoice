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
      applicantType: formData.applicantType,   // <-- ADDED THIS LINE
      email: formData.email,
      phone: formData.phone,
      description: formData.description
    };

    if (formData.applicantType === 'organization') {
      payload.organizationType = formData.organizationType;
      payload.organizationName = formData.organizationName;
    }

    try {
      const response = await fetch('/api/admin-access-request/', {
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
    // ... your existing JSX unchanged ...
  );
};

export default BecomeAdmin;
