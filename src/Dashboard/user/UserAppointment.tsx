import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Video,
  Phone,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Trash2,
} from "lucide-react";
import {
  getUserAppointments,
  cancelAppointment,
  getMeetingDetails,
  deleteAppointment,
} from "@/apis/appointment";
import { getCurrentUser } from "@/apis/auth";
import DashboardLayout from "@/components/DashboardLayout";
import EmbeddedMeeting from "@/components/EmbeddedMeeting";
import { useModal } from "@/contexts/useModal";

interface Appointment {
  _id: string;
  counselor: {
    firstName: string;
    lastName: string;
    specialization: string;
    profilePicture?: string;
  };
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  sessionMode: string;
  reason?: string;
  status: string;
  urgencyLevel: string;
  createdAt: string;
  meetingDetails?: {
    meetingUrl: string;
    meetingId: string;
  };
}

const UserAppointments = () => {
  const { showAlert, showDeleteConfirm } = useModal();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState<string | null>(null);
  const [showEmbeddedMeeting, setShowEmbeddedMeeting] = useState<boolean>(false);
  const [currentMeeting, setCurrentMeeting] = useState<{ url: string, id: string } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [userName, setUserName] = useState("");

  // Determine guest state using both role and presence of auth token
  const userRole = localStorage.getItem("userRole");
  const accessType = localStorage.getItem("accessType");
  const authToken = localStorage.getItem("token");
  const guestSessionId = localStorage.getItem("guestSessionId");
  const isGuest =
    !authToken &&
    (userRole === "guest" || accessType === "guest" || !!guestSessionId);

  useEffect(() => {
    if (isGuest) {
      setUserName("Guest");
      setLoading(false);
    } else {
      const user = getCurrentUser();
      if (user) {
        setUserName(user.username || "User");
      }
      loadAppointments();
    }
  }, [isGuest]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await getUserAppointments({});
      if (response.success && response.data) {
        setAppointments(response.data.appointments);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
    setCancelReason("");
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      setActionLoading(true);
      const response = await cancelAppointment(
        selectedAppointment._id,
        cancelReason
      );
      if (response.success) {
        await loadAppointments();
        setShowCancelModal(false);
        showAlert("Appointment cancelled successfully", "Success", "success");
      } else {
        showAlert(response.message || "Failed to cancel appointment", "Error", "danger");
      }
    } catch (error: unknown) {
      console.error("Error cancelling appointment:", error);
      // try to narrow Axios-like error shape
      const axiosErr = error as
        | { response?: { data?: { message?: string } } }
        | undefined;
      showAlert(
        axiosErr?.response?.data?.message || "Failed to cancel appointment",
        "Error",
        "danger"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinMeeting = async (appointmentId: string) => {
    try {
      const response = await getMeetingDetails(appointmentId);
      if (response.success && response.data?.meeting?.meetingUrl) {
        // Show embedded meeting instead of opening in new tab
        setCurrentMeeting({
          url: response.data.meeting.meetingUrl,
          id: response.data.meeting.meetingId
        });
        setShowEmbeddedMeeting(true);
      } else {
        showAlert("Meeting link not available yet", "Info", "info");
      }
    } catch (error) {
      console.error("Error getting meeting details:", error);
      showAlert("Failed to get meeting details", "Error", "danger");
    }
  };

  const handleDeleteAppointment = async (appointmentId: string) => {
    showDeleteConfirm(
      'Are you sure you want to delete this appointment? This action cannot be undone.',
      async () => {
        try {
          setDeletingAppointment(appointmentId);
          const response = await deleteAppointment(appointmentId);
          if (response.success) {
            // Remove from local state
            setAppointments(appointments.filter(apt => apt._id !== appointmentId));
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

  const handleCloseEmbeddedMeeting = (): void => {
    setShowEmbeddedMeeting(false);
    setCurrentMeeting(null);
    setIsFullscreen(false);
  };

  const handleToggleFullscreen = (): void => {
    setIsFullscreen(!isFullscreen);
  };

  const canDelete = (appointment: Appointment) => {
    // Check if appointment time has passed
    const appointmentDateTime = new Date(appointment.appointmentDate);
    if (appointment.appointmentTime) {
      const [hours, minutes] = appointment.appointmentTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);
    }
    const isPast = appointmentDateTime < new Date();

    // can delete if appointment is cancelled, ended, or completed
    if (['cancelled', 'ended', 'completed'].includes(appointment.status)) {
      return true;
    }

    if (appointment.status === 'confirmed' && isPast) {
      return true;
    }

    return false;
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "all") return true;
    if (filter === "upcoming") {
      return (
        ["pending", "confirmed"].includes(apt.status) &&
        new Date(apt.appointmentDate) >= new Date()
      );
    }
    return apt.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "in-progress":
        return "bg-purple-100 text-purple-700";
      case "ended":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "in-progress":
        return <Loader className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const canCancel = (appointment: Appointment) => {
    return ["pending", "confirmed"].includes(appointment.status);
  };

  const canJoin = (appointment: Appointment) => {
    return (
      appointment.status === "in-progress" ||
      (appointment.status === "confirmed" &&
        new Date(appointment.appointmentDate).toDateString() ===
        new Date().toDateString())
    );
  };

  return (
    <DashboardLayout userType={isGuest ? "guest" : "user"} userName={userName}>
      <div className="space-y-6 min-h-screen">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            My Appointments
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage your therapy sessions
          </p>
        </div>

        {isGuest ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Sign in to view your appointments
            </h3>
            <p className="text-gray-500 mb-6">
              Create an account or sign in to access and manage your therapy sessions.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/signup'}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Create Account
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="px-6 py-3 bg-white text-purple-600 border-2 border-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("upcoming")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "upcoming"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "pending"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilter("confirmed")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "confirmed"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === "completed"
                  ? "bg-purple-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
              >
                Completed
              </button>
            </div>

            {/* Appointments List */}
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {appointment.counselor.profilePicture ? (
                        <img
                          src={appointment.counselor.profilePicture}
                          alt={`${appointment.counselor.firstName} ${appointment.counselor.lastName}`}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {appointment.counselor.firstName.charAt(0)}
                          {appointment.counselor.lastName.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-gray-800">
                            {appointment.counselor.firstName}{" "}
                            {appointment.counselor.lastName}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {getStatusIcon(appointment.status)}
                            {appointment.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {appointment.counselor.specialization}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span>
                              {formatDate(appointment.appointmentDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span>
                              {appointment.appointmentTime} (
                              {appointment.duration} min)
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {appointment.sessionMode === "video" ? (
                              <Video className="w-4 h-4 text-purple-600" />
                            ) : (
                              <Phone className="w-4 h-4 text-purple-600" />
                            )}
                            <span className="capitalize">
                              {appointment.sessionMode}
                            </span>
                          </div>
                        </div>

                        {appointment.reason && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Reason:</span>{" "}
                              {appointment.reason}
                            </p>
                          </div>
                        )}

                        {appointment.status === "pending" && (
                          <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-700">
                              Waiting for counselor confirmation. You'll be
                              notified once confirmed.
                            </p>
                          </div>
                        )}

                        {appointment.status === "confirmed" && (
                          <div className="mt-3 flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-green-700">
                              Your appointment is confirmed! You can join 10
                              minutes before the scheduled time.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 lg:flex-col">
                      {canJoin(appointment) && (
                        <button
                          onClick={() => handleJoinMeeting(appointment._id)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Video className="w-4 h-4" />
                          Join Session
                        </button>
                      )}

                      {canCancel(appointment) && (
                        <button
                          onClick={() => openCancelModal(appointment)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Cancel
                        </button>
                      )}

                      {appointment.status === "completed" && (
                        <span className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </span>
                      )}

                      {canDelete(appointment) && (
                        <button
                          onClick={() => handleDeleteAppointment(appointment._id)}
                          disabled={deletingAppointment === appointment._id}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deletingAppointment === appointment._id ? 'Deleting...' : 'Delete'}
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
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No appointments found
                </h3>
                <p className="text-gray-500 mb-4">
                  Start your healing journey today
                </p>
                <a
                  href="/user/therapy"
                  className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Book a Session
                </a>
              </div>
            )}

            {/* Cancel Modal */}
            {showCancelModal && selectedAppointment && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowCancelModal(false)}
              >
                <div
                  className="bg-white rounded-xl max-w-2xl w-full p-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Cancel Appointment
                    </h2>
                    <button
                      onClick={() => setShowCancelModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm text-amber-800">
                        <strong>Note:</strong> Appointments cannot be cancelled
                        less than 2 hours before the scheduled time.
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">
                        Counselor: {selectedAppointment.counselor.firstName}{" "}
                        {selectedAppointment.counselor.lastName}
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        Date: {formatDate(selectedAppointment.appointmentDate)}{" "}
                        at {selectedAppointment.appointmentTime}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Cancellation (Optional)
                      </label>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Let us know why you're cancelling..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowCancelModal(false)}
                        className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                      >
                        Keep Appointment
                      </button>
                      <button
                        onClick={handleCancelAppointment}
                        disabled={actionLoading}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? "Cancelling..." : "Cancel Appointment"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      {/* Embedded Meeting Component */}
      {showEmbeddedMeeting && currentMeeting && (
        <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${isFullscreen ? 'p-0' : ''}`}>
          <div className={`${isFullscreen ? 'w-full h-full' : 'w-full max-w-4xl h-[80vh]'}`}>
            <EmbeddedMeeting
              meetingUrl={currentMeeting.url}
              meetingId={currentMeeting.id}
              onMeetingEnd={handleCloseEmbeddedMeeting}
              isFullscreen={isFullscreen}
              onToggleFullscreen={handleToggleFullscreen}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserAppointments;
