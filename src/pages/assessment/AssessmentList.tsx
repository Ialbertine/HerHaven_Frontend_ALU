import React, { useEffect, useState, useCallback } from 'react';
import { Search, Filter, Loader2, Shield, Clock, CheckCircle, Heart, Brain, ArrowRight, AlertCircle } from 'lucide-react';
import type { AssessmentTemplate } from '@/apis/assessment';
import { getPublicAssessmentTemplates, getCategoryInfo } from '@/utils/assessmentHelper';
import AssessmentCard from '@/components/assessment/AssessmentCard';

type CategoryFilter = 'all' | 'depression' | 'anxiety' | 'ptsd' | 'safety' | 'wellness' | 'general';

export const AssessmentList: React.FC = () => {
  const [templates, setTemplates] = useState<AssessmentTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<AssessmentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showInfo] = useState(true);

  const categories: CategoryFilter[] = ['all', 'depression', 'anxiety', 'ptsd', 'safety', 'wellness', 'general'];

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await getPublicAssessmentTemplates();

      if (response.success && response.data) {
        setTemplates(response.data.templates);
        setFilteredTemplates(response.data.templates);
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

  const filterTemplates = useCallback(() => {
    let filtered = [...templates];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchQuery]);

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [filterTemplates]);

  const getCategoryButton = (category: CategoryFilter) => {
    const isActive = selectedCategory === category;
    const categoryInfo = category === 'all' ?
      { name: 'All', color: '#6366f1' } :
      getCategoryInfo(category);

    return (
      <button
        key={category}
        onClick={() => setSelectedCategory(category)}
        className={`px-4 py-2 rounded-full font-medium transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${isActive
          ? 'text-white shadow-lg scale-105'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        style={isActive ? {
          background: `linear-gradient(135deg, ${categoryInfo.color}, ${categoryInfo.color}dd)`,
        } : {}}
      >
        <span>{categoryInfo.name}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-lavender-50 pt-12 px-0 md:px-6">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto py-10 px-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full font-semibold text-sm mb-6">
          <Heart className="w-4 h-4" />
          Mental Health Self-Assessment
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight text-gray-800">
          Your Mental Health Matters
        </h1>
        <p className="text-base md:text-lg text-gray-700 mb-6 leading-relaxed">
          Take the first step toward understanding your mental well-being with our assessments.
        </p>
        <div className="flex items-center justify-center">
          <button
            onClick={() => {
              const assessmentsSection = document.getElementById('assessments-section');
              assessmentsSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-6 py-3 bg-white text-purple-600 rounded-full font-semibold text-base hover:bg-purple-50 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2"
          >
            Start Assessment
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto"> 

        {/* Information Section */}
        {showInfo && (
          <div className="px-6 py-16 space-y-12 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">What is Mental Health Self-Assessment?</h2>
              </div>
              <p className="text-base text-gray-600 leading-relaxed mb-6">
                A mental health self-assessment is simply a set of questions about how you've been feeling lately.
                It's like checking in with yourself to see how you're doing. There are no right or wrong answers—just
                honest thoughts about your experiences. These questions can help you understand what you might be going
                through and whether it might be helpful to talk with someone who can support you.
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-purple-50 rounded-2xl p-6 border-2 border-purple-100">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    Why Take an Assessment?
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Get a better sense of how you're feeling and what you might need</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Notice if there are things that have been weighing on you</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>See how your feelings change over time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Feel more prepared when talking to someone who can help</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-pink-50 rounded-2xl p-6 border-2 border-pink-100">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-pink-600" />
                    Important to Know
                  </h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1">•</span>
                      <span>This is not a diagnosis—only a trained professional can do that</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1">•</span>
                      <span>Your results are just a starting point, not a final answer</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1">•</span>
                      <span>If you're worried about how you're feeling, reach out to a doctor or counselor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-500 mt-1">•</span>
                      <span>Your answers can help you figure out what kind of support might be helpful</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Privacy Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-base text-gray-600 leading-relaxed">
                  We take your privacy seriously. Your information is kept safe and secure, and you decide who can see your results.
                  You can choose to share your results with counselors if you want, or keep them completely to yourself.
                </p>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-3xl shadow-xl p-8 md:p-12 text-white">
              <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-base mb-2">Choose Assessment</h3>
                  <p className="text-purple-100 text-xs">
                    Select an assessment that matches your concerns or interests
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-base mb-2">Answer Questions</h3>
                  <p className="text-purple-100 text-xs">
                    Respond honestly to questions about your feelings and experiences
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-base mb-2">Get Results</h3>
                  <p className="text-purple-100 text-xs">
                    Receive instant feedback with your assessment scores
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl font-bold">4</span>
                  </div>
                  <h3 className="font-semibold text-base mb-2">Take Action</h3>
                  <p className="text-purple-100 text-xs">
                    Get personalized recommendations and resources
                  </p>
                </div>
              </div>
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">100% Confidential</h3>
                <p className="text-sm text-gray-600">
                  Your responses are encrypted and stored securely. You can take assessments anonymously without creating an account.
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-3">Quick & Easy</h3>
                <p className="text-sm text-gray-600">
                  Most assessments take just 5-10 minutes to complete. Get instant results with actionable insights and recommendations.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Assessments Section */}
        <div id="assessments-section" className="px-6 py-16 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Available Assessments
            </h2>
            <p className="text-base text-gray-600 max-w-3xl mx-auto">
              Choose from our range of validated mental health assessments to understand different aspects of your well-being.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assessments by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-200 shadow-sm"
              />
            </div>

            {/* Category Filters */}
            <div className="flex items-center gap-2 justify-center flex-wrap">
              <Filter className="w-5 h-5 text-gray-400" />
              {categories.map(category => getCategoryButton(category))}
            </div>
          </div>

          {/* Results Count */}
          {!loading && !error && (
            <div className="mb-8 text-center text-gray-600">
              {filteredTemplates.length === 0 ? (
                <p className="text-lg">No assessments found matching your criteria</p>
              ) : (
                <p className="text-lg">
                  Showing <span className="font-bold text-base">{filteredTemplates.length}</span> assessment{filteredTemplates.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {/* Assessment Cards Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading assessments...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-16">
              <p className="text-red-700 font-semibold mb-2">Error Loading Assessments</p>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadTemplates}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-16">
              {filteredTemplates.map((template, index) => (
                <div
                  key={template._id}
                  className="transform transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <AssessmentCard template={template} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-700 mb-3">
                No Assessments Found
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                We couldn't find any assessments matching your search criteria. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Clear All Filters
              </button>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-12 bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-800 mb-2">Important Medical Disclaimer</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  These self-assessment tools are designed for screening purposes only and are not meant to diagnose any mental health condition.
                  Results should not replace professional medical advice, diagnosis, or treatment. If you're experiencing a mental health emergency,
                  please call <strong>116, 9059 (National Suicide & Crisis Lifeline)</strong> or visit your nearest emergency room.
                  Always consult with a qualified healthcare provider for proper diagnosis and treatment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentList;

