import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, Users, Shield, Brain, AlertCircle } from 'lucide-react';

interface Article {
  id: number;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  fullContent: string;
  icon: React.ElementType;
}

const ARTICLES: Article[] = [
  {
    id: 1,
    category: "Understanding Mental Health",
    title: "Recognizing Symptoms of Mental Health",
    description: "Learn to identify common signs and symptoms of mental health challenges",
    imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop",
    fullContent: "Mental health is just as important as physical health. Recognizing symptoms early can lead to better outcomes. Common signs include persistent sadness, excessive worry, changes in sleep or appetite, difficulty concentrating, and withdrawal from activities you once enjoyed. Remember, experiencing these symptoms doesn't mean weakness - it means you're human and may benefit from support.",
    icon: Brain
  },
  {
    id: 2,
    category: "Understanding Mental Health",
    title: "Managing Triggers and Emotions",
    description: "Strategies for identifying and coping with emotional triggers",
    imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop",
    fullContent: "Triggers are situations, people, or experiences that provoke strong emotional responses. Learning to identify your triggers is the first step in managing them. Keep a journal to track patterns. When triggered, practice grounding techniques like deep breathing, the 5-4-3-2-1 method, or progressive muscle relaxation. Remember to be patient with yourself - healing takes time.",
    icon: Heart
  },
  {
    id: 3,
    category: "Coping and Healing",
    title: "Building Resilience After Trauma",
    description: "Evidence-based approaches to strengthen your emotional resilience",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop",
    fullContent: "Resilience is the ability to bounce back from adversity. After trauma, building resilience involves creating a support network, practicing self-care, setting boundaries, and developing healthy coping mechanisms. Engage in activities that bring joy, maintain routines, and don't hesitate to seek professional help. Your strength lies not in avoiding difficulty, but in moving through it.",
    icon: Shield
  },
  {
    id: 4,
    category: "Coping and Healing",
    title: "Self-Care Practices for Mental Wellness",
    description: "Daily practices to nurture your mental and emotional wellbeing",
    imageUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=300&fit=crop",
    fullContent: "Self-care isn't selfish - it's essential. Start with small, consistent practices: maintain a regular sleep schedule, engage in physical activity you enjoy, eat nourishing foods, and set aside time for activities that bring you peace. Practice mindfulness, limit social media, and learn to say no. Remember, self-care looks different for everyone - find what works for you.",
    icon: Heart
  },
  {
    id: 5,
    category: "GBV Awareness",
    title: "Understanding Gender-Based Violence",
    description: "Recognizing forms of GBV and available support resources",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop",
    fullContent: "Gender-based violence (GBV) includes physical, sexual, emotional, and economic abuse. It affects millions of women worldwide. Recognizing GBV is crucial - it can be subtle or overt. No form of violence is acceptable. If you're experiencing GBV, know that it's not your fault and help is available. Reach out to trusted friends, family, or professional services for support.",
    icon: AlertCircle
  },
  {
    id: 6,
    category: "GBV Awareness",
    title: "The Impact of Violence",
    description: "Understanding the psychological effects of trauma and abuse",
    imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop",
    fullContent: "Violence and trauma can have profound psychological impacts including PTSD, anxiety, depression, and complex trauma responses. These reactions are normal responses to abnormal situations. Healing is possible through trauma-informed therapy, support groups, and self-care practices. Your experiences are valid, and you deserve support and healing.",
    icon: Brain
  },
  {
    id: 7,
    category: "Rights & Protection",
    title: "Legal Rights and Resources for Survivors",
    description: "Know your rights and access legal protection services",
    imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop",
    fullContent: "Survivors of abuse have legal rights including protection orders, access to justice, and the right to safety. Many organizations provide free legal assistance to survivors. You have the right to report abuse, seek medical care, and access support services. Document incidents when safe to do so, and reach out to legal aid organizations in your area.",
    icon: Shield
  },
  {
    id: 8,
    category: "Rights & Protection",
    title: "Safety Planning and Emergency Support",
    description: "Creating a comprehensive safety plan for yourself and loved ones",
    imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop",
    fullContent: "A safety plan is crucial if you're in an abusive situation. Identify safe places to go, keep important documents accessible, memorize emergency numbers, establish a code word with trusted contacts, and set aside emergency funds if possible. Have a bag packed with essentials. Remember, your safety is the priority - there are people and organizations ready to help.",
    icon: AlertCircle
  },
  {
    id: 9,
    category: "Community Support",
    title: "Connecting with Peer Support Groups",
    description: "Find strength and understanding in shared experiences",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop",
    fullContent: "Peer support groups provide a space where survivors can share experiences, receive validation, and learn coping strategies from others who understand. These groups can reduce feelings of isolation and provide practical advice. Whether in-person or online, connecting with others on similar healing journeys can be transformative.",
    icon: Users
  },
  {
    id: 10,
    category: "Community Support",
    title: "Building Your Support Network",
    description: "Creating a circle of care for your healing journey",
    imageUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=300&fit=crop",
    fullContent: "A strong support network is vital for healing. Include trusted friends, family members, counselors, support groups, and crisis hotlines. Be selective - surround yourself with people who believe you, respect your boundaries, and support your healing. It's okay if your network is small; quality matters more than quantity. Remember, asking for help is a sign of strength.",
    icon: Users
  }
];

const ITEMS_PER_PAGE = 9;

const CATEGORIES = [
  "All",
  "Understanding Mental Health",
  "Coping and Healing",
  "GBV Awareness",
  "Rights & Protection",
  "Community Support"
];

export default function EducationalHub() {
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredArticles = ARTICLES.filter(article => {
    const matchesCategory = activeCategory === "All" || article.category === activeCategory;
    const matchesSearch = searchQuery === "" || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-purple-50 via-pink-50 to-lavender-50">
      {/* Header */}
      <div className="">
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Educational Hub
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Empowering you with knowledge and understanding about mental health, trauma recovery, and community support
          </p>
        </div>

        {/* Search and Category Section */}
        <div className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-6">
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 md:gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm transition-all ${
                    activeCategory === category
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-300 hover:border-purple-500 hover:text-purple-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {currentArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentArticles.map((article) => {
              const Icon = article.icon;
              return (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Icon className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      {article.category}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {article.description}
                    </p>
                    <div className="mt-4 text-purple-600 font-semibold text-sm group-hover:gap-2 inline-flex items-center">
                      Read More
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  currentPage === page
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'border border-purple-200 text-purple-600 hover:bg-purple-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-purple-200 text-purple-600 hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header Image */}
            <div className="relative h-64 overflow-hidden rounded-t-3xl">
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => setSelectedArticle(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-colors shadow-lg"
              >
                <X className="w-5 h-5 text-gray-800" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Category Badge */}
              <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                {selectedArticle.category}
              </div>

              {/* Title */}
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {selectedArticle.title}
              </h2>

              {/* Description */}
              <p className="text-gray-600 text-lg mb-6 italic">
                {selectedArticle.description}
              </p>

              {/* Full Content */}
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedArticle.fullContent}
                </p>
              </div>

              {/* Support Section */}
              <div className="mt-8 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2">Need Support?</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      If you're struggling or need someone to talk to, our support services are available 24/7. You're not alone on this journey.
                    </p>
                    <button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-shadow">
                      Get Support Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}