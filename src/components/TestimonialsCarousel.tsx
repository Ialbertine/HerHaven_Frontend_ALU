import React, { useState, useEffect, useCallback } from "react";
import { getPublishedTestimonials, type Feedback } from "@/apis/feedback";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { loadFromCache, saveToCache } from "@/utils/offlineCache";
import useOfflineStatus from "@/hooks/useOfflineStatus";

interface TestimonialsCarouselProps {
  className?: string;
}

const TESTIMONIALS_CACHE_KEY = "landing_testimonials_v1";
const TESTIMONIALS_CACHE_TTL = 1000 * 60 * 60 * 12; // 12 hours

const TestimonialsCarousel: React.FC<TestimonialsCarouselProps> = ({
  className = "",
}) => {
  const [testimonials, setTestimonials] = useState<Feedback[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOffline = useOfflineStatus();

  const loadTestimonials = useCallback(
    async ({ showLoader = true }: { showLoader?: boolean } = {}) => {
      if (showLoader) setLoading(true);
      setError(null);

      try {
        const response = await getPublishedTestimonials({ limit: 20 });

        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to load testimonials");
        }

        setTestimonials(response.data.feedback);
        saveToCache(TESTIMONIALS_CACHE_KEY, response.data.feedback);
      } catch (err) {
        console.error("Error loading testimonials:", err);
        const cachedTestimonials = loadFromCache<Feedback[]>(
          TESTIMONIALS_CACHE_KEY,
          TESTIMONIALS_CACHE_TTL
        );

        if (cachedTestimonials && cachedTestimonials.length > 0) {
          setTestimonials(cachedTestimonials);
          setError(null);
        } else {
          setError("Unable to load testimonials at the moment.");
        }
      } finally {
        if (showLoader) setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const cachedTestimonials = loadFromCache<Feedback[]>(
      TESTIMONIALS_CACHE_KEY,
      TESTIMONIALS_CACHE_TTL
    );

    if (cachedTestimonials && cachedTestimonials.length > 0) {
      setTestimonials(cachedTestimonials);
      setLoading(false);
    } else if (isOffline) {
      setLoading(false);
    }

    if (!isOffline) {
      const showLoader = !(cachedTestimonials && cachedTestimonials.length > 0);
      void loadTestimonials({ showLoader });
    }
  }, [isOffline, loadTestimonials]);

  // Calculate how many slides we have
  const slidesCount = Math.ceil(testimonials.length / 3);

  const nextTestimonial = () => {
    if (slidesCount <= 1) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slidesCount);
  };

  const prevTestimonial = () => {
    if (slidesCount <= 1) return;
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slidesCount - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // this will show 3 testimonials per slide
  const getCurrentTestimonials = () => {
    const startIndex = currentIndex * 3;
    return testimonials.slice(startIndex, startIndex + 3);
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex gap-0.5 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const renderTestimonial = (testimonial: Feedback) => (
    <div className="text-center">
      {/* Quote Icon */}
      <div className="flex justify-center mb-3">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
          <Quote className="w-4 h-4 text-purple-600" />
        </div>
      </div>

      {/* rating */}
      <div className="mb-4">{renderStars(testimonial.rating)}</div>

      {/* Testimonial Text */}
      <blockquote className="text-base text-gray-700 leading-relaxed mb-4 font-light italic">
        "{testimonial.message}"
      </blockquote>

      {/* author */}
      <div className="border-t border-gray-100 pt-4">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-bold mb-2">
            {testimonial.isAnonymous === true
              ? "A"
              : testimonial.fullName.charAt(0).toUpperCase()}
          </div>
          <h4 className="text-sm font-semibold text-gray-900">
            {testimonial.isAnonymous === true
              ? "Anonymous"
              : testimonial.fullName}
          </h4>
          {testimonial.isAnonymous !== true && testimonial.email && (
            <p className="text-xs text-gray-600">Verified User</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {formatDate(testimonial.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={`py-12 px-4 ${className}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-56 mx-auto mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-80 mx-auto"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[1, 2].map((index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="animate-pulse space-y-3">
                  <div className="flex justify-center mb-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                  <div className="flex justify-center mt-4">
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || testimonials.length === 0) {
    return (
      <div className={`py-12 px-4 ${className}`}>
        <div className="max-w-6xl mx-auto text-center">
          <div className="text-gray-500">
            {error ? (
              <p>Unable to load testimonials at the moment.</p>
            ) : (
              <p>No testimonials available yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentTestimonials = getCurrentTestimonials();

  return (
    <div
      className={`py-12 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-white ${className}`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <p className="text-purple-600 text-base mb-3 font-medium">
            What People Say
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Stories of Hope & Healing
          </h2>
          <p className="text-gray-600 text-base max-w-xl mx-auto">
            Real stories from women who found strength and support through
            HerHaven
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTestimonials.map((testimonial, index) => (
              <div
                key={testimonial._id || index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {renderTestimonial(testimonial)}
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {slidesCount > 1 && (
            <>
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-purple-600 hover:shadow-xl transition-all duration-300"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-purple-600 hover:shadow-xl transition-all duration-300"
                aria-label="Next testimonials"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Dot Indicators */}
          {slidesCount > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: slidesCount }, (_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-purple-600 scale-125"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Testimonial Counter */}
        {slidesCount > 1 && (
          <div className="text-center mt-6 text-sm text-gray-500">
            {currentIndex + 1} of {slidesCount} pages ({testimonials.length}{" "}
            testimonials)
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialsCarousel;
