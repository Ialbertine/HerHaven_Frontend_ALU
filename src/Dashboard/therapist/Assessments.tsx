import React, { useEffect, useState, useCallback } from 'react';
import {
  FileText,
  Eye,
  MessageSquare,
  Filter,
  Search,
  User as UserIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  getSharedAssessments,
  addCounselorNotes,
  type AssessmentResponse
} from '@/apis/assessment';
import {
  getCategoryInfo,
  getSeverityInfo
} from '@/utils/assessmentHelper';
import DashboardLayout from '@/components/DashboardLayout';
import { getCurrentUser } from '@/apis/auth';
import { getUserById, type User } from '@/apis/admin';

type StatusFilter = 'all' | 'completed' | 'in-progress' | 'abandoned';
type SortOption = 'recent' | 'oldest' | 'score-high' | 'score-low';

// Trauma-informed language transformation helper
const getTraumaInformedText = (questionText: string): string => {
  const lowerText = questionText.toLowerCase();

  // Transform clinical/direct language into compassionate, trauma-informed language
  if (lowerText.includes('dead') || lowerText.includes('hurting yourself') || lowerText.includes('suicide')) {
    return 'Experiencing thoughts about self-harm';
  }
  if (lowerText.includes('harm') && lowerText.includes('others')) {
    return 'Experiencing thoughts about harming others';
  }
  if (lowerText.includes('hopeless') || lowerText.includes('worthless')) {
    return 'Experiencing feelings of hopelessness or low self-worth';
  }
  if (lowerText.includes('panic') || lowerText.includes('heart racing')) {
    return 'Experiencing intense anxiety or panic symptoms';
  }
  if (lowerText.includes('flashback') || lowerText.includes('trauma')) {
    return 'Experiencing trauma-related symptoms';
  }
  if (lowerText.includes('safe') || lowerText.includes('danger')) {
    return 'Concerns about personal safety';
  }

  return 'Expressing significant distress or difficulty';
};

// Convert numeric response to descriptive level
const getResponseLevel = (answer: string | number | (string | number)[]): string => {
  const numAnswer = typeof answer === 'number' ? answer : parseInt(String(answer));

  if (isNaN(numAnswer)) {
    return 'Concern noted';
  }

  // 
  if (numAnswer >= 3) {
    return 'Significant concern';
  } else if (numAnswer >= 2) {
    return 'Moderate concern';
  } else if (numAnswer >= 1) {
    return 'Some concern';
  }

  return 'Concern noted';
};

// Extended type for AssessmentResponse where user can be populated as User object
type AssessmentResponseWithUser = Omit<AssessmentResponse, 'user'> & {
  user?: string | User;
};

// Type guard to check if user is a User object
const isUserObject = (user: unknown): user is User => {
  return typeof user === 'object' && user !== null && 'email' in user;
};

