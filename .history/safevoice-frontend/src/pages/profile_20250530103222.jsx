import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { UserCircle, Mail, Briefcase, Award, Loader2, AlertCircle } from 'lucide-react'; // Icons for profile elements

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

        const response = await axios.get('http://localhost:8000/api/profile/', {
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
        <div className="flex items-center space-x-2 text-blue-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
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
    <div className="min-h-screen bg-[#0a0c1b] p-8 pt-24 flex justify-center items-start"> {/* Added pt-24 to push content below navbar */}
      <div className="max-w-md w-full bg-[#111327] rounded-xl p-8 shadow-2xl backdrop-blur-sm backdrop-filter space-y-6">
        <div className="flex flex-col items-center space-y-4">
          {/* Profile Photo - Placeholder */}
          <div className="relative w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-blue-500">
            {/* You would replace this with an actual image, e.g., <img src={profileData.profile_photo_url} alt="Profile" /> */}
            <UserCircle className="w-16 h-16 text-gray-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">{profileData?.username}</h1>
        </div>

        <div className="space-y-4 text-gray-300">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-blue-400" />
            <p>Email: {profileData?.email}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Briefcase className="h-5 w-5 text-blue-400" />
            <p>Role: {profileData?.role ? profileData.role.charAt(0).toUpperCase() + profileData.role.slice(1) : 'N/A'}</p>
          </div>
          <div className="flex items-center space-x-3">
            <Award className="h-5 w-5 text-blue-400" />
            <p>Tier: {profileData?.plan ? profileData.plan.charAt(0).toUpperCase() + profileData.plan.slice(1) : 'N/A'}</p>
          </div>
          {/* You can add more profile details here based on your User model and what you want to display */}
        </div>

        {/* Example: A button to edit profile or change password - functionality not included */}
        <div className="pt-4 border-t border-blue-900/20">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors duration-300">
            Edit Profile (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;