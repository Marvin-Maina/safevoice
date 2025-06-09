import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserCircle, Mail, Briefcase, Award, Loader2, AlertCircle } from 'lucide-react'; // Icons for profile elements
import { Link } from 'react-router-dom';

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          setError('No access token found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:8000/api/accounts/profile/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setProfileData(response.data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError('Could not load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-400 h-16 w-16" />
        <p className="text-white text-xl ml-4">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0c1b] flex items-center justify-center p-6">
        <div className="bg-red-500/20 text-red-300 p-6 rounded-2xl flex items-center gap-3 border border-red-500/30">
          <AlertCircle className="h-6 w-6" />
          <span className="text-lg">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-600/10 rounded-full filter blur-3xl animate-pulse animation-duration-7000"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full filter blur-3xl animate-pulse animation-delay-2000 animation-duration-8000"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" aria-hidden="true"></div>

      <div className="relative z-10 w-full max-w-md bg-gray-800/70 rounded-3xl shadow-2xl p-8 border border-blue-600/30 backdrop-blur-xl text-center">
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 bg-gray-700/50 rounded-full mb-4 border border-blue-500/30">
            <UserCircle className="w-16 h-16 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">{profileData?.username}</h1>
        </div>

        <div className="space-y-4 text-gray-300">
          {/* Removed Email Display as per request */}
          {/*
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-blue-400" />
            <p>Email: {profileData?.email}</p>
          </div>
          */}
          <div className="flex items-center space-x-3 justify-center">
            <Briefcase className="h-5 w-5 text-blue-400" />
            <p>Role: {profileData?.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : 'N/A'}</p>
          </div>
          <div className="flex items-center space-x-3 justify-center">
            <Award className="h-5 w-5 text-blue-400" />
            <p>Tier: {profileData?.plan ? profileData.plan.charAt(0).toUpperCase() + profileData.plan.slice(1) : 'N/A'}</p>
          </div>
          {/* You can add more profile details here based on your User model and what you want to display */}
        </div>

        {/* Example: A button to edit profile or change password - functionality not included */}
        <div className="pt-8 mt-8 border-t border-blue-900/20">
          <Link
            to="/edit-profile" // This route would need to be defined in your App.js
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;