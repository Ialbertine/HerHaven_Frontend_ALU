import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Heart, ArrowUp, ArrowDown, Calendar, UserPlus, UserCheck, TrendingUp } from 'lucide-react';
import { getAdminStats } from '@/apis/admin';


interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${className}`}>
    {children}
  </div>
);

interface StatCardData {
  label: string;
  value: string | number;
  icon: React.ElementType;
  isPositive?: boolean;
}

const StatCard: React.FC<StatCardData> = ({ label, value, icon: Icon, isPositive }) => (
  <Card>
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-white" />
      </div>
      {isPositive !== undefined && (
        <span className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
        </span>
      )}
    </div>
    <h3 className="text-sm text-gray-600 mb-1">{label}</h3>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </Card>
);

const AdminLanding: React.FC = () => {
  const [stats, setStats] = useState<StatCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await getAdminStats();

        const statsData: StatCardData[] = [
          {
            label: 'Total Users',
            value: response.data?.totalUsers ?? 0,
            icon: Users,
            isPositive: true
          },
          {
            label: 'Verified Counselors',
            value: response.data?.verifiedCounselors ?? 0,
            icon: UserCheck,
            isPositive: true
          },
          {
            label: 'Total Counselors',
            value: response.data?.totalCounselors ?? 0,
            icon: Heart,
            isPositive: true
          },
          {
            label: 'Pending Counselors',
            value: response.data?.pendingCounselors ?? 0,
            icon: UserPlus,
            isPositive: (response.data?.pendingCounselors ?? 0) <= 5
          },
          {
            label: 'Verification Rate',
            value: `${response.data?.verificationRate ?? '0'}%`,
            icon: TrendingUp,
            isPositive: parseFloat(response.data?.verificationRate ?? '0') >= 80
          },
          {
            label: 'Recent Registrations',
            value: response.data?.recentActivity?.userRegistrations ?? 0,
            icon: Calendar,
            isPositive: true
          },
        ];
        setStats(statsData);

        if (!response.success && !response.data) {
          setError(response.message || 'Failed to fetch statistics');
        }
      } catch (err) {
        setError('An error occurred while fetching statistics');
        console.error('Error fetching admin stats:', err);
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
    <DashboardLayout
      userType="super_admin"
      userName="Admin"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminLanding;