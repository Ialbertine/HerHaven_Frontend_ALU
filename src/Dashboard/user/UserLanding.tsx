import { useState, useEffect, useCallback } from "react";
import { Calendar, Heart, CheckCircle, BookOpen, Users } from "lucide-react";
import { getUserAppointments } from "@/apis/appointment";
import { getCurrentUser } from "@/apis/auth";
import DashboardLayout from "@/components/DashboardLayout";
import QuickExitButton from "@/components/QuickExit";
import FeedbackForm from "@/components/FeedbackForm";

interface Stats {
  upcoming: number;
  completed: number;
  total: number;
}

const UserLanding = () => {
  const [stats, setStats] = useState<Stats>({
    upcoming: 0,
    completed: 0,
    total: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    Array<{
      _id: string;
      counselor: {
        firstName: string;
        lastName: string;
        specialization: string;
      };
      appointmentDate: string;
      appointmentTime: string;
      status: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  // Determine guest state using both role and presence of auth token
  const userRole = localStorage.getItem("userRole");
  const accessType = localStorage.getItem("accessType");
  const authToken = localStorage.getItem("token");
  const guestSessionId = localStorage.getItem("guestSessionId");
 // Treat user as guest only when no auth token exists and guest markers are present 
  const isGuest =
    !authToken &&
    (userRole === "guest" || accessType === "guest" || !!guestSessionId);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      if (isGuest) {
        setUserName("Guest");
        setStats({ upcoming: 0, completed: 0, total: 0 });
        setUpcomingAppointments([]);
      } else {
        const user = getCurrentUser();
        if (user) {
          setUserName(user.username || "User");
        }

        // Get upcoming appointments
        const upcomingResponse = await getUserAppointments({ upcoming: true });
        if (upcomingResponse.success && upcomingResponse.data) {
          setUpcomingAppointments(upcomingResponse.data.appointments.slice(0, 3));
        }

        // Get all appointments for stats
        const allResponse = await getUserAppointments({});
        if (allResponse.success && allResponse.data) {
          const appointments = allResponse.data.appointments;
          setStats({
            upcoming: (
              appointments as Array<{ status: string; appointmentDate: string }>
            ).filter(
              (a) =>
                ["pending", "confirmed"].includes(a.status) &&
                new Date(a.appointmentDate) >= new Date()
            ).length,
            completed: (appointments as Array<{ status: string }>).filter(
              (a) => a.status === "completed"
            ).length,
            total: appointments.length,
          });
        }
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <DashboardLayout userType={isGuest ? "guest" : "user"} userName={userName}>
      {loading ? (
        <div className="flex items-center justify-center py-24 min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="space-y-6 min-h-screen">
          {/* Welcome Section */}
          <div className="bg-purple-600 rounded-2xl p-8 text-white">
            <h1 className="text-3xl font-bold mb-2">
              {isGuest ? `Welcome, ${userName}!` : `Welcome Back, ${userName}!`}
            </h1>
            <p className="text-purple-100">
              {isGuest
                ? "You're browsing as a guest. Create an account to unlock all features."
                : "Your safe space for healing and growth"
              }
            </p>
            {isGuest && (
              <div className="mt-4 flex flex-wrap gap-4">
                <button
                  onClick={() => window.location.href = '/signup'}
                  className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Create Account
                </button>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="px-6 py-3 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition-all"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/*Only show for registered users */}
          {!isGuest && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {stats.upcoming}
                  </span>
                </div>
                <h3 className="text-gray-600 font-medium">Upcoming Sessions</h3>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </span>
                </div>
                <h3 className="text-gray-600 font-medium">
                  Completed Sessions
                </h3>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-pink-100 p-3 rounded-lg">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <span className="text-2xl font-bold text-pink-600">
                    {stats.total}
                  </span>
                </div>
                <h3 className="text-gray-600 font-medium">Total Sessions</h3>
              </div>
            </div>
          )}

          {/* Upcoming Appointments */}
          {!isGuest && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  Upcoming Appointments
                </h2>
                <a
                  href="/user/appointment"
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                >
                  View All
                </a>
              </div>
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                          {apt.counselor.firstName?.charAt(0) || "C"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {apt.counselor.firstName} {apt.counselor.lastName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {apt.counselor.specialization}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(apt.appointmentDate)} at{" "}
                            {apt.appointmentTime}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          apt.status
                        )}`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No upcoming appointments</p>
                  <a
                    href="/user/therapy"
                    className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Book a Session
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className={`grid gap-6 ${isGuest ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}>
            {/* Find a Counselor - Only show for registered users */}
            {!isGuest && (
              <a
                href="/user/therapy"
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Find a Counselor
                </h3>
                <p className="text-sm text-gray-600">
                  Browse and book with verified counselors
                </p>
              </a>
            )}

            <a
              href="/user/resources"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Resources</h3>
              <p className="text-sm text-gray-600">
                Access helpful materials and guides
              </p>
            </a>

            <a
              href="/user/community"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Community</h3>
              <p className="text-sm text-gray-600">
                Connect with others on their journey
              </p>
            </a>
          </div>

          {/* Feedback Form */}
          <FeedbackForm />

          {/* Supportive Message */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <Heart className="w-5 h-5 text-purple-600" />
              You're Not Alone
            </h3>
            <p className="text-sm text-gray-600">
              Taking the step to seek support is courageous. Remember, healing
              is a journey, and we're here to support you every step of the
              way.
            </p>
          </div>
        </div>
      )}
      {!loading && <QuickExitButton />}
    </DashboardLayout>
  );
};

export default UserLanding;
