import React from 'react';
import { Users, Calendar, Star, MessageCircle, Clock, TrendingUp } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${className}`}>
    {children}
  </div>
);

interface Session {
  time: string;
  client: string;
  type: string;
  initials: string;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ElementType;
  color: 'purple' | 'pink';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, color }) => {
  const colorClass = color === 'purple' ? 'bg-gradient-to-br from-purple-400 to-pink-400' : 'bg-gradient-to-br from-pink-400 to-purple-400';
  
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
      <div>
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`w-12 h-12 ${colorClass} rounded-xl flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
};

interface SessionCardProps {
  session: Session;
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => (
  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
        {session.initials}
      </div>
      <div>
        <h3 className="font-semibold text-gray-800">{session.client}</h3>
        <p className="text-sm text-gray-600">{session.type}</p>
      </div>
    </div>
    <div className="text-right">
      <div className="font-semibold text-purple-700 mb-1">{session.time}</div>
      <button className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors">
        View Details
      </button>
    </div>
  </div>
);

const TherapistLanding: React.FC = () => {
  const therapistName = 'Dr. Carter';

  const todaySessions: Session[] = [
    { time: '10:00 AM', client: 'Sarah Johnson', type: 'Initial Consultation', initials: 'SJ' },
    { time: '2:00 PM', client: 'Maria Garcia', type: 'Follow-up Session', initials: 'MG' },
    { time: '4:30 PM', client: 'Emma Wilson', type: 'Trauma Therapy', initials: 'EW' },
  ];

  const stats = [
    { label: 'Active Clients', value: '24', icon: Users, color: 'purple' as const },
    { label: 'This Week', value: '12', icon: Calendar, color: 'pink' as const },
    { label: 'Avg Rating', value: '4.9', icon: Star, color: 'purple' as const },
  ];

  const recentActivity = [
    { text: 'Session completed with Sarah J.', time: '2 hours ago' },
    { text: 'New client assigned: Emma W.', time: '5 hours ago' },
    { text: 'Weekly report submitted', time: '1 day ago' },
    { text: 'Client feedback received', time: '2 days ago' },
  ];

  return (
    <DashboardLayout 
          userType="admin" 
          userName="Admin"
          notificationCount={8}
    >
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back, {therapistName}!</h1>
          <p className="text-gray-600">Here's what's happening with your practice today.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Today's Schedule</h2>
              <button className="text-purple-600 hover:text-purple-800 font-medium text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                View Full Calendar
              </button>
            </div>
            <div className="space-y-3">
              {todaySessions.map((session, i) => (
                <SessionCard key={i} session={session} />
              ))}
            </div>
            {todaySessions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No sessions scheduled for today</p>
              </div>
            )}
          </Card>

          {/* Quick Stats */}
          <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Stats</h2>
            <div className="space-y-4">
              {stats.map((stat, i) => (
                <StatCard key={i} {...stat} />
              ))}
            </div>
          </Card>

          {/* Upcoming Sessions */}
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Next Session</h2>
            <div className="bg-white rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                  SJ
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Sarah Johnson</h3>
                  <p className="text-sm text-gray-600">Initial Consultation</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-purple-700 mb-4">
                <Clock className="w-4 h-4" />
                <span className="font-semibold">Starting in 25 minutes</span>
              </div>
              <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                Join Session
              </button>
            </div>
          </Card>

          {/* Performance Overview */}
          <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Performance Overview</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Client Satisfaction</span>
                  <span className="font-semibold text-gray-800">98%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '98%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Sessions Completed</span>
                  <span className="font-semibold text-gray-800">87%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Response Time</span>
                  <span className="font-semibold text-gray-800">92%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '92%' }} />
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Activity</h2>
            <div className="space-y-3">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-2 h-2 mt-2 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-medium">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-3 bg-gradient-to-r from-purple-100 to-pink-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: MessageCircle, label: 'Message Client', color: 'purple' },
                { icon: Calendar, label: 'Schedule Session', color: 'pink' },
                { icon: TrendingUp, label: 'View Reports', color: 'purple' },
                { icon: Users, label: 'Client List', color: 'pink' },
              ].map((action, i) => {
                const Icon = action.icon;
                const colorClass = action.color === 'purple' 
                  ? 'bg-gradient-to-br from-purple-400 to-pink-400' 
                  : 'bg-gradient-to-br from-pink-400 to-purple-400';
                
                return (
                  <button
                    key={i}
                    className="flex items-center gap-3 p-4 bg-white rounded-xl hover:shadow-md transition-all group"
                  >
                    <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-800">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TherapistLanding;