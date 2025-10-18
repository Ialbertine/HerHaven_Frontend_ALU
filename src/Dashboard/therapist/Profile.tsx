import React, { useState, useEffect } from 'react';
import { Mail, Phone, Award, Briefcase, FileText, Edit2, Camera, Save, X, } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { getCounselorProfile, updateCounselorProfile, getAppointmentStats, type Counselor } from '@/apis/counselor';

interface FormData {
  username: string;
  phoneNumber: string;
}

interface SessionStats {
  total: number;
  completed: number;
}

// Removed mock API - using real API calls now

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<Counselor | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({ total: 0, completed: 0 });
  const [formData, setFormData] = useState<FormData>({
    username: '',
    phoneNumber: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async (): Promise<void> => {
    try {
      setLoading(true);

      // Fetch both profile and stats
      const [profileResponse, statsResponse] = await Promise.all([
        getCounselorProfile(),
        getAppointmentStats()
      ]);

      if (profileResponse.success && profileResponse.data?.counselor) {
        const counselorData = profileResponse.data.counselor;
        console.log('📋 Counselor Profile Data:', counselorData);
        setProfile(counselorData);
        setFormData({
          username: counselorData.username,
          phoneNumber: counselorData.phoneNumber
        });
      } else {
        console.error('Failed to load profile:', profileResponse.message);
        alert(profileResponse.message || 'Failed to load profile');
      }

      // Process appointment stats for session count
      if (statsResponse.success && statsResponse.data?.stats) {
        const stats = statsResponse.data.stats;
        console.log('📊 Appointment Stats:', stats);

        // Get completed sessions count
        const completedCount = stats.breakdown.find(
          (item: { _id: string; count: number }) => item._id === 'completed'
        )?.count || 0;

        setSessionStats({
          total: stats.total,
          completed: completedCount
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      alert('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (): Promise<void> => {
    try {
      setUpdating(true);
      const response = await updateCounselorProfile({
        username: formData.username,
        phoneNumber: formData.phoneNumber
      });

      if (response.success && response.data?.counselor) {
        setProfile(response.data.counselor);
        setIsEditing(false);
        alert('Profile updated successfully!');
      } else {
        alert(response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">Failed to load profile</div>
      </div>
    );
  }

  return (
    <DashboardLayout userType="counselor" userName={profile.username || 'Counselor'} notificationCount={8}>
      <div className="space-y-6 min-h-screen">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Profile Overview</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                    {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full text-white hover:bg-purple-700">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mt-4">
                  Dr. {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-gray-600">@{profile.username}</p>

                {profile.isVerified && (
                  <span className="mt-3 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    Verified Counselor
                  </span>
                )}

                <div className="w-full mt-6 pt-6 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Total Appointments</span>
                    <span className="font-semibold text-gray-800">{sessionStats.total}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Completed Sessions</span>
                    <span className="font-semibold text-gray-800">{sessionStats.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Experience</span>
                    <span className="font-semibold text-gray-800">{profile.experience} years</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Professional Information</h3>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    onClick={handleUpdateProfile}
                    disabled={updating}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-4 h-4" />
                    {updating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Mail className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-800">{profile.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Phone</p>
                      <p className="font-medium text-gray-800">{profile.phoneNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Award className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">License Number</p>
                      <p className="font-medium text-gray-800">{profile.licenseNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <Briefcase className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Specialization</p>
                      <p className="font-medium text-gray-800">{profile.specialization}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Bio</p>
                      <p className="text-gray-800">{profile.bio}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;