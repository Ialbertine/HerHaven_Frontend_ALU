import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, History, Plus, Clock, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import AssessmentList from './AssessmentList';
import AssessmentHistory from '@/Dashboard/user/AssessmentHistory';
import DashboardLayout from '@/components/DashboardLayout';
import { getCurrentUser } from '@/apis/auth';

type ViewMode = 'overview' | 'all-assessments' | 'history';

export const AssessmentDashboard: React.FC = () => {
  const [viewMode] = useState<ViewMode>('overview');
  const [userName, setUserName] = useState('');

  // Get user info for dashboard layout
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const isGuest = userRole === 'guest';
    
    if (isGuest) {
      setUserName('Guest');
    } else {
      const user = getCurrentUser();
      setUserName(user?.username || 'User');
    }
  }, []);

  // If user navigates to a specific view, show that view
  if (viewMode === 'all-assessments') {
    return <AssessmentList />;
  }

  if (viewMode === 'history') {
    return <AssessmentHistory />;
  }

  const userRole = localStorage.getItem('userRole') || 'user';
  const userType = userRole === 'guest' ? 'guest' : 'user';

  // Overview/Dashboard view
  return (
    <DashboardLayout userType={userType} userName={userName || 'User'}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-600 mb-4">
            Mental Health Assessments
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Take assessments to understand your mental well-being and track your progress over time.
          </p>
        </div>

        {/* Main Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* View All Assessments Card */}
          <Link
            to="/assessments"
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-transparent hover:border-purple-200 block"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">View All Assessments</h2>
                <p className="text-gray-600">Browse available assessments</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Explore our range of validated mental health assessments including depression screening, 
              anxiety evaluation, PTSD assessment, and wellness check-ins.
            </p>
            <div className="flex items-center gap-2 text-purple-600 font-semibold">
              <Plus className="w-5 h-5" />
              <span>Take New Assessment</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </div>
          </Link>

          {/* Assessment History Card */}
          <Link
            to="/user/assessment-history"
            className="bg-white rounded-2xl shadow-xl p-8 cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border-2 border-transparent hover:border-blue-200 block"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Assessment History</h2>
                <p className="text-gray-600">View your completed assessments</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6 leading-relaxed">
              Review your past assessment results, track your progress over time, compare scores, 
              and export your data for personal records.
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-semibold">
              <Calendar className="w-5 h-5" />
              <span>View History</span>
              <ArrowRight className="w-4 h-4 ml-auto" />
            </div>
          </Link>
        </div>

        {/* Quick Stats/Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-3">
              <Clock className="w-6 h-6 text-purple-600" />
              <h3 className="font-bold text-gray-800">Quick & Easy</h3>
            </div>
            <p className="text-sm text-gray-600">
              Most assessments take just 5-10 minutes to complete
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <h3 className="font-bold text-gray-800">Track Progress</h3>
            </div>
            <p className="text-sm text-gray-600">
              Monitor your mental health journey over time
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-3">
              <FileText className="w-6 h-6 text-green-600" />
              <h3 className="font-bold text-gray-800">Confidential</h3>
            </div>
            <p className="text-sm text-gray-600">
              Your responses are encrypted and stored securely
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AssessmentDashboard;

