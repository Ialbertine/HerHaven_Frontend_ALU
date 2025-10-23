import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Video, Phone, Check, X, Search, Play, ExternalLink, Copy, CheckCircle, Trash2, AlertCircle } from 'lucide-react';
import { confirmAppointment, rejectAppointment, startSession, endSession, cancelAppointment, deleteAppointment } from '@/apis/appointment';
import { getAllCounselorAppointments, type Appointment } from '@/apis/counselor';
import { getCurrentUser } from '@/apis/auth';
import DashboardLayout from '@/components/DashboardLayout';
import EmbeddedMeeting from '@/components/EmbeddedMeeting';
import { useModal } from '@/contexts/useModal';

type FilterType = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'ended';

const Sessions: React.FC = () => {
  const { showAlert, showConfirm, showDeleteConfirm } = useModal();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [userName, setUserName] = useState('');
  const [startingSession, setStartingSession] = useState<string | null>(null);
  const [showMeetingModal, setShowMeetingModal] = useState<boolean>(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Appointment | null>(null);
  const [endingSession, setEndingSession] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [markingAsEnded, setMarkingAsEnded] = useState<string | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<string | null>(null);
  const [showEmbeddedMeeting, setShowEmbeddedMeeting] = useState<boolean>(false);
  const [currentMeeting, setCurrentMeeting] = useState<{ url: string, id: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async (): Promise<void> => {
    try {
      setLoading(true);
      const user = getCurrentUser();
      if (user) {
        setUserName(user.username || 'Counselor');
      }
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
      const response = await confirmAppointment(appointmentId);
      if (response.success) {
        const updated = appointments.map(apt =>
          apt._id === appointmentId ? { ...apt, status: 'confirmed' } : apt
        );
        setAppointments(updated);
        showAlert('Appointment confirmed successfully!', 'Success', 'success');
      } else {
        showAlert(response.message || 'Failed to confirm appointment', 'Error', 'danger');
      }
    } catch (error) {
      console.error('Error confirming appointment:', error);
      showAlert('Failed to confirm appointment', 'Error', 'danger');
    }
  };

  const handleReject = async (appointmentId: string): Promise<void> => {
    showConfirm(
      'Please provide a reason for rejection (optional):',
      async () => {
        try {
          const response = await rejectAppointment(appointmentId, undefined);
          if (response.success) {
            const updated = appointments.map(apt =>
              apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt
            );
            setAppointments(updated);
            showAlert('Appointment rejected successfully!', 'Success', 'success');
          } else {
            showAlert(response.message || 'Failed to reject appointment', 'Error', 'danger');
          }
        } catch (error) {
          console.error('Error rejecting appointment:', error);
          showAlert('Failed to reject appointment', 'Error', 'danger');
        }
      },
      'Reject Appointment',
      'warning'
    );
  };

  const handleStartSession = async (appointmentId: string): Promise<void> => {
    try {
      setStartingSession(appointmentId);
      const response = await startSession(appointmentId);
      if (response.success && response.data?.meetingDetails) {
        const meetingDetails = {
          meetingId: response.data.meetingDetails.meetingId,
          meetingUrl: response.data.meetingDetails.meetingUrl,
          roomName: '',
          startTime: response.data.meetingDetails.startTime || new Date().toISOString(),
          duration: 60
        };
        const updated = appointments.map(apt =>
          apt._id === appointmentId
            ? { ...apt, status: 'in-progress', meetingDetails }
            : apt
        );
        setAppointments(updated);

        // Instead of opening in new tab, show embedded meeting
        setCurrentMeeting({
          url: response.data.meetingDetails.meetingUrl,
          id: response.data.meetingDetails.meetingId
        });
        setShowEmbeddedMeeting(true);
        showAlert('Session started! Meeting is now available in the platform. User has been notified.', 'Success', 'success');
      } else {
        showAlert(response.message || 'Failed to start session', 'Error', 'danger');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      showAlert('Failed to start session', 'Error', 'danger');
    } finally {
      setStartingSession(null);
    }
  };

  const handleJoinMeeting = (appointment: Appointment): void => {
    if (appointment.meetingDetails?.meetingUrl) {
      // Show embedded meeting instead of modal
      setCurrentMeeting({
        url: appointment.meetingDetails.meetingUrl,
        id: appointment.meetingDetails.meetingId
      });
      setShowEmbeddedMeeting(true);
    } else {
      // Fallback to modal if no meeting details
      setSelectedMeeting(appointment);
      setShowMeetingModal(true);
      setCopied(false);
    }
  };

  const handleEndSession = async (): Promise<void> => {
    if (!selectedMeeting) return;
    const notes = prompt('Add session notes (optional):');
    try {
      setEndingSession(true);
      const response = await endSession(selectedMeeting._id, notes || undefined);
      if (response.success) {
        const updated = appointments.map(apt =>
          apt._id === selectedMeeting._id ? { ...apt, status: 'completed' } : apt
        );
        setAppointments(updated);
        setShowMeetingModal(false);
        setSelectedMeeting(null);
        showAlert('Session ended successfully!', 'Success', 'success');
      } else {
        showAlert(response.message || 'Failed to end session', 'Error', 'danger');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      showAlert('Failed to end session', 'Error', 'danger');
    } finally {
      setEndingSession(false);
    }
  };

  const handleEndEmbeddedMeeting = async (): Promise<void> => {
    if (!currentMeeting) return;
    const notes = prompt('Add session notes (optional):');
    try {
      setEndingSession(true);
      // Find the appointment that matches the current meeting
      const appointment = appointments.find(apt =>
        apt.meetingDetails?.meetingId === currentMeeting.id
      );

      if (appointment) {
        const response = await endSession(appointment._id, notes || undefined);
        if (response.success) {
          const updated = appointments.map(apt =>
            apt._id === appointment._id ? { ...apt, status: 'completed' } : apt
          );
          setAppointments(updated);
          setShowEmbeddedMeeting(false);
          setCurrentMeeting(null);
          setIsFullscreen(false);
          showAlert('Session ended successfully!', 'Success', 'success');
        } else {
          showAlert(response.message || 'Failed to end session', 'Error', 'danger');
        }
      }
    } catch (error) {
      console.error('Error ending session:', error);
      showAlert('Failed to end session', 'Error', 'danger');
    } finally {
      setEndingSession(false);
    }
  };

  const handleToggleFullscreen = (): void => {
    setIsFullscreen(!isFullscreen);
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      showAlert('Failed to copy link', 'Error', 'danger');
    }
  };

  const handleMarkAsEnded = async (appointmentId: string): Promise<void> => {
    showConfirm(
      'Mark this appointment as ended? This appointment was not completed.',
      async () => {
        try {
          setMarkingAsEnded(appointmentId);
          const response = await cancelAppointment(appointmentId, 'Appointment not attended - marked as ended');
          if (response.success) {
            // Backend sets it to 'cancelled', so reflect that in UI
            const updated = appointments.map(apt =>
              apt._id === appointmentId ? { ...apt, status: 'cancelled' } : apt
            );
            setAppointments(updated);
            showAlert('Appointment marked as ended', 'Success', 'success');
          } else {
            showAlert(response.message || 'Failed to mark as ended', 'Error', 'danger');
          }
        } catch (error) {
          console.error('Error marking as ended:', error);
          showAlert('Failed to mark as ended', 'Error', 'danger');
        } finally {
          setMarkingAsEnded(null);
        }
      },
      'Mark as Ended',
      'warning'
    );
  };

  const handleDeleteAppointment = async (appointmentId: string): Promise<void> => {
    showDeleteConfirm(
      'Are you sure you want to delete this appointment? This action cannot be undone.',
      async () => {
        try {
          setDeletingAppointment(appointmentId);
          const response = await deleteAppointment(appointmentId);
          if (response.success) {
            const updated = appointments.filter(apt => apt._id !== appointmentId);
            setAppointments(updated);
            showAlert('Appointment deleted successfully', 'Success', 'success');
          } else {
            showAlert(response.message || 'Failed to delete appointment', 'Error', 'danger');
          }
        } catch (error) {
          console.error('Error deleting appointment:', error);
          showAlert('Failed to delete appointment', 'Error', 'danger');
        } finally {
          setDeletingAppointment(null);
        }
      }
    );
  };

  const canDelete = (appointment: Appointment): boolean => {
    // Check if appointment time has passed
    const appointmentDateTime = new Date(appointment.appointmentDate);
    if (appointment.appointmentTime) {
      const [hours, minutes] = appointment.appointmentTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
    }
    const isPast = appointmentDateTime < new Date();

    // Can delete if:
    // 1. Appointment is in the past (cancelled, ended, completed, or confirmed that passed)
    // 2. Cannot delete upcoming pending or confirmed appointments
    if (['cancelled', 'ended', 'completed'].includes(appointment.status.toLowerCase())) {
      return true; // Can always delete these statuses
    }

    if (appointment.status.toLowerCase() === 'confirmed' && isPast) {
      return true; // Can delete confirmed appointments that have passed
    }

    return false; // Cannot delete upcoming or in-progress appointments
  };

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-purple-100 text-purple-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'ended': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isAppointmentInPast = (appointmentDate: string, appointmentTime: string): boolean => {
    try {
      const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
      return appointmentDateTime < new Date();
    } catch {
      return false;
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const fullName = `${apt.firstName || ''} ${apt.lastName || ''}`.toLowerCase();
    const phoneNumber = apt.phoneNumber || '';
    const email = apt.user?.email || '';
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phoneNumber.toLowerCase().includes(searchTerm.toLowerCase());
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
    <DashboardLayout userType="counselor" userName={userName}>
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
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-3 rounded-lg font-medium transition-colors relative ${filter === 'pending' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
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
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${filter === 'confirmed' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              Confirmed
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mode</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {appointment.firstName && appointment.lastName
                            ? getInitials(appointment.firstName, appointment.lastName)
                            : appointment.user?.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {appointment.firstName && appointment.lastName
                              ? `${appointment.firstName} ${appointment.lastName}`
                              : appointment.user?.username || 'Unknown User'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-700">{appointment.user?.email || 'No email'}</p>
                        {appointment.phoneNumber && (
                          <p className="text-gray-500">{appointment.phoneNumber}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-gray-700">
                          <Calendar className="w-4 h-4 text-purple-600" />
                          <span>{new Date(appointment.appointmentDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 mt-1">
                          <Clock className="w-4 h-4 text-purple-600" />
                          <span>{appointment.appointmentTime}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {appointment.sessionMode && (
                        <div className="flex items-center gap-2">
                          {appointment.sessionMode === 'video' ? (
                            <Video className="w-4 h-4 text-purple-600" />
                          ) : (
                            <Phone className="w-4 h-4 text-purple-600" />
                          )}
                          <span className="text-sm text-gray-700 capitalize">{appointment.sessionMode}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 max-w-xs truncate" title={appointment.reason || 'N/A'}>
                        {appointment.reason || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex gap-2 justify-end">
                        {appointment.status.toLowerCase() === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(appointment._id)}
                              className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(appointment._id)}
                              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {appointment.status.toLowerCase() === 'confirmed' && (
                          <>
                            {isAppointmentInPast(appointment.appointmentDate, appointment.appointmentTime) ? (
                              <button
                                onClick={() => handleMarkAsEnded(appointment._id)}
                                disabled={markingAsEnded === appointment._id}
                                className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Mark as Ended"
                              >
                                <AlertCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartSession(appointment._id)}
                                disabled={startingSession === appointment._id}
                                className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Start Session"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                        {appointment.status.toLowerCase() === 'in-progress' && (
                          <button
                            onClick={() => handleJoinMeeting(appointment)}
                            className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
                            title="Join Meeting"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                        {canDelete(appointment) && (
                          <button
                            onClick={() => handleDeleteAppointment(appointment._id)}
                            disabled={deletingAppointment === appointment._id}
                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No appointments found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Meeting Details Modal */}
        {showMeetingModal && selectedMeeting && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowMeetingModal(false)}
          >
            <div
              className="bg-white rounded-xl max-w-2xl w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Meeting Details</h2>
                <button
                  onClick={() => setShowMeetingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedMeeting.firstName && selectedMeeting.lastName
                      ? getInitials(selectedMeeting.firstName, selectedMeeting.lastName)
                      : selectedMeeting.user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {selectedMeeting.firstName && selectedMeeting.lastName
                        ? `${selectedMeeting.firstName} ${selectedMeeting.lastName}`
                        : selectedMeeting.user?.username || 'Unknown User'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedMeeting.user?.email || 'No email'}
                      {selectedMeeting.phoneNumber && ` • ${selectedMeeting.phoneNumber}`}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>{new Date(selectedMeeting.appointmentDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <span>{selectedMeeting.appointmentTime}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={selectedMeeting.meetingDetails?.meetingUrl || ''}
                      readOnly
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(selectedMeeting.meetingDetails?.meetingUrl || '')}
                      className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      {copied ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <p className="text-xs text-green-600 mt-1">Link copied to clipboard!</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting ID
                  </label>
                  <input
                    type="text"
                    value={selectedMeeting.meetingDetails?.meetingId || ''}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                  />
                </div>

                {selectedMeeting.reason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Reason
                    </label>
                    <p className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm">
                      {selectedMeeting.reason}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => window.open(selectedMeeting.meetingDetails?.meetingUrl, '_blank')}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Open Meeting
                  </button>
                  <button
                    onClick={handleEndSession}
                    disabled={endingSession}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="w-5 h-5" />
                    {endingSession ? 'Ending...' : 'End Session'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Embedded Meeting Component */}
        {showEmbeddedMeeting && currentMeeting && (
          <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${isFullscreen ? 'p-0' : ''}`}>
            <div className={`${isFullscreen ? 'w-full h-full' : 'w-full max-w-4xl h-[80vh]'}`}>
              <EmbeddedMeeting
                meetingUrl={currentMeeting.url}
                meetingId={currentMeeting.id}
                onMeetingEnd={handleEndEmbeddedMeeting}
                isFullscreen={isFullscreen}
                onToggleFullscreen={handleToggleFullscreen}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sessions;