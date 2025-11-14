import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, BookOpen, UserPlus, LogIn, Shield, Heart, Calendar, Users, ClipboardCheck } from 'lucide-react';
import FeedbackForm from '@/components/FeedbackForm';

const GuestDashboard: React.FC = () => {
  const navigate = useNavigate();

  const availableFeatures = [
    {
      icon: ClipboardCheck,
      title: 'Self-Assessment',
      description: 'Take free, anonymous mental health assessments and get instant insights',
      path: '/assessments',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: MessageSquare,
      title: 'Community Support',
      description: 'Connect with others, share experiences, and find support',
      path: '/user/community',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BookOpen,
      title: 'Resources',
      description: 'Access helpful articles, guides, and educational content',
      path: '/user/resources',
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  const lockedFeatures = [
    {
      icon: Users,
      title: 'Professional Consultations',
      description: 'Connect with licensed counselors'
    },
    {
      icon: Calendar,
      title: 'Appointments',
      description: 'Schedule and manage therapy sessions'
    },
    {
      icon: Heart,
      title: 'Personalized Care',
      description: 'Get tailored support and tracking'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 mb-8 text-white">
          <h1 className="text-4xl font-bold mb-4">Welcome, Guest!</h1>
          <p className="text-lg mb-6 text-purple-100">
            You're currently browsing as a guest. Create an account to unlock all features and get personalized support.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <UserPlus className="w-5 h-5" />
              Create Account
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-6 py-3 bg-purple-700 text-white rounded-xl font-semibold hover:bg-purple-800 transition-all"
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </button>
          </div>
        </div>

        {/* Available Features */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Available to You</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {availableFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  onClick={() => navigate(feature.path)}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                  <div className="mt-4 text-purple-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Explore Now
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Locked Features */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Unlock More Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {lockedFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative overflow-hidden opacity-75"
                >
                  <div className="absolute top-4 right-4">
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <Shield className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-4">
                    <Icon className="w-7 h-7 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-600 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 mb-4">{feature.description}</p>
                  <div className="text-sm text-gray-400 font-medium">
                    Sign up to access
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feedback Form */}
        <div className="mt-12">
          <FeedbackForm />
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join HerHaven today to access professional counseling, personalized care plans,
            appointment scheduling, and much more. Your journey to better mental health starts here.
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all text-lg"
          >
            Create Your Free Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuestDashboard;