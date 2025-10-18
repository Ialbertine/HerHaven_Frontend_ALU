import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  getAppointmentStats,
  getAllCounselorAppointments,
  type Appointment,
} from "@/apis/counselor";
import { getCurrentUser } from "@/apis/auth";
import DashboardLayout from "@/components/DashboardLayout";

// Types
interface DashboardStats {
  total: number;
  completed: number;
  pending: number;
  cancelled: number;
}

interface StatCard {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  textColor: string;
}

const TherapyLanding: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setLoading(true);

        // Get current user for username
        const user = getCurrentUser();
        if (user) {
          setUserName(user.username || "Counselor");
        }

        // Fetch appointment stats and all appointments
        const [statsResponse, appointmentsResponse] = await Promise.all([
          getAppointmentStats(),
          getAllCounselorAppointments(),
        ]);

        // Process stats
        if (statsResponse.success && statsResponse.data?.stats) {
          const statsData = statsResponse.data.stats;
          setStats({
            total: statsData.total,
            completed:
              statsData.breakdown.find(
                (item: { _id: string; count: number }) =>
                  item._id === "confirmed"
              )?.count || 0,
            pending: statsData.pending,
            cancelled:
              statsData.breakdown.find(
                (item: { _id: string; count: number }) =>
                  item._id === "cancelled"
              )?.count || 0,
          });
        }

        // Process appointments (limit to 5 most recent)
        if (
          appointmentsResponse.success &&
          appointmentsResponse.data?.appointments
        ) {
          const appointments = appointmentsResponse.data.appointments.slice(
            0,
            5
          );
          console.log("Appointments data:", appointments);
          setAppointments(appointments);
        }
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const statCards: StatCard[] = [
    {
      title: "Total Sessions",
      value: stats.total,
      icon: Calendar,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      title: "Confirmed",
      value: stats.completed,
      icon: CheckCircle,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      title: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  const getStatusStyles = (status: Appointment["status"]): string => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-700";
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-purple-100 text-purple-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      case "ended":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout
      userType="counselor"
      userName={userName}
      notificationCount={8}
    >
      <div className="space-y-6 min-h-screen">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <span className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </span>
                </div>
                <h3 className="text-gray-600 font-medium">{stat.title}</h3>
              </div>
            );
          })}
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Recent Appointments
            </h2>
            <a
              href="/counselor/session"
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              View All
            </a>
          </div>
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                      {apt.firstName && apt.lastName
                        ? `${apt.firstName.charAt(0)}${apt.lastName.charAt(0)}`
                        : apt.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {apt.firstName && apt.lastName
                          ? `${apt.firstName} ${apt.lastName}`
                          : apt.user?.username || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(apt.appointmentDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })} at {apt.appointmentTime}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyles(
                      apt.status
                    )}`}
                  >
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent appointments</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/counselor/schedule"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">
              Update Availability
            </h3>
            <p className="text-sm text-gray-600">Manage your schedule</p>
          </a>

          <a
            href="/counselor/session"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">View Sessions</h3>
            <p className="text-sm text-gray-600">Manage client sessions</p>
          </a>

          <a
            href="/counselor/profile"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all text-left group"
          >
            <div className="bg-pink-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
              <MessageCircle className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-2">Profile</h3>
            <p className="text-sm text-gray-600">Update your profile</p>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TherapyLanding;
