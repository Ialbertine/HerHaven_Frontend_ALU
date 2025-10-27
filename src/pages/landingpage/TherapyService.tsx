import React, { useState, useEffect } from "react";
import {
  Search,
  Star,
  Calendar,
  Award,
  X,
  User,
  Shield,
} from "lucide-react";
import {
  getAllCounselors,
  getCounselorById,
  getSpecializations,
  type Counselor,
} from "@/apis/counselor";

const TherapyService: React.FC = () => {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("all");
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [counselorsRes, specsRes] = await Promise.all([
        getAllCounselors({}),
        getSpecializations(),
      ]);

      if (counselorsRes.success && counselorsRes.data) {
        setCounselors(counselorsRes.data.counselors);
      }

      if (specsRes.success && specsRes.data) {
        setSpecializations(specsRes.data.specializations);
      }
    } catch (error) {
      console.error("Error loading counselors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCounselorClick = async (counselorId: string) => {
    try {
      setDetailsLoading(true);
      const response = await getCounselorById(counselorId);

      if (response.success && response.data) {
        setSelectedCounselor(response.data.counselor);
        setShowDetailsModal(true);
      } else {
        console.error("Failed to load counselor details:", response.message);
      }
    } catch (error) {
      console.error("Error loading counselor details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredCounselors = counselors.filter((counselor) => {
    const matchesSearch =
      counselor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.bio.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpec =
      selectedSpec === "all" || counselor.specialization === selectedSpec;

    return matchesSearch && matchesSpec;
  });

  // Helper function to render profile picture or initials
  const renderProfilePicture = (counselor: Counselor, size: "sm" | "lg" = "sm") => {
    const sizeClasses = size === "lg" ? "w-16 h-16 text-xl" : "w-16 h-16 text-xl";
    const hasImageError = imageErrors.has(counselor._id);
    const profilePicture = counselor.profilePicture;

    const hasValidImage = profilePicture &&
      typeof profilePicture === 'string' &&
      profilePicture.trim() !== "" &&
      profilePicture !== 'null' &&
      profilePicture !== 'undefined' &&
      !hasImageError;

    const initialsDiv = (
      <div className={`${sizeClasses} bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold shadow-md`}>
        {counselor.firstName.charAt(0)}
        {counselor.lastName.charAt(0)}
      </div>
    );

    if (hasValidImage) {
      return (
        <div className="relative">
          <img
            src={profilePicture}
            alt={`${counselor.firstName} ${counselor.lastName}`}
            className={`${sizeClasses} rounded-full object-cover shadow-md`}
            onError={() => {
              setImageErrors(prev => new Set(prev).add(counselor._id));
            }}
          />
        </div>
      );
    }

    return initialsDiv;
  };

  return (
    <section className="relative min-h-screen pt-24 pb-20 px-6 bg-lavender-50">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-float-medium"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in-up">
          <p className="text-[#9c27b0] text-lg mb-4 font-medium">
            Professional Support
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
            Our Expert Therapists
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Connect with licensed, verified Therapists who specialize in trauma recovery,
            mental health support, and empowering women on their healing journey.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Filters & Search */}
            <div className="bg-white/80 backdrop-blur-sm w-[70%] mx-auto rounded-2xl shadow-lg p-6 mb-8 animate-fade-in-up animation-delay-200">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by name, specialization, or bio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Specialization Filter */}
                <select
                  value={selectedSpec}
                  onChange={(e) => setSelectedSpec(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[200px]"
                >
                  <option value="all">All Specializations</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Counselors Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCounselors.map((counselor, index) => (
                <div
                  key={counselor._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up cursor-pointer"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleCounselorClick(counselor._id)}
                >
                  {/* Counselor Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {renderProfilePicture(counselor, "sm")}
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg">
                          {counselor.firstName} {counselor.lastName}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-medium">{counselor.averageRating}</span>
                          <span className="text-gray-400">({counselor.totalSessions} reviews)</span>
                        </div>
                      </div>
                    </div>
                    {counselor.isAvailable && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        Available
                      </span>
                    )}
                  </div>

                  {/* Specialization */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                      <Award className="w-4 h-4" />
                      <span>{counselor.specialization}</span>
                    </div>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span>{counselor.experience} years of experience</span>
                  </div>

                  {/* Bio Preview */}
                  <p className="text-sm text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                    {counselor.bio}
                  </p>

                  {/* Verification Badge */}
                  {counselor.isVerified && (
                    <div className="flex items-center gap-2 text-xs text-green-600 mb-4">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">Verified Professional</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200">
                    <span className="text-purple-600 font-medium">Click to view details</span>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredCounselors.length === 0 && !loading && (
              <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No counselors found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search criteria or filters
                </p>
              </div>
            )}

            {/* Counselor Details Modal */}
            {showDetailsModal && selectedCounselor && (
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 pt-20"
                onClick={() => setShowDetailsModal(false)}
              >
                <div
                  className="bg-white rounded-2xl max-w-2xl w-full max-h-[calc(90vh-5rem)] overflow-y-auto shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {detailsLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <>
                      {/* Modal Header */}
                      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {selectedCounselor && renderProfilePicture(selectedCounselor, "lg")}
                            <div>
                              <h2 className="text-2xl font-bold text-gray-800">
                                {selectedCounselor.firstName} {selectedCounselor.lastName}
                              </h2>
                              <div className="flex items-center gap-2 text-sm text-purple-600 font-medium">
                                <Award className="w-4 h-4" />
                                <span>{selectedCounselor.specialization}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowDetailsModal(false)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      </div>

                      {/* Modal Content */}
                      <div className="p-6 space-y-6">
                        {/* Rating & Stats */}
                        <div className="flex items-center gap-6 p-4 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            <span className="text-lg font-bold text-gray-800">
                              {selectedCounselor.averageRating}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedCounselor.totalSessions} sessions completed
                          </div>
                          {selectedCounselor.isAvailable && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Available for sessions
                            </span>
                          )}
                        </div>

                        {/* About */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-600" />
                            About
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {selectedCounselor.bio}
                          </p>
                        </div>

                        {/* Experience */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            Experience
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-500">Years of Experience</div>
                              <div className="text-xl font-bold text-purple-600">
                                {selectedCounselor.experience}
                              </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-500">Sessions Completed</div>
                              <div className="text-xl font-bold text-purple-600">
                                {selectedCounselor.totalSessions}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Specialization */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Award className="w-5 h-5 text-purple-600" />
                            Specialization
                          </h3>
                          <div className="p-4 bg-purple-50 rounded-lg">
                            <span className="text-purple-700 font-medium">
                              {selectedCounselor.specialization}
                            </span>
                          </div>
                        </div>

                        {/* Verification */}
                        {selectedCounselor.isVerified && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                              <Shield className="w-5 h-5 text-purple-600" />
                              Verification
                            </h3>
                            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                              <Shield className="w-5 h-5 text-green-600" />
                              <span className="text-green-700 font-medium">
                                Verified and Licensed Professional
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Contact & Action */}
                        <div className="pt-6 border-t border-gray-200">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium">
                              Book a Session
                            </button>
                            <button
                              onClick={() => setShowDetailsModal(false)}
                              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default TherapyService;