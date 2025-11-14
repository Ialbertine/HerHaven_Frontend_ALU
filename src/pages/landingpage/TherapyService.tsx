import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, Award, X, User, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getAllCounselors,
  getCounselorById,
  getSpecializations,
  type Counselor,
} from "@/apis/counselor";
import { loadFromCache, saveToCache } from "@/utils/offlineCache";
import useOfflineStatus from "@/hooks/useOfflineStatus";
import { useTranslation } from "react-i18next";

const COUNSELORS_CACHE_KEY = "therapy_service_counselors_v1";
const SPECIALIZATIONS_CACHE_KEY = "therapy_service_specializations_v1";
const COUNSELOR_DETAIL_CACHE_PREFIX = "therapy_service_counselor_detail_v1::";
const CACHE_TTL = 1000 * 60 * 60 * 12;

const buildCounselorDetailCacheKey = (id: string) =>
  `${COUNSELOR_DETAIL_CACHE_PREFIX}${id}`;

const TherapyService: React.FC = () => {
  const { t } = useTranslation("landing");
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpec, setSelectedSpec] = useState("all");
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [dataError, setDataError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const isOffline = useOfflineStatus();

  const loadData = useCallback(
    async ({ showLoader = true }: { showLoader?: boolean } = {}) => {
      if (showLoader) setLoading(true);
      setDataError(null);

      try {
        const [counselorsRes, specsRes] = await Promise.all([
          getAllCounselors({}),
          getSpecializations(),
        ]);

        if (!counselorsRes.success || !counselorsRes.data) {
          throw new Error(counselorsRes.message || "Failed to load counselors");
        }

        if (!specsRes.success || !specsRes.data) {
          throw new Error(specsRes.message || "Failed to load specializations");
        }

        setCounselors(counselorsRes.data.counselors);
        saveToCache(COUNSELORS_CACHE_KEY, counselorsRes.data.counselors);

        setSpecializations(specsRes.data.specializations);
        saveToCache(SPECIALIZATIONS_CACHE_KEY, specsRes.data.specializations);
      } catch (error) {
        console.error("Error loading counselors:", error);
        const cachedCounselors = loadFromCache<Counselor[]>(
          COUNSELORS_CACHE_KEY,
          CACHE_TTL
        );
        const cachedSpecializations = loadFromCache<string[]>(
          SPECIALIZATIONS_CACHE_KEY,
          CACHE_TTL
        );
        const hasCachedCounselors = Boolean(
          cachedCounselors && cachedCounselors.length
        );
        const hasCachedSpecializations = Boolean(
          cachedSpecializations && cachedSpecializations.length
        );
        if (hasCachedCounselors) setCounselors(cachedCounselors as Counselor[]);
        if (hasCachedSpecializations)
          setSpecializations(cachedSpecializations as string[]);
        if (!hasCachedCounselors && !hasCachedSpecializations) {
          setDataError(
            "Unable to load therapist information right now. Please try again later."
          );
        }
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const cachedCounselors = loadFromCache<Counselor[]>(
      COUNSELORS_CACHE_KEY,
      CACHE_TTL
    );
    const cachedSpecializations = loadFromCache<string[]>(
      SPECIALIZATIONS_CACHE_KEY,
      CACHE_TTL
    );
    const hasAnyCached = Boolean(
      (cachedCounselors && cachedCounselors.length) ||
      (cachedSpecializations && cachedSpecializations.length)
    );

    if (cachedCounselors && cachedCounselors.length) {
      setCounselors(cachedCounselors);
      setLoading(false);
    }

    if (cachedSpecializations && cachedSpecializations.length) {
      setSpecializations(cachedSpecializations);
      setLoading(false);
    }

    if (!isOffline) {
      const showLoader = !hasAnyCached;
      void loadData({ showLoader });
    } else if (!hasAnyCached) {
      setLoading(false);
      setDataError(
        (prev) =>
          prev ?? "Therapist information will load once you're back online."
      );
    }
  }, [isOffline, loadData]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showDetailsModal) {
      // prevent body scroll when modal is open
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      return () => {
        // allow to scroll when model is closed
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showDetailsModal]);

  const handleCounselorClick = async (counselorId: string) => {
    const counselorFromList =
      counselors.find((c) => c._id === counselorId) || null;

    if (isOffline && counselorFromList) {
      setSelectedCounselor(counselorFromList);
      setShowDetailsModal(true);
      return;
    }

    try {
      setDetailsLoading(true);
      const response = await getCounselorById(counselorId);

      if (response.success && response.data) {
        setSelectedCounselor(response.data.counselor);
        saveToCache(
          buildCounselorDetailCacheKey(counselorId),
          response.data.counselor
        );
        setShowDetailsModal(true);
      } else if (counselorFromList) {
        setSelectedCounselor(counselorFromList);
        setShowDetailsModal(true);
      } else {
        console.error("Failed to load counselor details:", response.message);
      }
    } catch {
      const cachedCounselor =
        loadFromCache<Counselor>(
          buildCounselorDetailCacheKey(counselorId),
          CACHE_TTL
        ) || counselorFromList;

      if (cachedCounselor) {
        setSelectedCounselor(cachedCounselor);
        setShowDetailsModal(true);
      }
    } finally {
      setDetailsLoading(false);
    }
  };

  const filteredCounselors = counselors.filter((counselor) => {
    const matchesSearch =
      counselor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      counselor.specialization
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      counselor.bio.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSpec =
      selectedSpec === "all" || counselor.specialization === selectedSpec;

    return matchesSearch && matchesSpec;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredCounselors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCounselors = filteredCounselors.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSpec]);

  // Helper function to render profile picture or initials
  const renderProfilePicture = (
    counselor: Counselor,
    size: "sm" | "lg" = "sm"
  ) => {
    const widthHeightClasses = size === "lg" ? "w-20 h-20" : "w-16 h-16";
    const textSizeClasses = size === "lg" ? "text-2xl" : "text-xl";
    const hasImageError = imageErrors.has(counselor._id);
    const profilePicture = counselor.profilePicture;

    const hasValidImage =
      profilePicture &&
      typeof profilePicture === "string" &&
      profilePicture.trim() !== "" &&
      profilePicture !== "null" &&
      profilePicture !== "undefined" &&
      !hasImageError;

    const initialsDiv = (
      <div
        className={`${widthHeightClasses} ${textSizeClasses} bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold shadow-md`}
      >
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
            className={`${widthHeightClasses} rounded-full object-cover shadow-md`}
            onError={() => {
              setImageErrors((prev) => new Set(prev).add(counselor._id));
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
            {t("therapy.subtitle")}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
            {t("therapy.title")}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            {t("therapy.description")}
          </p>
        </div>

        {dataError && (
          <div className="mb-8 text-center text-sm text-red-700 bg-red-100 px-4 py-2 rounded-lg">
            {dataError}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <>
            {/* Filters & Search */}
            <div className="bg-white/80 backdrop-blur-sm w-full max-w-4xl mx-auto rounded-2xl shadow-lg p-4 sm:p-6 mb-8 animate-fade-in-up animation-delay-200">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  <input
                    type="text"
                    placeholder={t("therapy.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Specialization Filter */}
                <select
                  value={selectedSpec}
                  onChange={(e) => setSelectedSpec(e.target.value)}
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:min-w-[200px]"
                >
                  <option value="all">{t("therapy.allSpecializations")}</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Counselors Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedCounselors.map((counselor, index) => (
                <div
                  key={counselor._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up cursor-pointer flex flex-col h-full"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleCounselorClick(counselor._id)}
                >
                  {/* Profile Image - Centered */}
                  <div className="flex justify-center mb-4">
                    {renderProfilePicture(counselor, "lg")}
                  </div>

                  {/* Name - Centered */}
                  <div className="flex flex-col items-center mb-3">
                    <h3 className="font-semibold text-gray-800 text-center mb-1">
                      {counselor.firstName} {counselor.lastName}
                    </h3>
                    {counselor.isAvailable && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {t("therapy.available")}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span>{counselor.specialization}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>
                        {counselor.experience} {t("therapy.yearsExperience")}
                      </span>
                    </div>
                  </div>

                  {/* Bio Preview */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3 flex-grow leading-relaxed">
                    {counselor.bio}
                  </p>

                  {/* Verification Badge */}
                  {counselor.isVerified && (
                    <div className="flex items-center gap-2 text-xs text-green-600 mb-4">
                      <Shield className="w-4 h-4" />
                      <span className="font-medium">
                        {t("therapy.verified")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-center pt-4 border-t border-gray-200 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCounselorClick(counselor._id);
                      }}
                      className="px-3 py-1.5 text-xs bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white rounded-lg hover:from-[#7b1fa2] hover:to-[#8e24aa] transition-all font-medium"
                    >
                      {t("therapy.clickToView")}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredCounselors.length === 0 && !loading && !dataError && (
              <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {t("therapy.noResults")}
                </h3>
                <p className="text-gray-500">{t("therapy.noResultsMessage")}</p>
              </div>
            )}

            {/* Pagination */}
            {filteredCounselors.length > itemsPerPage && !loading && !dataError && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 mt-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredCounselors.length)} of {filteredCounselors.length} {filteredCounselors.length === 1 ? 'counselor' : 'counselors'}
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

            {/* Counselor Details Modal */}
            {showDetailsModal && selectedCounselor && (
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center pt-16 z-[60] p-4 overflow-hidden"
                onClick={() => setShowDetailsModal(false)}
              >
                <div
                  className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {detailsLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                    </div>
                  ) : (
                    <>
                      {/* Modal Header */}
                      <div className="flex-shrink-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {selectedCounselor &&
                              renderProfilePicture(selectedCounselor, "lg")}
                            <div>
                              <h2 className="text-2xl font-bold text-gray-800">
                                {selectedCounselor.firstName}{" "}
                                {selectedCounselor.lastName}
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

                      {/* Modal Content - Scrollable */}
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Stats */}
                        <div className="flex items-center gap-6 p-4 bg-purple-50 rounded-lg">
                          <div className="text-sm text-gray-600">
                            {selectedCounselor.totalSessions}{" "}
                            {t("therapy.sessionsCompleted")}
                          </div>
                          {selectedCounselor.isAvailable && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              {t("therapy.modal.availableForSessions")}
                            </span>
                          )}
                        </div>

                        {/* About */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-600" />
                            {t("therapy.modal.about")}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {selectedCounselor.bio}
                          </p>
                        </div>

                        {/* Experience */}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            {t("therapy.modal.experience")}
                          </h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-500">
                                {t("therapy.modal.yearsOfExperience")}
                              </div>
                              <div className="text-xl font-bold text-purple-600">
                                {selectedCounselor.experience}
                              </div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <div className="text-sm text-gray-500">
                                {t("therapy.modal.sessionsCompleted")}
                              </div>
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
                            {t("therapy.modal.specialization")}
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
                              {t("therapy.modal.verification")}
                            </h3>
                            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
                              <Shield className="w-5 h-5 text-green-600" />
                              <span className="text-green-700 font-medium">
                                {t("therapy.verifiedLicensed")}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Contact & Action */}
                        <div className="pt-6 border-t border-gray-200">
                          <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                              to="/login"
                              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-center"
                            >
                              {t("therapy.bookSession")}
                            </Link>
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
