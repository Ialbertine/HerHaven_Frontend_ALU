import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  TrendingUp, 
  Calendar, 
  Filter,
  Loader2,
  FileText,
  Eye,
  Share2,
  GitCompare
} from 'lucide-react';
import { 
  getMyAssessments, 
  getAssessmentAnalytics,
  type AssessmentResponse 
} from '@/apis/assessment';
import { 
  getCategoryInfo, 
  getSeverityInfo, 
  formatAssessmentDate 
} from '@/utils/assessmentHelper';
import { useModal } from '@/contexts/useModal';

type CategoryFilter = 'all' | 'depression' | 'anxiety' | 'ptsd' | 'safety' | 'wellness' | 'general';

export const MyAssessments: React.FC = () => {
  const { showAlert } = useModal();
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    categoriesExplored: 0,
  });

  useEffect(() => {
    loadAssessments();
    loadStats();
  }, []);

  const filterAssessments = useCallback(() => {
    if (selectedCategory === 'all') {
      setFilteredAssessments(assessments);
    } else {
      setFilteredAssessments(
        assessments.filter(a => {
          if (typeof a.template === 'string') return false;
          return a.template.category === selectedCategory;
        })
      );
    }
  }, [assessments, selectedCategory]);

  useEffect(() => {
    filterAssessments();
  }, [assessments, selectedCategory]);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const response = await getMyAssessments({ 
        status: 'completed',
        limit: 20 
      });
      
      if (response.success && response.data) {
        setAssessments(response.data.assessments);
        setFilteredAssessments(response.data.assessments);
      } else {
        setError(response.message || 'Failed to load assessments');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const analyticsResponse = await getAssessmentAnalytics();
      
      if (analyticsResponse.success && analyticsResponse.data) {
        const data = analyticsResponse.data;
        const now = new Date();
        const thisMonth = data.recentAssessments.filter(a => {
          const assessmentDate = new Date(a.completedAt || a.createdAt);
          return assessmentDate.getMonth() === now.getMonth() &&
                 assessmentDate.getFullYear() === now.getFullYear();
        }).length;
        
        const categories = new Set(data.recentAssessments.map(a => {
          if (typeof a.template === 'string') return 'unknown';
          return a.template.category;
        }));
        
        setStats({
          total: data.totalAssessments,
          thisMonth: thisMonth,
          categoriesExplored: categories.size,
        });
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const getTemplateInfo = (assessment: AssessmentResponse) => {
    if (typeof assessment.template === 'string') {
      return {
        name: assessment.templateSnapshot.name,
        category: assessment.templateSnapshot.category as 'depression' | 'anxiety' | 'ptsd' | 'safety' | 'wellness' | 'general',
      };
    }
    return {
      name: assessment.template.name,
      category: assessment.template.category,
    };
  };

  const categories: CategoryFilter[] = ['all', 'depression', 'anxiety', 'ptsd', 'safety', 'wellness', 'general'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your assessments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Assessments</h1>
          <p className="text-gray-600 mt-1">Track your mental health journey</p>
        </div>
        <Link to="/assessment">
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Take New Assessment
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Total Taken</p>
            <FileText className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">This Month</p>
            <Calendar className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.thisMonth}</p>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Categories</p>
            <Filter className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{stats.categoriesExplored}</p>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white text-sm opacity-90">Trend</p>
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold">Improving</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/assessment">
            <button className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-semibold hover:bg-purple-100 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Take New Assessment
            </button>
          </Link>
          <Link to="/dashboard/assessment-analytics">
            <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              View Analytics
            </button>
          </Link>
          <Link to="/dashboard/assessment-history">
            <button className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-semibold hover:bg-green-100 transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              View History
            </button>
          </Link>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-5 h-5 text-gray-400" />
        {categories.map(category => {
          const isActive = selectedCategory === category;
          const categoryInfo = category === 'all' ? 
            { name: 'All', icon: '📋', color: '#6366f1' } : 
            getCategoryInfo(category);

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm flex items-center gap-2 ${
                isActive
                  ? 'text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
              style={isActive ? {
                background: `linear-gradient(135deg, ${categoryInfo.color}, ${categoryInfo.color}dd)`,
              } : {}}
            >
              <span>{categoryInfo.icon}</span>
              <span>{categoryInfo.name}</span>
            </button>
          );
        })}
      </div>

      {/* Recent Assessments */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Recent Assessments
          {filteredAssessments.length > 0 && (
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({filteredAssessments.length})
            </span>
          )}
        </h2>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-semibold mb-2">Error</p>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadAssessments}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 shadow-md border border-gray-100 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Assessments Yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start your mental health journey by taking your first assessment
            </p>
            <Link to="/assessment">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                Browse Assessments
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssessments.map((assessment) => {
              const templateInfo = getTemplateInfo(assessment);
              const categoryInfo = getCategoryInfo(templateInfo.category);
              const severityInfo = getSeverityInfo(assessment.severityLevel);

              return (
                <div
                  key={assessment._id}
                  className="bg-white rounded-xl p-6 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Left side - Assessment Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: `${categoryInfo.color}20` }}
                      >
                        {categoryInfo.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">
                          {templateInfo.name}
                        </h3>
                        <p className="text-sm text-gray-500 mb-2">
                          Completed {formatAssessmentDate(assessment.completedAt || assessment.createdAt)}
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Score:</span>
                            <span className="font-bold text-gray-800">
                              {assessment.totalScore}
                            </span>
                          </div>
                          <div 
                            className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ 
                              backgroundColor: severityInfo.bgColor,
                              color: severityInfo.color 
                            }}
                          >
                            {severityInfo.icon} {severityInfo.label}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Actions */}
                    <div className="flex flex-wrap gap-2">
                      <Link to={`/assessment/results/${assessment._id}`}>
                        <button className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </Link>
                      <button 
                        className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-semibold hover:bg-purple-100 transition-colors flex items-center gap-2 text-sm"
                        onClick={() => showAlert('Share feature coming soon!', 'Coming Soon', 'info')}
                      >
                        <Share2 className="w-4 h-4" />
                        Share
                      </button>
                      <button 
                        className="px-4 py-2 bg-green-50 text-green-700 rounded-lg font-semibold hover:bg-green-100 transition-colors flex items-center gap-2 text-sm"
                        onClick={() => showAlert('Compare feature coming soon!', 'Coming Soon', 'info')}
                      >
                        <GitCompare className="w-4 h-4" />
                        Compare
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {assessments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3">📌 Recommendations</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Consider retaking PHQ-9 if it's been more than 2 weeks</li>
            <li>• Your recent scores show improvement! Keep up the good work 📈</li>
            <li>• Try exploring the Wellness assessment for overall mental health</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyAssessments;