// Helper function to get user display name
const getUserDisplayName = (
  user: string | User | undefined,
  userNames: Record<string, string>
): string => {
  if (!user) return 'User';

  if (typeof user === 'string') {
    return userNames[user] || 'Loading...';
  }

  if (isUserObject(user)) {
    if (user.username) {
      return user.username;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
  }

  return 'User';
};

// Helper function to get user email
const getUserEmail = (user: string | User | undefined): string | null => {
  if (isUserObject(user) && user.email) {
    return user.email;
  }
  return null;
};

export const CounselorAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<AssessmentResponse[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<AssessmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Notes modal state
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentResponse | null>(null);
  const [notes, setNotes] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [notesSuccess, setNotesSuccess] = useState(false);

  // View details modal state
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsAssessment, setDetailsAssessment] = useState<AssessmentResponseWithUser | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  // Get user info for dashboard layout
  useEffect(() => {
    const user = getCurrentUser();
    setUserName(user?.username || 'Counselor');
  }, []);

  const loadAssessments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: { status?: "in-progress" | "completed" | "abandoned"; unviewed?: boolean } = {};
      if (selectedStatus !== 'all') {
        params.status = selectedStatus as "in-progress" | "completed" | "abandoned";
      }

      const response = await getSharedAssessments(params);

      if (response.success && response.data) {
        setAssessments(response.data.assessments);

        const authenticatedUserIds = response.data.assessments
          .filter(a => a.user && typeof a.user === 'string' && !a.isAnonymous)
          .map(a => a.user as string)
          .filter((id, index, self) => self.indexOf(id) === index);

        const nameMap: Record<string, string> = {};
        await Promise.all(
          authenticatedUserIds.map(async (userId) => {
            try {
              const userResponse = await getUserById(userId);
              if (userResponse.success && userResponse.data && userResponse.data.user.username) {
                nameMap[userId] = userResponse.data.user.username;
              } else {
                nameMap[userId] = 'User';
              }
            } catch (err) {
              // If we can't fetch user details
              console.error(`Failed to fetch username for user ${userId}:`, err);
              nameMap[userId] = 'User';
            }
          })
        );
        setUserNames(nameMap);
      } else {
        setError(response.message || 'Failed to load assessments');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  const filterAndSortAssessments = useCallback(() => {
    let filtered = [...assessments];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => {
        const templateName = typeof a.template === 'string'
          ? a.templateSnapshot.name
          : a.template.name;
        const category = typeof a.template === 'string'
          ? a.templateSnapshot.category
          : a.template.category;

        return (
          templateName.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query) ||
          a.severityLevel.toLowerCase().includes(query)
        );
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
  }, [assessments, searchQuery, sortBy]);

  useEffect(() => {
    loadAssessments();
  }, [loadAssessments]);

  useEffect(() => {
    filterAndSortAssessments();
  }, [filterAndSortAssessments]);

  const handleAddNotes = (assessment: AssessmentResponse) => {
    setSelectedAssessment(assessment);
    setNotes(assessment.counselorNotes || '');
    setNotesError(null);
    setNotesSuccess(false);
    setShowNotesModal(true);
  };

  const handleSubmitNotes = async () => {
    if (!selectedAssessment || !notes.trim()) return;

    try {
      setNotesLoading(true);
      setNotesError(null);
      setNotesSuccess(false);

      const response = await addCounselorNotes(selectedAssessment._id, notes);

      if (response.success) {
        setNotesSuccess(true);
        // Reload assessments to get updated notes
        await loadAssessments();
        setTimeout(() => {
          setShowNotesModal(false);
          setNotesSuccess(false);
          setSelectedAssessment(null);
          setNotes('');
        }, 1500);
      } else {
        setNotesError(response.message || 'Failed to save notes');
      }
    } catch (err) {
      setNotesError('An unexpected error occurred');
      console.error(err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleViewDetails = (assessment: AssessmentResponse) => {
    // API may return user as string or populated User object
    setDetailsAssessment(assessment as AssessmentResponseWithUser);
    setShowDetailsModal(true);
  };

  const getTemplateInfo = (assessment: AssessmentResponse | AssessmentResponseWithUser) => {
    if (typeof assessment.template === 'string') {
      return {
        name: assessment.templateSnapshot.name,
        category: assessment.templateSnapshot.category,
      };
    }
    return {
      name: assessment.template.name,
      category: assessment.template.category,
    };
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredAssessments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAssessments = filteredAssessments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <DashboardLayout userType="counselor" userName={userName || 'Counselor'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Shared Assessments</h1>
            <p className="text-gray-600 mt-1">Assessments shared with you by users</p>
          </div>
          <div className="flex gap-2 flex-wrap mt-4 sm:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as StatusFilter)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="abandoned">Abandoned</option>
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
                  <option value="score-high">Highest Score</option>
                  <option value="score-low">Lowest Score</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by assessment name, category, or severity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-6">
            <p className="text-red-700 font-semibold mb-2">Error Loading Assessments</p>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadAssessments}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
            <p className="text-gray-600">Loading assessments...</p>
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Assessments Found
            </h3>
            <p className="text-gray-500">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'No assessments have been shared with you yet.'}
            </p>
          </div>
        ) : (
          <>
            {/* Assessments Table */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        User
                      </th>
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
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
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
                      const isUnviewed = assessment.sharedWith?.some(
                        share => !share.viewedAt
                      );

                      let userName = 'Anonymous User';
                      if (assessment.user && !assessment.isAnonymous) {
                        if (typeof assessment.user === 'string') {
                          userName = userNames[assessment.user] || 'User';
                        } else if (typeof assessment.user === 'object' && 'username' in assessment.user) {
                          userName = (assessment.user as { username: string }).username;
                        } else if (typeof assessment.user === 'object' && 'email' in assessment.user) {
                          userName = ((assessment.user as { email: string }).email).split('@')[0];
                        } else {
                          userName = 'User';
                        }
                      }

                      return (
                        <tr key={assessment._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <UserIcon className="w-4 h-4 text-gray-400" />
                              <span className="font-medium text-gray-800">{userName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800 flex items-center gap-2">
                                  {templateInfo.name}
                                  {isUnviewed && (
                                    <span className="w-2 h-2 bg-blue-500 rounded-full" title="New"></span>
                                  )}
                                </div>
                                {assessment.userNotes && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                    User notes: {assessment.userNotes}
                                  </p>
                                )}
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
                              {severityInfo.label}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${assessment.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : assessment.status === 'in-progress'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                              {assessment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewDetails(assessment)}
                                className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors" title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleAddNotes(assessment)}
                                className="p-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors" title="Add Notes"
                              >
                                <MessageSquare className="w-4 h-4" />
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

      {/* Notes Modal */}
      {showNotesModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Add Counselor Notes</h2>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setSelectedAssessment(null);
                  setNotes('');
                  setNotesError(null);
                  setNotesSuccess(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {notesSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Notes Saved Successfully!</h3>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Assessment:</strong> {getTemplateInfo(selectedAssessment).name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>User Score:</strong> {selectedAssessment.totalScore} - {selectedAssessment.severityLevel}
                    </p>
                  </div>

                  {notesError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{notesError}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your professional notes, observations, or recommendations for this assessment..."
                      rows={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6">
                    <button
                      onClick={() => {
                        setShowNotesModal(false);
                        setSelectedAssessment(null);
                        setNotes('');
                        setNotesError(null);
                      }}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      disabled={notesLoading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitNotes}
                      disabled={!notes.trim() || notesLoading}
                      className="px-6 py-2 bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {notesLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Notes'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && detailsAssessment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Assessment Details</h2>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailsAssessment(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-6">
                {/* User Info */}
                {detailsAssessment.user && !detailsAssessment.isAnonymous && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">User Information</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold text-gray-800">
                          {getUserDisplayName(detailsAssessment.user, userNames)}
                        </span>
                      </div>
                      {getUserEmail(detailsAssessment.user) && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Email:</strong> {getUserEmail(detailsAssessment.user)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Assessment Info */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Assessment Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Assessment Name</p>
                      <p className="font-semibold text-gray-800">{getTemplateInfo(detailsAssessment).name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="font-semibold text-gray-800">{getCategoryInfo(getTemplateInfo(detailsAssessment).category).name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Score</p>
                      <p className="font-semibold text-gray-800">{detailsAssessment.totalScore}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Severity Level</p>
                      <p className="font-semibold text-gray-800">{detailsAssessment.severityLevel}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Completed At</p>
                      <p className="font-semibold text-gray-800">
                        {new Date(detailsAssessment.completedAt || detailsAssessment.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <p className="font-semibold text-gray-800">{detailsAssessment.status}</p>
                    </div>
                  </div>
                </div>

                {/* User Notes */}
                {detailsAssessment.userNotes && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">User Notes</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{detailsAssessment.userNotes}</p>
                  </div>
                )}

                {/* Counselor Notes */}
                {detailsAssessment.counselorNotes && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2">Your Notes</h3>
                    <p className="text-gray-700 bg-purple-50 p-4 rounded-lg">{detailsAssessment.counselorNotes}</p>
                  </div>
                )}

                {/* Recommendations */}
                {detailsAssessment.recommendations && detailsAssessment.recommendations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      {detailsAssessment.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-xl border-l-4 ${rec.priority === 'high'
                            ? 'bg-purple-100/50 border-purple-600'
                            : rec.priority === 'medium'
                              ? 'bg-purple-50/50 border-purple-500'
                              : 'bg-purple-50/30 border-purple-400'
                            }`}
                        >
                          <h4 className="font-semibold text-gray-800 mb-1">{rec.title}</h4>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Immediate Support Needs */}
                {detailsAssessment.isCrisis && detailsAssessment.crisisIndicators && (
                  <div>
                    <h3 className="text-lg font-bold text-purple-800 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Immediate Support Recommended
                    </h3>
                    <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-4">
                      <p className="text-purple-900 font-medium mb-3">
                        This individual has indicated they may benefit from immediate professional support and care.
                      </p>
                      {detailsAssessment.crisisIndicators.map((indicator, index) => (
                        <div key={index} className="mb-3 last:mb-0 bg-white p-3 rounded-md">
                          <p className="text-sm text-gray-600 mb-1">Concern Area:</p>
                          <p className="text-gray-800">{getTraumaInformedText(indicator.questionText)}</p>
                          <p className="text-sm text-purple-700 mt-2">
                            Response level: {getResponseLevel(indicator.answer)}
                          </p>
                        </div>
                      ))}
                      <div className="mt-4 pt-4 border-t border-purple-200">
                        <p className="text-sm text-purple-800 font-medium">
                          💜 Recommended Action: Consider reaching out with compassion and resources for professional support.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setDetailsAssessment(null);
                }}
                className="px-6 py-2 bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CounselorAssessments;

