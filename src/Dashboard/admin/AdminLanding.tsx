import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Heart, Calendar, Star, ArrowUp, ArrowDown } from 'lucide-react';

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
  value: string;
  icon: React.ElementType;
  isPositive: boolean;
}

const StatCard: React.FC<StatCardData> = ({ label, value, icon: Icon, isPositive }) => (
  <Card>
    <div className="flex items-start justify-between mb-4">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
      </span>
    </div>
    <h3 className="text-sm text-gray-600 mb-1">{label}</h3>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </Card>
);

interface ActivityItem {
  type: 'user' | 'session' | 'counselor' | 'content';
  text: string;
  time: string;
}

const AdminLanding: React.FC = () => {
  const stats: StatCardData[] = [
    { label: 'Total Users', value: '0', icon: Users, isPositive: true },
    { label: 'Active Counselors', value: '0', icon: Heart, isPositive: true },
    { label: 'Sessions Today', value: '0', icon: Calendar, isPositive: true },
    { label: 'Platform Rating', value: '0', icon: Star, isPositive: true },
  ];

  const recentActivity: ActivityItem[] = [
    { type: 'user', text: 'New user registered: Sarah Johnson', time: '5 minutes ago' },
    { type: 'session', text: 'Session completed: Maria G. & Dr. Carter', time: '12 minutes ago' },
    { type: 'counselor', text: 'Counselor approved: Dr. Emily Roberts', time: '1 hour ago' },
    { type: 'content', text: 'New resource published: Coping with Anxiety', time: '2 hours ago' },
    { type: 'user', text: 'User feedback submitted', time: '3 hours ago' },
    { type: 'session', text: 'Emergency session initiated', time: '4 hours ago' },
  ];

  

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'user': return 'from-blue-400 to-blue-500';
      case 'session': return 'from-green-400 to-green-500';
      case 'counselor': return 'from-purple-400 to-pink-400';
      case 'content': return 'from-orange-400 to-orange-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <DashboardLayout 
      userType="admin" 
      userName="Admin"
      notificationCount={8}
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Growth Chart */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">User Growth</h2>
            </div>
            <div className="relative h-64">
             
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-2 h-2 mt-2 bg-gradient-to-br ${getActivityColor(activity.type)} rounded-full flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 font-medium truncate">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminLanding;