import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Loader2,
  X,
  Search,
  MessageSquare
} from 'lucide-react';
import {
  getAssessmentById,
  getAssessmentBySession,
  shareAssessmentWithCounselor,
  type AssessmentTemplate
} from '@/apis/assessment';
import {
  getAllCounselors,
  getCounselorById,
  type Counselor
} from '@/apis/counselor';
import {
  isUserAuthenticated,
  getCategoryInfo,
  formatAssessmentDate,
  getSeverityInfo
} from '@/utils/assessmentHelper';
import ScoreVisualization from '@/components/assessment/ScoreVisualization';

type AssessmentData = {
  id: string;
  sessionId?: string;
  totalScore: number;
  severityLevel: string;
  isCrisis: boolean;
  recommendations: Array<{
    type: 'resource' | 'action' | 'appointment';
    title: string;
    description: string;
    link?: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  completedAt: string;
  template?: AssessmentTemplate;
  templateSnapshot?: {
    name: string;
    category: string;
    version?: string;
    description?: string;
  };
  templateId?: string;
  counselorNotes?: string;
  sharedWith?: Array<{
    counselor: string;
    sharedAt: string;
    viewedAt?: string;
  }>;
};

export const AssessmentResults: React.FC = () => {
  const { id: assessmentId } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Share with counselor state
  const [showShareModal, setShowShareModal] = useState(false);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [counselorsLoading, setCounselorsLoading] = useState(false);
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>('');
  const [shareLoading, setShareLoading] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [counselorName, setCounselorName] = useState<string | null>(null);

  const isAuthenticated = isUserAuthenticated();

  const loadAssessment = useCallback(async () => {
    try {
      setLoading(true);

      // Try loading as authenticated assessment first
      const response = await getAssessmentById(assessmentId!);

      // If failed and not authenticated, try as session-based
      if (!response.success && !isAuthenticated) {
        const sessionResponse = await getAssessmentBySession(assessmentId!);
        if (sessionResponse.success && sessionResponse.data) {
          const sessionData = sessionResponse.data.assessment;
          // Map session response to AssessmentData
          setAssessment({
            id: sessionData.id,
            sessionId: sessionData.sessionId,
            totalScore: sessionData.totalScore,
            severityLevel: sessionData.severityLevel,
            isCrisis: sessionData.isCrisis,
            recommendations: sessionData.recommendations,
            completedAt: sessionData.completedAt,
            template: sessionData.template,
          });

          return;
        }
      }

      if (response.success && response.data) {
        const assessmentData = response.data.assessment;
        // Map regular response to AssessmentData
        const template = typeof assessmentData.template === 'string'
          ? null
          : assessmentData.template;

        setAssessment({
          id: assessmentData._id,
          sessionId: undefined,
          totalScore: assessmentData.totalScore,
          severityLevel: assessmentData.severityLevel,
          isCrisis: assessmentData.isCrisis,
          recommendations: assessmentData.recommendations || [],
          completedAt: assessmentData.completedAt || assessmentData.createdAt,
          template: template || undefined,
          templateSnapshot: assessmentData.templateSnapshot,
          templateId: typeof assessmentData.template === 'string' ? assessmentData.template : assessmentData.template?._id,
          counselorNotes: assessmentData.counselorNotes,
          sharedWith: assessmentData.sharedWith,
        });

        // Fetch counselor name if notes exist and sharedWith has counselor ID
        if (assessmentData.counselorNotes && assessmentData.sharedWith && assessmentData.sharedWith.length > 0) {
          const counselorId = assessmentData.sharedWith[0].counselor;
          if (counselorId && typeof counselorId === 'string') {
            try {
              const counselorResponse = await getCounselorById(counselorId);
              if (counselorResponse.success && counselorResponse.data) {
                const counselor = counselorResponse.data.counselor;
                setCounselorName(`${counselor.firstName} ${counselor.lastName}`);
              }
            } catch (err) {
              console.error('Failed to fetch counselor name:', err);
            }
          }
        }

      } else {
        setError(response.message || 'Failed to load assessment results');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [assessmentId, isAuthenticated]);

  useEffect(() => {
    // Check if assessment data was passed via navigation state
    if (location.state?.assessment) {
      const stateAssessment = location.state.assessment;
      // If we have template data,
      if (stateAssessment.template && typeof stateAssessment.template === 'object') {
        setAssessment({
          ...stateAssessment,
          templateSnapshot: stateAssessment.templateSnapshot || {
            name: stateAssessment.template.name,
            category: stateAssessment.template.category,
            version: stateAssessment.template.version,
          },
        });
      } else {
        // Store what we have and we'll use templateSnapshot for category
        setAssessment({
          ...stateAssessment,
          templateSnapshot: stateAssessment.templateSnapshot || {
            name: 'Assessment',
            category: 'general',
            version: '1.0',
          },
        });
      }
      setLoading(false);

    } else if (assessmentId) {
      loadAssessment();
    } else {
      setError('No assessment data available');
      setLoading(false);
    }
  }, [assessmentId, location.state, loadAssessment]);

  const handlePrintResults = () => {
    if (!assessment) return;
    window.print();
  };

  const handleRetake = () => {
    if (assessment && assessment.template?._id) {
      navigate(`/assessment/take/${assessment.template._id}`);
    }
  };

  const loadCounselors = useCallback(async () => {
    try {
      setCounselorsLoading(true);
      setShareError(null);
      const response = await getAllCounselors({ isAvailable: true });

      if (response.success && response.data) {
        setCounselors(response.data.counselors);
      } else {
        setShareError(response.message || 'Failed to load counselors');
      }
    } catch (err) {
      setShareError('Failed to load counselors');
      console.error(err);
    } finally {
      setCounselorsLoading(false);
    }
  }, []);

  const handleShareWithCounselor = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    if (!assessment) return;

    setShowShareModal(true);
    setSelectedCounselorId('');
    setShareError(null);
    setShareSuccess(false);
    setSearchQuery('');

    // Load counselors when modal opens
    if (counselors.length === 0) {
      loadCounselors();
    }
  };

  const handleShareSubmit = async () => {
    if (!selectedCounselorId || !assessment) return;

    try {
      setShareLoading(true);
      setShareError(null);
      setShareSuccess(false);

      const response = await shareAssessmentWithCounselor(assessment.id, selectedCounselorId);

      if (response.success) {
        setShareSuccess(true);
        setTimeout(() => {
          setShowShareModal(false);
          setShareSuccess(false);
          setSelectedCounselorId('');
        }, 2000);
      } else {
        setShareError(response.message || 'Failed to share assessment');
      }
    } catch (err) {
      setShareError('An unexpected error occurred');
      console.error(err);
    } finally {
      setShareLoading(false);
    }
  };

  // Filter counselors based on search query
  const filteredCounselors = counselors.filter(counselor => {
    const searchLower = searchQuery.toLowerCase();
    return (
      counselor.firstName.toLowerCase().includes(searchLower) ||
      counselor.lastName.toLowerCase().includes(searchLower) ||
      counselor.specialization.toLowerCase().includes(searchLower) ||
      counselor.email.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-lavender-50 py-12 px-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment) {
    return (
      <div className="min-h-screen bg-lavender-50 py-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-semibold mb-2">Unable to Load Results</p>
            <p className="text-red-600 mb-4">{error || 'Assessment not found'}</p>
            <Link to="/assessment">
              <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Back to Assessments
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Safe access to template category - prioritize templateSnapshot as it's from the actual assessment
  const category = assessment.templateSnapshot?.category ||
    assessment.template?.category ||
    'general';
  const categoryInfo = getCategoryInfo(category);
  const severityInfo = getSeverityInfo(assessment.severityLevel);

  // Get maxScore - try to get from template, or calculate from severity levels if available
  const maxScore = assessment.template?.scoringRules?.maxScore ||
    (assessment.template?.scoringRules?.severityLevels?.length
      ? Math.max(...assessment.template.scoringRules.severityLevels.map(level => level.range.max))
      : assessment.totalScore * 2); // Fallback estimate

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .bg-lavender-50 {
            background: white !important;
          }
          .shadow-xl, .shadow-lg {
            box-shadow: none !important;
          }
          button, a[href^="/"] {
            display: none !important;
          }
        }
      `}</style>
      <div className="min-h-screen bg-lavender-50 py-20 px-6 print-content">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold text-sm mb-4">
              Assessment Completed
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Your Assessment Results
            </h1>
            <p className="text-gray-600">
              Completed on {formatAssessmentDate(assessment.completedAt)}
            </p>
          </div>

          {/* Combined Assessment Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-10 mb-6">
            {/* Assessment Header */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {assessment.template?.name || assessment.templateSnapshot?.name || 'Assessment'}
                </h2>
                <span
                  className="text-xs font-medium px-3 py-1 rounded-full inline-block"
                  style={{
                    backgroundColor: `${categoryInfo.color}20`,
                    color: categoryInfo.color
                  }}
                >
                  {categoryInfo.name}
                </span>
              </div>
            </div>

            {/* Score Visualization */}
            <div className="flex justify-center py-6 mb-8">
              <ScoreVisualization
                score={assessment.totalScore}
                maxScore={maxScore}
                severityLevel={assessment.severityLevel}
                size="large"
              />
            </div>

            {/* What This Means */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                What This Means
              </h3>
              <div
                className="p-6 rounded-xl"
                style={{ backgroundColor: severityInfo.bgColor }}
              >
                <p className="text-gray-700 leading-relaxed">
                  {getSeverityDescription(assessment.severityLevel, category)}
                </p>
              </div>
            </div>

            {/* Counselor Notes - Show if available */}
            {assessment.counselorNotes && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-purple-600" />
                  Counselor Feedback
                </h3>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {assessment.counselorNotes}
                  </p>
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <p className="text-xs text-gray-600">
                      {counselorName ? (
                        <>Feedback from <span className="font-semibold text-purple-700">{counselorName}</span></>
                      ) : (
                        <>Note added by your counselor</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations - Inline */}
            {assessment.recommendations && assessment.recommendations.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Personalized Recommendations
                </h3>
                <div className="space-y-3">
                  {assessment.recommendations
                    .sort((a, b) => {
                      const priority = { high: 0, medium: 1, low: 2 };
                      return priority[a.priority] - priority[b.priority];
                    })
                    .map((recommendation, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border-l-4 ${recommendation.priority === 'high'
                          ? 'bg-red-50 border-red-500'
                          : recommendation.priority === 'medium'
                            ? 'bg-yellow-50 border-yellow-500'
                            : 'bg-blue-50 border-blue-500'
                          }`}
                      >
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {recommendation.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {recommendation.description}
                        </p>
                        {recommendation.link && (
                          <a
                            href={recommendation.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            Learn more →
                          </a>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-6 border-t border-gray-200 no-print">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Actions</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={handlePrintResults}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-xl font-semibold hover:bg-green-100 transition-all duration-200"
                >
                  Print
                </button>
                <button
                  onClick={handleShareWithCounselor}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-50 text-purple-700 rounded-xl font-semibold hover:bg-purple-100 transition-all duration-200"
                >
                  Share
                </button>
                <button
                  onClick={handleRetake}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-amber-50 text-amber-700 rounded-xl font-semibold hover:bg-amber-100 transition-all duration-200"
                >
                  Retake
                </button>
              </div>
            </div>
          </div>

          {/* Save to Dashboard CTA (for anonymous users) */}
          {!isAuthenticated && (
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl shadow-xl p-8 text-white text-center animate-fade-in-up animation-delay-1000 no-print">
              <h3 className="text-2xl font-bold mb-2">Want to Track Your Progress?</h3>
              <p className="mb-6 opacity-90">
                Create an account to save your results, track your mental health journey over time,
                and access personalized insights.
              </p>
              <Link to="/signup">
                <button className="px-8 py-3 bg-white text-purple-600 rounded-xl font-bold hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                  Create Free Account
                </button>
              </Link>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-8 p-4 bg-gray-100 rounded-xl text-center text-sm text-gray-600 animate-fade-in-up animation-delay-1200">
            <p>
              <strong>Important:</strong> This assessment is a screening tool, not a diagnostic instrument.
              Always consult with a qualified healthcare professional for proper evaluation and treatment.
            </p>
          </div>

          {/* Back to Assessments */}
          <div className="mt-6 text-center no-print">
            <Link
              to="/assessments"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              View All Assessments
            </Link>
          </div>
        </div>
      </div>

      {/* Share with Counselor Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Share Assessment with Counselor</h2>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedCounselorId('');
                  setShareError(null);
                  setShareSuccess(false);
                  setSearchQuery('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {shareSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Assessment Shared Successfully!</h3>
                  <p className="text-gray-600">Your assessment has been shared with the selected counselor.</p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Select a counselor to share your assessment results with. They will be able to view your assessment and provide guidance.
                  </p>

                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search counselors by name, specialization, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Error Message */}
                  {shareError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700 text-sm">{shareError}</p>
                    </div>
                  )}

                  {/* Counselors List */}
                  {counselorsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                    </div>
                  ) : filteredCounselors.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        {searchQuery ? 'No counselors found matching your search.' : 'No counselors available at the moment.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredCounselors.map((counselor) => (
                        <div
                          key={counselor._id}
                          onClick={() => setSelectedCounselorId(counselor._id)}
                          className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedCounselorId === counselor._id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                              {counselor.profilePicture ? (
                                <img
                                  src={counselor.profilePicture}
                                  alt={`${counselor.firstName} ${counselor.lastName}`}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-lg">
                                  {counselor.firstName[0]}{counselor.lastName[0]}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-800">
                                  {counselor.firstName} {counselor.lastName}
                                </h3>
                                {counselor.isVerified && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Verified
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{counselor.specialization}</p>
                              {counselor.experience > 0 && (
                                <p className="text-xs text-gray-500">
                                  {counselor.experience} years of experience
                                </p>
                              )}
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedCounselorId === counselor._id
                              ? 'border-purple-500 bg-purple-500'
                              : 'border-gray-300'
                              }`}>
                              {selectedCounselorId === counselor._id && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            {!shareSuccess && (
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    setSelectedCounselorId('');
                    setShareError(null);
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={shareLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareSubmit}
                  disabled={!selectedCounselorId || shareLoading}
                  className="px-6 py-2 bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {shareLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sharing...
                    </>
                  ) : (
                    'Share Assessment'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

// Helper function to get severity description
function getSeverityDescription(severity: string, category: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    depression: {
      'doing-well': 'Your responses suggest minimal depressive symptoms. You appear to be managing well emotionally.',
      'some-challenges': 'Your responses suggest mild to moderate depressive symptoms. Consider implementing self-care strategies and monitoring your mood.',
      'significant-challenges': 'Your responses suggest moderate to moderately severe depressive symptoms. We recommend speaking with a mental health professional.',
      'very-difficult-time': 'Your responses suggest moderately severe depressive symptoms. Professional support is strongly recommended.',
      'intense-struggle': 'Your responses suggest severe depressive symptoms. Please seek immediate professional help.',
    },
    anxiety: {
      'feeling-calm': 'Your responses suggest minimal anxiety symptoms. You appear to be managing stress well.',
      'some-worry': 'Your responses suggest mild anxiety symptoms. Some stress management techniques may be helpful.',
      'notable-worry': 'Your responses suggest moderate anxiety symptoms. Consider speaking with a mental health professional.',
      'overwhelming-feelings': 'Your responses suggest severe anxiety symptoms. Professional support is strongly recommended.',
    },
  };

  const normalizedSeverity = severity.toLowerCase().replace(/\s+/g, '-');
  return descriptions[category]?.[normalizedSeverity] ||
    'Your responses have been recorded. We recommend consulting with a mental health professional for personalized guidance.';
}

export default AssessmentResults;

