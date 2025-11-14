import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  Share2,
  Loader2,
  Calendar,
  BarChart3,
  Award,
  Target
} from 'lucide-react';
import {
  getAssessmentAnalytics,
  getMyAssessments,
  type AssessmentAnalytics as AnalyticsData,
  type AssessmentResponse
} from '@/apis/assessment';
import {
  getCategoryInfo,
  getSeverityInfo
} from '@/utils/assessmentHelper';
import { useModal } from '@/contexts/useModal';

type TimeRange = '1month' | '3months' | '6months' | '1year' | 'all';

export const AssessmentAnalytics: React.FC = () => {
  const { showAlert } = useModal();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('6months');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, assessmentsResponse] = await Promise.all([
        getAssessmentAnalytics(),
        getMyAssessments({ status: 'completed', limit: 100 })
      ]);

      if (analyticsResponse.success && analyticsResponse.data) {
        setAnalytics(analyticsResponse.data);
      } else {
        setError(analyticsResponse.message || 'Failed to load analytics');
      }

      if (assessmentsResponse.success && assessmentsResponse.data) {
        setAssessments(assessmentsResponse.data.assessments);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAssessmentsByTimeRange = (assessments: AssessmentResponse[]): AssessmentResponse[] => {
    const now = new Date();
    const cutoffDate = new Date();

    switch (timeRange) {
      case '1month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        return assessments;
    }

    return assessments.filter(a => {
      const date = new Date(a.completedAt || a.createdAt);
      return date >= cutoffDate;
    });
  };

  const calculateCategoryStats = (assessments: AssessmentResponse[]) => {
    const categories: Record<string, { count: number; avgScore: number; totalScore: number }> = {};

    assessments.forEach(a => {
      const category = typeof a.template === 'string' ?
        a.templateSnapshot.category :
        a.template.category;

      if (!categories[category]) {
        categories[category] = { count: 0, avgScore: 0, totalScore: 0 };
      }

      categories[category].count++;
      categories[category].totalScore += a.totalScore;
    });

    Object.keys(categories).forEach(cat => {
      categories[cat].avgScore = Math.round(categories[cat].totalScore / categories[cat].count);
    });

    return categories;
  };

  const calculateSeverityDistribution = (assessments: AssessmentResponse[]) => {
    const distribution: Record<string, number> = {};

    assessments.forEach(a => {
      const severity = a.severityLevel;
      distribution[severity] = (distribution[severity] || 0) + 1;
    });

    return distribution;
  };

  const getTrendIcon = (trend?: 'improving' | 'stable' | 'worsening') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'worsening':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'stable':
      default:
        return <Minus className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTrendColor = (trend?: 'improving' | 'stable' | 'worsening') => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'worsening':
        return 'text-red-600 bg-red-50';
      case 'stable':
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  const handleDownloadReport = () => {
    if (!analytics) return;

    const report = `
MENTAL HEALTH ASSESSMENT ANALYTICS REPORT
==========================================

Generated: ${new Date().toLocaleDateString()}
Time Range: ${timeRange}

OVERVIEW
--------
Total Assessments: ${analytics.totalAssessments}
Overall Trend: ${analytics.trends?.overall || 'N/A'}
Average Score: ${analytics.trends?.averageScore.toFixed(1) || 'N/A'}

SEVERITY DISTRIBUTION
--------------------
${Object.entries(analytics.trends?.severityDistribution || {})
        .map(([severity, count]) => `${severity}: ${count}`)
        .join('\n')}

SCORE HISTORY
-------------
${analytics.trends?.scoreHistory.map(item =>
          `${new Date(item.date).toLocaleDateString()}: ${item.score} (${item.severity})`
        ).join('\n') || 'No data available'}

This report is for informational purposes only and should not replace 
professional mental health consultation.
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mental-health-analytics-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-700 font-semibold mb-2">Error Loading Analytics</p>
          <p className="text-red-600 mb-4">{error || 'No data available'}</p>
          <button
            onClick={loadData}
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredAssessments = filterAssessmentsByTimeRange(assessments);
  const categoryStats = calculateCategoryStats(filteredAssessments);
  const severityDistribution = calculateSeverityDistribution(filteredAssessments);
  const totalInRange = filteredAssessments.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Assessment Analytics</h1>
          <p className="text-gray-600 mt-1">Track your mental health journey over time</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadReport}
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Report
          </button>
          <button
            onClick={() => showAlert('Share feature coming soon!', 'Coming Soon', 'info')}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Time Range:</span>
          {(['1month', '3months', '6months', '1year', 'all'] as TimeRange[]).map((range) => {
            const labels = {
              '1month': '1 Month',
              '3months': '3 Months',
              '6months': '6 Months',
              '1year': '1 Year',
              'all': 'All Time',
            };

            return (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${timeRange === range
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {labels[range]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Total Assessments</p>
            <BarChart3 className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">{totalInRange}</p>
          <p className="text-xs text-gray-500 mt-1">in selected period</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Overall Trend</p>
            {getTrendIcon(analytics.trends?.overall)}
          </div>
          <p className={`text-2xl font-bold capitalize ${getTrendColor(analytics.trends?.overall)}`}>
            {analytics.trends?.overall || 'N/A'}
          </p>
          <p className="text-xs text-gray-500 mt-1">based on recent scores</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600 text-sm">Categories</p>
            <Target className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-800">
            {Object.keys(categoryStats).length}
          </p>
          <p className="text-xs text-gray-500 mt-1">areas explored</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 shadow-md text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white text-sm opacity-90">Avg Score</p>
            <Award className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold">
            {analytics.trends?.averageScore.toFixed(1) || 'N/A'}
          </p>
          <p className="text-xs opacity-75 mt-1">across all assessments</p>
        </div>
      </div>

      {/* Score Trends - Simple Bar Visualization */}
      {analytics.trends && analytics.trends.scoreHistory.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Score Trends
          </h2>

          <div className="space-y-6">
            {/* Simple line chart representation */}
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
                {Object.entries(
                  analytics.trends.scoreHistory.reduce((acc, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item);
                    return acc;
                  }, {} as Record<string, typeof analytics.trends.scoreHistory>)
                ).map(([category, history]) => {
                  const categoryInfo = getCategoryInfo(category as 'depression' | 'anxiety' | 'ptsd' | 'safety' | 'wellness' | 'general');
                  const maxScore = Math.max(...history.map(h => h.score), 30);

                  return (
                    <div key={category} className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{categoryInfo.icon}</span>
                        <h3 className="font-bold text-gray-800">{categoryInfo.name}</h3>
                      </div>

                      <div className="flex items-end gap-2 h-32">
                        {history.slice(-10).map((item, index) => {
                          const height = (item.score / maxScore) * 100;
                          const severityInfo = getSeverityInfo(item.severity);

                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div
                                className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 relative group"
                                style={{
                                  height: `${height}%`,
                                  backgroundColor: severityInfo.color,
                                  minHeight: '20px'
                                }}
                              >
                                {/* Tooltip */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                  Score: {item.score}<br />
                                  {new Date(item.date).toLocaleDateString()}
                                </div>
                              </div>
                              <span className="text-xs text-gray-500 mt-1">
                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between mt-2 text-sm">
                        <span className="text-gray-500">Recent trend:</span>
                        <span className={`font-semibold ${getTrendColor(analytics.trends?.overall)}`}>
                          {history.length > 1 ? (
                            history[history.length - 1].score > history[0].score ? '↗ Improving' :
                              history[history.length - 1].score < history[0].score ? '↘ Needs attention' :
                                '→ Stable'
                          ) : '→ Stable'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Severity Distribution */}
      {Object.keys(severityDistribution).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Severity Distribution</h2>
          <div className="space-y-3">
            {Object.entries(severityDistribution)
              .sort((a, b) => b[1] - a[1])
              .map(([severity, count]) => {
                const severityInfo = getSeverityInfo(severity);
                const percentage = Math.round((count / totalInRange) * 100);

                return (
                  <div key={severity}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <span>{severityInfo.icon}</span>
                        {severityInfo.label}
                      </span>
                      <span className="text-sm font-bold text-gray-800">{percentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: severityInfo.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Category Breakdown</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryStats).map(([category, stats]) => {
              const categoryInfo = getCategoryInfo(category as 'depression' | 'anxiety' | 'ptsd' | 'safety' | 'wellness' | 'general');

              return (
                <div
                  key={category}
                  className="p-4 rounded-xl border-2"
                  style={{
                    borderColor: `${categoryInfo.color}40`,
                    backgroundColor: `${categoryInfo.color}10`
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{categoryInfo.icon}</span>
                    <h3 className="font-bold text-gray-800">{categoryInfo.name}</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taken:</span>
                      <span className="font-bold text-gray-800">{stats.count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg Score:</span>
                      <span className="font-bold text-gray-800">{stats.avgScore}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights */}
      {analytics.trends && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Insights & Recommendations
          </h3>
          <ul className="space-y-3 text-gray-700">
            {analytics.trends.overall === 'improving' && (
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Your mental health scores show consistent improvement over time. Keep up the great work!</span>
              </li>
            )}
            {totalInRange >= 5 && (
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-0.5">📊</span>
                <span>You've taken {totalInRange} assessments in this period, showing strong engagement with your mental health.</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-0.5">💡</span>
              <span>Consider scheduling a follow-up with a mental health professional to discuss your progress.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-0.5">🎯</span>
              <span>Regular assessments help track progress. Try taking assessments monthly for best results.</span>
            </li>
          </ul>
        </div>
      )}

      {/* CTA */}
      <div className="text-center">
        <Link to="/assessment">
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Take Another Assessment
          </button>
        </Link>
      </div>
    </div>
  );
};

export default AssessmentAnalytics;

