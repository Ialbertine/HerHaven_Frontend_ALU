import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  BookOpen, Heart, Activity, Calendar, FileText, 
  Users, Phone, Star 
} from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${className}`}>
    {children}
  </div>
);

interface ToolCardProps {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick?: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ icon: Icon, label, description, onClick }) => (
  <button 
    onClick={onClick}
    className="p-4 rounded-xl border-2 border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-all group text-center w-full"
  >
    <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="font-semibold text-gray-800 mb-1">{label}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </button>
);

interface RecommendationProps {
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
}

const RecommendationItem: React.FC<RecommendationProps> = ({ icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-all text-left"
  >
    <Icon className="w-5 h-5 text-purple-600" />
    <span className="text-gray-700 font-medium">{label}</span>
  </button>
);

const UserLanding: React.FC = () => {
  // In a real app, you'd get this from auth context or API
  const userName = 'Sarah';
  
  const tools = [
    { icon: BookOpen, label: 'Journal', description: 'Reflect and write' },
    { icon: Heart, label: 'Meditations', description: 'Find your calm' },
    { icon: Activity, label: 'Breathing', description: 'Center yourself' },
  ];

  const recommendations = [
    { icon: FileText, label: 'Understanding Trauma Responses' },
    { icon: Users, label: 'Join a Peer Support Group' },
    { icon: Phone, label: 'Emergency Contact Hotlines' },
    { icon: Star, label: 'Coping with Anxiety' },
  ];

  return (
    <DashboardLayout 
      userType="user" 
      userName={userName}
      notificationCount={3}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Self-Help Tools */}
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Self-Help Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tools.map((tool, i) => (
              <ToolCard key={i} {...tool} />
            ))}
          </div>
        </Card>

        {/* Next Session */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Next Session</h2>
          <div className="bg-white rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="font-semibold text-gray-800">Tomorrow, 10:00 AM</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">with Dr. Emily Carter</p>
            <button className="w-full py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all">
              Join Session
            </button>
          </div>
        </Card>

        {/* Recommendations */}
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recommended for You</h2>
          <div className="space-y-3">
            {recommendations.map((item, i) => (
              <RecommendationItem key={i} {...item} />
            ))}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserLanding;