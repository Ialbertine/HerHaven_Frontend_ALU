import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Users,
  Heart,
  ArrowUp,
  ArrowDown,
  Calendar,
  UserPlus,
  UserCheck,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react";
import { getAdminStats, getAnalyticsSummary } from "@/apis/admin";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${className}`}
  >
    {children}
  </div>
);

interface StatCardData {
  label: string;
  value: string | number;
  icon: React.ElementType;
  isPositive?: boolean;
}

const StatCard: React.FC<StatCardData> = ({
  label,
  value,
  icon: Icon,
  isPositive,
}) => (
  <Card>
    <div className="flex items-start justify-between mb-4">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
        <Icon className="w-4 h-4 text-white" />
      </div>
      {isPositive !== undefined && (
        <span
          className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? "text-green-600" : "text-red-600"
            }`}
        >
          {isPositive ? (
            <ArrowUp className="w-4 h-4" />
          ) : (
            <ArrowDown className="w-4 h-4" />
          )}
        </span>
      )}
    </div>
    <h3 className="text-sm text-gray-600 mb-1">{label}</h3>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </Card>
);

const UserGrowthChart: React.FC<{
  growthData?: Array<{
    month: string;
    users: number;
    counselors: number;
    sessions: number;
  }>;
}> = ({ growthData }) => {
  // Use real data from API if available, otherwise show message
  if (!growthData || growthData.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-2">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Growth Trends
            </h3>
            <p className="text-sm text-gray-500">Last 6 months</p>
          </div>
          <Activity className="w-5 h-5 text-purple-500" />
        </div>
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No historical data available yet</p>
            <p className="text-sm">Data will appear as users grow over time</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Growth Trends</h3>
          <p className="text-sm text-gray-500">
            Last {growthData.length} months
          </p>
        </div>
        <Activity className="w-5 h-5 text-purple-500" />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={growthData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#9c27b0" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorCounselors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "14px" }} iconType="circle" />
          <Area
            type="monotone"
            dataKey="users"
            stroke="#9c27b0"
            fillOpacity={1}
            fill="url(#colorUsers)"
            strokeWidth={2}
            name="Users"
          />
          <Area
            type="monotone"
            dataKey="counselors"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorCounselors)"
            strokeWidth={2}
            name="Counselors"
          />
          <Area
            type="monotone"
            dataKey="sessions"
            stroke="#10b981"
            fillOpacity={1}
            fill="url(#colorSessions)"
            strokeWidth={2}
            name="Sessions"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};

const CounselorStatusChart: React.FC<{
  verified: number;
  pending: number;
  total: number;
}> = ({ verified, pending, total }) => {
  const data = [
    { name: "Verified", value: verified, color: "#10b981" },
    { name: "Pending", value: pending, color: "#f59e0b" },
    { name: "Invited", value: total - verified - pending, color: "#6366f1" },
  ];

  const COLORS = ["#10b981", "#f59e0b", "#6366f1"];

  return (
    <Card className="col-span-1 lg:col-span-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Counselor Status
          </h3>
          <p className="text-sm text-gray-500">Distribution</p>
        </div>
        <BarChart3 className="w-5 h-5 text-purple-500" />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={true}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "14px" }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-gray-600">{item.name}</span>
            </div>
            <span className="font-semibold text-gray-800">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const ActivityBarChart: React.FC<{
  activityData?: Array<{
    month: string;
    appointments: number;
    newUsers: number;
    activeCounselors: number;
  }>;
}> = ({ activityData }) => {
  // Use real data from API if available, otherwise show message
  if (!activityData || activityData.length === 0) {
    return (
      <Card className="col-span-1 lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Platform Activity
            </h3>
            <p className="text-sm text-gray-500">Monthly overview</p>
          </div>
          <TrendingUp className="w-5 h-5 text-purple-500" />
        </div>
        <div className="flex items-center justify-center h-[300px] text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No activity data available yet</p>
            <p className="text-sm">
              Activity data will appear as platform usage grows
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="col-span-1 lg:col-span-3">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Platform Activity
          </h3>
          <p className="text-sm text-gray-500">
            Monthly overview ({activityData.length} months)
          </p>
        </div>
        <TrendingUp className="w-5 h-5 text-purple-500" />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={activityData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="month"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
          />
          <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "12px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "14px" }} iconType="circle" />
          <Bar
            dataKey="appointments"
            fill="#9c27b0"
            radius={[8, 8, 0, 0]}
            name="Appointments"
          />
          <Bar
            dataKey="newUsers"
            fill="#3b82f6"
            radius={[8, 8, 0, 0]}
            name="New Users"
          />
          <Bar
            dataKey="activeCounselors"
            fill="#10b981"
            radius={[8, 8, 0, 0]}
            name="Active Counselors"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

const AdminLanding: React.FC = () => {
  const [stats, setStats] = useState<StatCardData[]>([]);
  const [rawData, setRawData] = useState<{
    totalUsers: number;
    verifiedCounselors: number;
    totalCounselors: number;
    pendingCounselors: number;
    growthTrends?: Array<{
      month: string;
      users: number;
      counselors: number;
      sessions: number;
    }>;
    activityData?: Array<{
      month: string;
      appointments: number;
      newUsers: number;
      activeCounselors: number;
    }>;
  }>({
    totalUsers: 0,
    verifiedCounselors: 0,
    totalCounselors: 0,
    pendingCounselors: 0,
    growthTrends: [],
    activityData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch both stats and analytics data
        const [statsResponse, analyticsResponse] = await Promise.all([
          getAdminStats(),
          getAnalyticsSummary(),
        ]);

        // Helper function to format month from YYYY-MM to short month name
        const formatMonth = (yearMonth: string) => {
          const [year, month] = yearMonth.split("-");
          const date = new Date(parseInt(year), parseInt(month) - 1);
          return date.toLocaleDateString("en-US", { month: "short" });
        };

        // Transform analytics data for growth trends chart
        let growthTrends: Array<{
          month: string;
          users: number;
          counselors: number;
          sessions: number;
        }> = [];

        if (analyticsResponse.success && analyticsResponse.data) {
          const { users, counselors, appointments } = analyticsResponse.data;

          // Get all unique months from the data
          const monthsSet = new Set<string>();
          users.monthlyData?.forEach((item) => monthsSet.add(item._id));
          counselors.monthlyData?.forEach((item) => monthsSet.add(item._id));
          appointments.monthlyData?.forEach((item) => monthsSet.add(item._id));

          const sortedMonths = Array.from(monthsSet).sort();

          // Build cumulative data for each month
          let cumulativeUsers = users.total - users.new;
          let cumulativeCounselors = counselors.total - counselors.new;

          growthTrends = sortedMonths.map((month) => {
            const userCount =
              users.monthlyData?.find((d) => d._id === month)?.count || 0;
            const counselorCount =
              counselors.monthlyData?.find((d) => d._id === month)?.count || 0;
            const appointmentData = appointments.monthlyData?.find(
              (d) => d._id === month
            );

            cumulativeUsers += userCount;
            cumulativeCounselors += counselorCount;

            return {
              month: formatMonth(month),
              users: cumulativeUsers,
              counselors: cumulativeCounselors,
              sessions: appointmentData?.completed || 0,
            };
          });
        }

        // Transform analytics data for activity bar chart
        let activityData: Array<{
          month: string;
          appointments: number;
          newUsers: number;
          activeCounselors: number;
        }> = [];

        if (analyticsResponse.success && analyticsResponse.data) {
          const { users, counselors, appointments } = analyticsResponse.data;

          // Get all unique months
          const monthsSet = new Set<string>();
          users.monthlyData?.forEach((item) => monthsSet.add(item._id));
          counselors.monthlyData?.forEach((item) => monthsSet.add(item._id));
          appointments.monthlyData?.forEach((item) => monthsSet.add(item._id));

          const sortedMonths = Array.from(monthsSet).sort();

          activityData = sortedMonths.map((month) => {
            const userCount =
              users.monthlyData?.find((d) => d._id === month)?.count || 0;
            const counselorCount =
              counselors.monthlyData?.find((d) => d._id === month)?.count || 0;
            const appointmentData = appointments.monthlyData?.find(
              (d) => d._id === month
            );

            return {
              month: formatMonth(month),
              appointments: appointmentData?.total || 0,
              newUsers: userCount,
              activeCounselors: counselorCount,
            };
          });
        }

        const statsData: StatCardData[] = [
          {
            label: "Total Users",
            value:
              analyticsResponse.data?.users.total ??
              statsResponse.data?.totalUsers ??
              0,
            icon: Users,
            isPositive: true,
          },
          {
            label: "Verified Counselors",
            value:
              analyticsResponse.data?.counselors.approved ??
              statsResponse.data?.verifiedCounselors ??
              0,
            icon: UserCheck,
            isPositive: true,
          },
          {
            label: "Total Counselors",
            value:
              analyticsResponse.data?.counselors.total ??
              statsResponse.data?.totalCounselors ??
              0,
            icon: Heart,
            isPositive: true,
          },
          {
            label: "Pending Counselors",
            value:
              analyticsResponse.data?.counselors.pending ??
              statsResponse.data?.pendingCounselors ??
              0,
            icon: UserPlus,
            isPositive:
              (analyticsResponse.data?.counselors.pending ??
                statsResponse.data?.pendingCounselors ??
                0) <= 5,
          },
          {
            label: "Completion Rate",
            value: `${analyticsResponse.data?.appointments.completionRate ?? "0"
              }%`,
            icon: TrendingUp,
            isPositive:
              parseFloat(
                analyticsResponse.data?.appointments.completionRate ?? "0"
              ) >= 80,
          },
          {
            label: "New Users",
            value: analyticsResponse.data?.users.new ?? 0,
            icon: Calendar,
            isPositive: true,
          },
        ];
        setStats(statsData);

        setRawData({
          totalUsers: analyticsResponse.data?.users.total ?? 0,
          verifiedCounselors: analyticsResponse.data?.counselors.approved ?? 0,
          totalCounselors: analyticsResponse.data?.counselors.total ?? 0,
          pendingCounselors: analyticsResponse.data?.counselors.pending ?? 0,
          growthTrends,
          activityData,
        });

        if (
          !statsResponse.success &&
          !statsResponse.data &&
          !analyticsResponse.success
        ) {
          setError(statsResponse.message || "Failed to fetch statistics");
        }
      } catch (err) {
        setError("An error occurred while fetching statistics");
        console.error("Error fetching admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <DashboardLayout userType="super_admin" userName="Admin">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <div className="animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout userType="super_admin" userName="Admin">
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="super_admin" userName="Admin">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <UserGrowthChart growthData={rawData.growthTrends} />
          <CounselorStatusChart
            verified={rawData.verifiedCounselors}
            pending={rawData.pendingCounselors}
            total={rawData.totalCounselors}
          />
        </div>

        {/* Activity Bar Chart */}
        <div className="grid grid-cols-1 gap-6">
          <ActivityBarChart activityData={rawData.activityData} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminLanding;
