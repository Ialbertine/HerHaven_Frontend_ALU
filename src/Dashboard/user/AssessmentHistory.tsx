import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Download,
  Filter,
  Calendar as CalendarIcon,
  Loader2,
  Eye,
  Trash2,
  ChevronDown,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import {
  getMyAssessments,
  deleteAssessment,
  type AssessmentResponse
} from '@/apis/assessment';
import {
  getCategoryInfo,
  getSeverityInfo
} from '@/utils/assessmentHelper';
import DashboardLayout from '@/components/DashboardLayout';
import { getCurrentUser } from '@/apis/auth';
import { useModal } from '@/contexts/useModal';

type CategoryFilter = 'all' | 'depression' | 'anxiety' | 'ptsd' | 'safety' | 'wellness' | 'general';
type SortOption = 'recent' | 'oldest' | 'score-high' | 'score-low';

export const AssessmentHistory: React.FC = () => {
  const { showAlert, showDeleteConfirm } = useModal();
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const loadAssessments = async () => {
    try {
      setLoading(true);
      const response = await getMyAssessments({
        status: 'completed',
        limit: 100
      });

      if (response.success && response.data) {
        setAssessments(response.data.assessments);
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

  const filterAndSortAssessments = useCallback(() => {
    let filtered = [...assessments];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => {
        if (typeof a.template === 'string') {
          return a.templateSnapshot.category === selectedCategory;
        }
        return a.template.category === selectedCategory;
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.completedAt || b.createdAt).getTime() -
            new Date(a.completedAt || a.createdAt).getTime();
        case 'oldest':
          return new Date(a.completedAt || a.createdAt).getTime() -
            new Date(b.completedAt || b.createdAt).getTime();
        case 'score-high':
          return b.totalScore - a.totalScore;
        case 'score-low':
          return a.totalScore - b.totalScore;
        default:
          return 0;
      }
    });

    setFilteredAssessments(filtered);
    setCurrentPage(1);
  }, [assessments, selectedCategory, sortBy]);

  useEffect(() => {
    loadAssessments();
  }, []);

  useEffect(() => {
    filterAndSortAssessments();
  }, [filterAndSortAssessments]);

  const handleDelete = async (assessmentId: string) => {
    showDeleteConfirm(
      'Are you sure you want to delete this assessment? This action cannot be undone.',
      async () => {
        try {
          const response = await deleteAssessment(assessmentId);
          if (response.success) {
            setAssessments(prev => prev.filter(a => a._id !== assessmentId));
            showAlert('Assessment deleted successfully', 'Success', 'success');
          } else {
            showAlert(response.message || 'Failed to delete assessment', 'Error', 'danger');
          }
        } catch (err) {
          showAlert('An error occurred while deleting the assessment', 'Error', 'danger');
          console.error(err);
        }
      },
      'Delete Assessment'
    );
  };

  const handleExport = () => {
    const csv = ['Date,Assessment,Category,Score,Severity'].concat(
      filteredAssessments.map(a => {
        const templateInfo = typeof a.template === 'string' ?
          a.templateSnapshot :
          { name: a.template.name, category: a.template.category };
        const date = new Date(a.completedAt || a.createdAt).toLocaleDateString();
        return `${date},${templateInfo.name},${templateInfo.category},${a.totalScore},${a.severityLevel}`;
      })
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'assessment-history.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSelectedCategory('all');
    setSortBy('recent');
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

  const userRole = localStorage.getItem('userRole') || 'user';
  const userType = userRole === 'guest' ? 'guest' : 'user';

  if (loading) {
    return (
      <DashboardLayout userType={userType} userName={userName}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your history...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssessments = filteredAssessments.slice(startIndex, endIndex);
  const hasFilters = selectedCategory !== 'all' || sortBy !== 'recent';

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DashboardLayout userType={userType} userName={userName || 'User'}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Assessment History</h1>
            <p className="text-gray-600 mt-1">Complete timeline of your assessments</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/assessments">
              <button className="px-4 py-2 bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-[#7b1fa2] hover:to-[#8e24aa] transform hover:scale-[1.02] transition-all duration-300 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Take New Assessment
              </button>
            </Link>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Filters & Sorting</h3>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as CategoryFilter)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="depression">Depression</option>
                  <option value="anxiety">Anxiety</option>
                  <option value="ptsd">PTSD</option>
                  <option value="safety">Safety</option>
                  <option value="wellness">Wellness</option>
                  <option value="general">General</option>
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="recent">Most Recent</option>
                  <option value="oldest">Oldest First</option>
                  <option value="score-high">Score (High to Low)</option>
                  <option value="score-low">Score (Low to High)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasFilters && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Active filters:</span>
            {selectedCategory !== 'all' && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                {selectedCategory}
              </span>
            )}
            {sortBy !== 'recent' && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                {sortBy.replace('-', ' ')}
              </span>
            )}
          </div>
        )}

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
            <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Assessments Found
            </h3>
            <p className="text-gray-500 mb-6">
              {hasFilters ? 'Try adjusting your filters' : 'Start taking assessments to build your history'}
            </p>
            {hasFilters ? (
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
              >
                Clear Filters
              </button>
            ) : (
              <Link to="/assessment">
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                  Browse Assessments
                </button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Assessment
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Score
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedAssessments.map((assessment) => {
                      const templateInfo = getTemplateInfo(assessment);
                      const categoryInfo = getCategoryInfo(templateInfo.category);
                      const severityInfo = getSeverityInfo(assessment.severityLevel);
                      const date = new Date(assessment.completedAt || assessment.createdAt);

                      return (
                        <tr key={assessment._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {categoryInfo.icon && (
                                <span className="text-xl">{categoryInfo.icon}</span>
                              )}
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800 flex items-center gap-2">
                                  {templateInfo.name}
                                  {assessment.counselorNotes && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium" title="Counselor feedback available">
                                      <MessageSquare className="w-3 h-3" />
                                      Feedback
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className="px-3 py-1 rounded-full text-xs font-medium inline-block"
                              style={{
                                backgroundColor: `${categoryInfo.color}20`,
                                color: categoryInfo.color
                              }}
                            >
                              {categoryInfo.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-semibold text-gray-800">
                              {assessment.totalScore}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div
                              className="px-3 py-1 rounded-full text-xs font-semibold inline-block"
                              style={{
                                backgroundColor: severityInfo.bgColor,
                                color: severityInfo.color
                              }}
                            >
                              {severityInfo.icon} {severityInfo.label}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Link to={`/assessment/results/${assessment._id}`}>
                                <button className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors" title="View Details">
                                  <Eye className="w-4 h-4" />
                                </button>
                              </Link>
                              <button
                                onClick={() => handleDelete(assessment._id)}
                                className="p-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors" title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Show first page, last page, current page, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-colors ${currentPage === page
                            ? 'bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white shadow-md'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={page} className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Pagination Info */}
            {filteredAssessments.length > 0 && (
              <div className="text-center text-sm text-gray-600 mt-4">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredAssessments.length)} of {filteredAssessments.length} assessments
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AssessmentHistory;

