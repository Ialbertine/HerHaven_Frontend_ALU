import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, Loader2, Shield, Clock, CheckCircle } from 'lucide-react';
import type { AssessmentTemplate } from '@/apis/assessment';
import { getAssessmentTemplateById, getPublicTemplateToBegin } from '@/apis/assessment';
import { smartSubmitAssessment, validateResponses, getCategoryInfo, isUserAuthenticated, saveAnonymousSessionId } from '@/utils/assessmentHelper';
import ProgressBar from '@/components/assessment/ProgressBar';
import QuestionRenderer from '@/components/assessment/QuestionRenderer';
import { useModal } from '@/contexts/useModal';

type AssessmentResponse = {
  questionId: string;
  answer: string | number | (string | number)[];
};

type ViewMode = 'welcome' | 'assessment' | 'submitting';

export const TakeAssessment: React.FC = () => {
  const { id: templateId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert, showConfirm } = useModal();

  const [template, setTemplate] = useState<AssessmentTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);

  const isAuthenticated = isUserAuthenticated();
  const currentQuestion = template?.questions[currentQuestionIndex];
  const currentResponse = responses.find(r => r.questionId === currentQuestion?.questionId);

  // Initialize scale questions with default value if not answered
  useEffect(() => {
    if (currentQuestion && currentQuestion.type === 'scale' && !currentResponse) {
      // Set default value to middle of scale
      const options = currentQuestion.options || [];
      let defaultValue = 5; 

      if (options.length > 0) {
        const firstValue = options[0].value;
        const lastValue = options[options.length - 1].value;
        defaultValue = Math.floor((firstValue + lastValue) / 2);
      }

      const questionId = currentQuestion.questionId;
      setResponses(prev => {
        // Check if response already exists
        if (prev.find(r => r.questionId === questionId)) {
          return prev;
        }
        return [...prev, { questionId, answer: defaultValue }];
      });
    }
  }, [currentQuestionIndex, currentQuestion, currentResponse]);

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);


  const loadTemplate = async () => {
    try {
      setLoading(true);

      // Use public endpoint if user is not authenticated, otherwise use authenticated endpoint
      const response = isAuthenticated
        ? await getAssessmentTemplateById(templateId!)
        : await getPublicTemplateToBegin(templateId!);

      if (response.success && response.data) {
        const sortedQuestions = [...response.data.template.questions].sort((a, b) => a.order - b.order);
        setTemplate({
          ...response.data.template,
          questions: sortedQuestions,
        });
      } else {
        setError(response.message || 'Failed to load assessment');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartAssessment = () => {
    setViewMode('assessment');
  };

  const handleAnswerChange = (answer: string | number | (string | number)[]) => {
    const questionId = currentQuestion!.questionId;
    const existingIndex = responses.findIndex(r => r.questionId === questionId);

    if (existingIndex >= 0) {
      const newResponses = [...responses];
      newResponses[existingIndex] = { questionId, answer };
      setResponses(newResponses);
    } else {
      setResponses([...responses, { questionId, answer }]);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < template!.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!template) return;

    // Validate responses
    const validation = validateResponses(template, responses);
    if (!validation.isValid) {
      showAlert(
        validation.errors.join('\n'),
        'Validation Error',
        'warning'
      );
      return;
    }

    try {
      setViewMode('submitting');

      const result = await smartSubmitAssessment({
        templateId: template._id,
        responses: responses,
      });

      if (result.success && result.data) {
        const assessment = result.data.assessment;

        // Save session ID for anonymous users
        if (assessment.sessionId && !isAuthenticated) {
          saveAnonymousSessionId(assessment.sessionId);
        }

        // Prepare assessment data with template info
        const assessmentData = {
          ...assessment,
          template: template, // Include the full template with scoringRules
          templateSnapshot: {
            name: template.name,
            category: template.category,
            version: template.version,
          }
        };

        // Navigate to results page
        navigate(`/assessment/results/${assessment.id}`, {
          state: { assessment: assessmentData }
        });
      } else {
        setError(result.message || 'Failed to submit assessment');
        setViewMode('assessment');
      }
    } catch (err) {
      setError('An unexpected error occurred while submitting');
      setViewMode('assessment');
      console.error(err);
    }
  };

  const handleSaveAndExit = () => {
    if (isAuthenticated) {
      showAlert(
        'Your progress has been saved. You can continue later from your dashboard.',
        'Progress Saved',
        'success'
      );
      navigate('/login');
    } else {
      showConfirm(
        'Your progress will be lost if you exit now. Sign in to save your progress. Continue anyway?',
        () => {
          navigate('/assessments');
        },
        'Exit Assessment',
        'warning',
        'Exit',
        'Stay'
      );
    }
  };

  // Welcome Screen
  const renderWelcome = () => {
    if (!template) return null;
    const categoryInfo = getCategoryInfo(template.category);

    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:pt-12 mt-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {template.name}
              </h1>
              <span
                className="text-sm font-medium px-3 py-1 rounded-full inline-block mt-2"
                style={{
                  backgroundColor: `${categoryInfo.color}20`,
                  color: categoryInfo.color
                }}
              >
                {categoryInfo.name}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            {template.description}
          </p>

          {/* Assessment Info */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Duration</p>
              <p className="text-lg font-bold text-gray-800">{template.estimatedDuration} min</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <CheckCircle className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Questions</p>
              <p className="text-lg font-bold text-gray-800">{template.questions.length}</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Confidential</p>
              <p className="text-lg font-bold text-gray-800">100%</p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Your Privacy Matters
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your responses are encrypted and stored securely</li>
              <li>• You can take this assessment anonymously</li>
              <li>• Results are for informational purposes only</li>
              <li>• This is not a diagnostic tool - consult a professional for diagnosis</li>
            </ul>
          </div>

          {/* Authentication Status */}
          {!isAuthenticated && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Not signed in?</strong> You can still take this assessment anonymously.
                However, <Link to="/login" className="underline font-semibold">sign in</Link> to save
                your results and track your progress over time.
              </p>
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStartAssessment}
            className="w-full bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-[#7b1fa2] hover:to-[#8e24aa] transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2"
          >
            Begin Assessment
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  // Assessment Screen
  const renderAssessment = () => {
    if (!template || !currentQuestion) return null;

    const isLastQuestion = currentQuestionIndex === template.questions.length - 1;
    // Check if answer exists and is valid
    const canGoNext = currentResponse !== undefined &&
      currentResponse.answer !== undefined &&
      currentResponse.answer !== null &&
      (currentQuestion.type === 'text' ? String(currentResponse.answer).trim() !== '' : true) &&
      (currentQuestion.type === 'multiple-choice' ? Array.isArray(currentResponse.answer) && currentResponse.answer.length > 0 : true);

    return (
      <div className="w-full max-w-4xl mx-auto xl:flex xl:flex-col xl:items-center xl:pt-20 md:pb-16 xl:pb-0">
        {/* Progress */}
        <div className="w-full bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in-up">
          <ProgressBar
            current={currentQuestionIndex + 1}
            total={template.questions.length}
          />
        </div>

        {/* Question Card */}
        <div className="w-full bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-6 animate-fade-in-up animation-delay-200">
          <QuestionRenderer
            question={currentQuestion}
            answer={currentResponse?.answer}
            onAnswerChange={handleAnswerChange}
          />
        </div>

        {/* Navigation */}
        <div className="w-full flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-400">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleSaveAndExit}
            className="sm:flex-none px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save & Exit
          </button>

          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white rounded-xl font-semibold hover:shadow-lg hover:from-[#7b1fa2] hover:to-[#8e24aa] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLastQuestion ? 'Submit' : 'Next'}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Reminder */}
        <div className="w-full mt-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2 animate-fade-in-up animation-delay-600">
          <Shield className="w-4 h-4" />
          Your responses are confidential and secure
        </div>
      </div>
    );
  };

  // Submitting Screen
  const renderSubmitting = () => (
    <div className="w-full flex items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center animate-fade-in-up">
          <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Processing Your Responses
          </h2>
          <p className="text-gray-600">
            Please wait while we analyze your assessment and prepare personalized recommendations...
          </p>
        </div>
      </div>
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-lavender-50 py-12 px-6 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-lavender-50 py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 font-semibold mb-2">Error</p>
            <p className="text-red-600 mb-4">{error}</p>
            <Link to="/assessments">
              <button className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Back to Assessments
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`min-h-screen bg-lavender-50 px-6 relative ${viewMode === 'welcome' ? 'flex flex-col justify-center py-12' : 'pt-24'}`}>
        {/* Back Link */}
        {viewMode === 'welcome' && (
          <div className="absolute top-24 left-6 right-6">
            <div className="max-w-7xl mx-auto">
              <Link
                to="/assessments"
                className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Assessments
              </Link>
            </div>
          </div>
        )}

        {/* Content */}
        {viewMode === 'welcome' && renderWelcome()}
        {viewMode === 'assessment' && renderAssessment()}
        {viewMode === 'submitting' && renderSubmitting()}
      </div>

    </>
  );
};

export default TakeAssessment;

