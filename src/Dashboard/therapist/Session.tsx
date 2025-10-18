import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Phone, MessageCircle, Check, X, Search } from 'lucide-react';
import { confirmAppointment, rejectAppointment } from '@/apis/appointment';
import { getAllCounselorAppointments, type Appointment } from '@/apis/counselor';
import { getCurrentUser } from '@/apis/auth';
import DashboardLayout from '@/components/DashboardLayout';

type FilterType = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

const Sessions: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async (): Promise<void> => {
    try {
      setLoading(true);

      // Get current user for username
      const user = getCurrentUser();
      if (user) {
        setUserName(user.username || 'Counselor');
      }

      // Fetch all appointments
      const response = await getAllCounselorAppointments();
      if (response.success && response.data?.appointments) {
        setAppointments(response.data.appointments);
      } else {
        console.error('Failed to load appointments:', response.message);
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId: string): Promise<void> => {
    try {
      console.log('Confirming appointment with ID:', appointmentId);
      const response = await confirmAppointment(appointmentId);
      console.log('Confirm response:', response);
      if (response.success) {
        // Update local state
        const updated = appointments.map(apt =>
          apt._id === appointmentId ? { ...apt, status: 'confirmed' } : apt
        );
        setAppointments(updated);
        alert('Appointment confirmed successfully!');
      } else {
        alert(response.message || 'Failed to confirm appointment');
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert('Failed to confirm appointment');
    }
  };

  const handleReject = async (appointmentId: string): Promise<void> => {
    try {
      const reason = prompt('Please provide a reason for rejection (optional):');
      const response = await rejectAppointment(appointmentId, reason || undefined);
      if (response.success) {
        // Update local state
        const updated = appointments.map(apt =>
          apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt
        );
        setAppointments(updated);
        alert('Appointment rejected successfully!');
      } else {
        alert(response.message || 'Failed to reject appointment');
      }
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      alert('Failed to reject appointment');
    }
  };

  const getInitials = (username: string): string => {
    return username.split(' ').map(n => n[0]).join('');
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || apt.status.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const pendingCount = appointments.filter(a => a.status.toLowerCase() === 'pending').length;

  return (
    <DashboardLayout userType="counselor" userName={userName} notificationCount={8}>
      <div className="space-y-6 min-h-screen">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Sessions & Appointments</h1>
            <p className="text-gray-600 mt-1">
              {pendingCount > 0 ? `${pendingCount} pending request${pendingCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by client name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors relative ${filter === 'pending' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              Pending
              {pendingCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${filter === 'confirmed' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              Confirmed
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {getInitials(appointment.user.username)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">{appointment.user.username}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{appointment.user.email}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-purple-600" />
                        <span>{new Date(appointment.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span>{appointment.time}</span>
                      </div>
                      {appointment.type && (
                        <div className="flex items-center gap-1">
                          {appointment.type === 'video' ? (
                            <Video className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Phone className="w-4 h-4 text-purple-600" />
                          )}
                          <span className="capitalize">{appointment.type}</span>
                        </div>
                      )}
                    </div>
                    {appointment.reason && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Reason:</span> {appointment.reason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 lg:flex-col">
                  {appointment.status.toLowerCase() === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(appointment._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(appointment._id)}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </>
                  )}
                  {appointment.status.toLowerCase() === 'confirmed' && (
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Contact
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No appointments found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sessions;