import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  getAllFeedback,
  getFeedbackStats,
  publishFeedback,
  unpublishFeedback,
  deleteFeedback,
  type Feedback,
  type FeedbackStats
} from '@/apis/feedback';
import {
  Star,
  Eye,
  EyeOff,
  Trash2,
  CheckCircle,
  Clock,
  MessageSquare,
  Filter,
  Search,
  RefreshCw,
  User,
  Mail,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useModal } from '@/contexts/useModal';

interface FeedbackFilters {
  status: string;
  isAnonymous: boolean | null;
}

const FeedbackManagement: React.FC = () => {
  const { showDeleteConfirm } = useModal();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FeedbackFilters>({
    status: 'all',
    isAnonymous: null
  });
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewed', label: 'Reviewed' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  const loadFeedback = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filtersParams: { status?: string; isAnonymous?: boolean; limit?: number; skip?: number } = {};
      if (filters.status !== 'all') {
        filtersParams.status = filters.status;
      }
      if (filters.isAnonymous !== null) {
        filtersParams.isAnonymous = filters.isAnonymous;
      }

      const skip = (currentPage - 1) * itemsPerPage;
      filtersParams.limit = itemsPerPage;
      filtersParams.skip = skip;

      const response = await getAllFeedback(filtersParams);

      if (response.success && response.data) {
        let feedbackData = response.data.feedback;

        // Apply search filter
        if (searchTerm) {
          feedbackData = feedbackData.filter(item =>
            item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.email && item.email.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        setFeedback(feedbackData);
        setTotalItems(response.data.total || response.data.count || 0);
        setTotalPages(Math.ceil((response.data.total || response.data.count || 0) / itemsPerPage));
      } else {
        setError(response.message || 'Failed to load feedback');
      }
    } catch (err) {
      setError('An error occurred while loading feedback');
      console.error('Error loading feedback:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, currentPage]);

  const loadStats = useCallback(async () => {
    try {
      const response = await getFeedbackStats();
      if (response.success && response.data) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters, searchTerm]);

  useEffect(() => {
    loadFeedback();
    loadStats();
  }, [loadFeedback, loadStats]);

  const handleAction = async (action: 'publish' | 'unpublish' | 'delete', feedbackId: string) => {
    try {
      setActionLoading(feedbackId);
      let response;

      switch (action) {
        case 'publish':
          response = await publishFeedback(feedbackId);
          break;
        case 'unpublish':
          response = await unpublishFeedback(feedbackId);
          break;
        case 'delete':
          response = await deleteFeedback(feedbackId);
          break;
      }

      if (response.success) {
        await loadFeedback();
        await loadStats();
      } else {
        setError(response.message || `Failed to ${action} feedback`);
      }
    } catch (err) {
      setError(`An error occurred while ${action}ing feedback`);
      console.error(`Error ${action}ing feedback:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardLayout userType="super_admin" userName="Admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Feedback Management</h1>
            <p className="text-sm sm:text-base text-gray-600">Manage and moderate user feedback</p>
          </div>
          <button
            onClick={() => {
              loadFeedback();
              loadStats();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/*Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Feedback</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Published</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.published}</p>
                </div>
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{stats.averageRating}</p>
                </div>
                <Star className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, email, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={filters.isAnonymous === null ? 'all' : filters.isAnonymous.toString()}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilters(prev => ({
                        ...prev,
                        isAnonymous: value === 'all' ? null : value === 'true'
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="false">Authenticated</option>
                    <option value="true">Anonymous</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Feedback List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {feedback.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No feedback found matching your criteria.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {feedback.map((item) => (
                    <div key={item._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1 w-full">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              {item.isAnonymous ? (
                                <User className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Mail className="w-4 h-4 text-blue-500" />
                              )}
                              <span className="font-semibold text-sm sm:text-base text-gray-900">{item.fullName}</span>
                              {item.isAnonymous && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  Anonymous
                                </span>
                              )}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                            {item.isPublic && (
                              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                Public
                              </span>
                            )}
                          </div>

                          {item.email && !item.isAnonymous && (
                            <div className="flex items-center gap-2 mb-2">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="text-xs sm:text-sm text-gray-600">{item.email}</span>
                            </div>
                          )}

                          <div className="mb-3">
                            {renderStars(item.rating)}
                          </div>

                          <p className="text-sm sm:text-base text-gray-700 mb-3 leading-relaxed">{item.message}</p>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(item.createdAt)}
                            </div>
                            {item.reviewedBy && (
                              <div className="text-xs">
                                Reviewed by {item.reviewedBy.username}
                                {item.reviewedAt && ` on ${formatDate(item.reviewedAt)}`}
                              </div>
                            )}
                          </div>

                          {item.adminNotes && (
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs sm:text-sm text-blue-800">
                                <strong>Admin Notes:</strong> {item.adminNotes}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          {!item.isPublic ? (
                            <button
                              onClick={() => handleAction('publish', item._id)}
                              disabled={actionLoading === item._id}
                              className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              <Eye className="w-4 h-4" />
                              <span className="hidden sm:inline">Publish</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction('unpublish', item._id)}
                              disabled={actionLoading === item._id}
                              className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors disabled:opacity-50"
                            >
                              <EyeOff className="w-4 h-4" />
                              <span className="hidden sm:inline">Unpublish</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              showDeleteConfirm(
                                'Are you sure you want to delete this feedback? This action cannot be undone.',
                                () => handleAction('delete', item._id)
                              );
                            }}
                            disabled={actionLoading === item._id}
                            className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs sm:text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {feedback.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} feedback
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${currentPage === pageNum
                              ? 'bg-purple-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FeedbackManagement;
