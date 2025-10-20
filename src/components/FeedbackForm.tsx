import React, { useState } from "react";
import { Star } from "lucide-react";
import { getCurrentUser } from "@/apis/auth";
import { createFeedback } from "@/apis/feedback";

interface FeedbackFormData {
  fullName: string;
  email: string;
  message: string;
  rating: number;
}

interface FeedbackFormProps {
  className?: string;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ className = "" }) => {
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>({
    fullName: "",
    email: "",
    message: "",
    rating: 5,
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Check if user is authenticated
  const user = getCurrentUser();
  const isAuthenticated = !!user;
  const userRole = localStorage.getItem("userRole");
  const isGuest = userRole === "guest";

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const payload = isAuthenticated && !isGuest
        ? {
            fullName: feedbackForm.fullName,
            email: feedbackForm.email,
            message: feedbackForm.message,
            rating: feedbackForm.rating,
          }
        : {
            fullName: feedbackForm.fullName || "Anonymous User",
            message: feedbackForm.message,
            rating: feedbackForm.rating,
            ...(feedbackForm.email && { email: feedbackForm.email }),
          };

      // Call the API
      const response = await createFeedback(payload);

      if (response.success) {
        setFeedbackSubmitted(true);
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setFeedbackSubmitted(false);
          setFeedbackForm({
            fullName: "",
            email: "",
            message: "",
            rating: 5,
          });
        }, 3000);
      } else {
        setErrorMessage(response.message || "Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setErrorMessage("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = (rating: number) => {
    setFeedbackForm((prev) => ({ ...prev, rating }));
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 ${className}`}
    >
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-purple-600" />
        Share Your Testimonial
      </h3>

      {feedbackSubmitted ? (
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <div className="bg-green-500 rounded-full p-3">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-800 mb-2">
            Thank you for your testimonial! It really means a lot to us.
          </p>
          <p className="text-gray-600">
            We appreciate you taking the time to share your experience.
          </p>
        </div>
      ) : (
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {errorMessage}
            </div>
          )}

          {/* Name field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name {isAuthenticated && !isGuest ? "*" : ""}
            </label>
            <input
              type="text"
              required={isAuthenticated && !isGuest}
              value={feedbackForm.fullName}
              onChange={(e) =>
                setFeedbackForm({
                  ...feedbackForm,
                  fullName: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={
                isGuest ? "Enter your name (optional)" : "Enter your name"
              }
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>

          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email {isAuthenticated && !isGuest ? "*" : ""}
            </label>
            <input
              type="email"
              required={isAuthenticated && !isGuest}
              value={feedbackForm.email}
              onChange={(e) =>
                setFeedbackForm({
                  ...feedbackForm,
                  email: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder={
                isGuest ? "Enter your email (optional)" : "Enter your email"
              }
              maxLength={100}
              disabled={isSubmitting}
            />
          </div>

          {/* Rating field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => handleRatingChange(rating)}
                  disabled={isSubmitting}
                  className={`p-2 rounded-lg transition-colors ${
                    feedbackForm.rating >= rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}`}
                >
                  <Star className="w-6 h-6 fill-current" />
                </button>
              ))}
            </div>
          </div>

          {/* Message field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback *
            </label>
            <textarea
              required
              rows={4}
              value={feedbackForm.message}
              onChange={(e) =>
                setFeedbackForm({
                  ...feedbackForm,
                  message: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder={
                isGuest
                  ? "Share your feedback anonymously..."
                  : "Share your experience with us..."
              }
              maxLength={1000}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {feedbackForm.message.length}/1000 characters
            </p>
          </div>

          {/* Guest info notice */}
          {isGuest && (
            <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
              <strong>Note:</strong> You're browsing as a guest. Name and email
              fields are optional. Rating and feedback are always welcome!
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full px-6 py-3 font-semibold rounded-lg shadow-sm transition-all duration-200 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 hover:shadow-md"
            } text-white`}
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      )}
    </div>
  );
};

export default FeedbackForm;