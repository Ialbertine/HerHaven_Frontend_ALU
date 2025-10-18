import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Heart, ArrowUp, ArrowDown } from 'lucide-react';

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

const AdminLanding: React.FC = () => {
  const stats: StatCardData[] = [
    { label: 'Total Users', value: '0', icon: Users, isPositive: true },
    { label: 'Active Counselors', value: '0', icon: Heart, isPositive: true },
  ];

  return (
    <DashboardLayout
      userType="super_admin"
      userName="Admin"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminLanding;