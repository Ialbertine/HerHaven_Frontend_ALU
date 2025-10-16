import { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { 
  registerCounselor, 
  completeCounselorRegistration,
  type CounselorRegistrationData,
  type CompleteCounselorRegistrationData 
} from "../../apis/auth";
import { COUNSELING_TYPES } from "../../hooks/type";

interface CounselorApplicationFormProps {
  mode?: "new" | "complete";
  inviteToken?: string;
}

const CounselorApplicationForm = ({ 
  mode = "new",
  inviteToken 
}: CounselorApplicationFormProps) => {
  const isCompleteMode = mode === "complete";

  // Form data state
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    phoneNumber: string;
    username: string;
    email: string;
    password: string;
    licenseNumber: string;
    specialization: string;
    experience: string | number;
    bio: string;
  }>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    username: "",
    email: "",
    password: "",
    licenseNumber: "",
    specialization: "",
    experience: "",
    bio: "",
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Extract token from URL if in complete mode
  useEffect(() => {
    if (isCompleteMode && !inviteToken) {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      
      if (!token) {
        setSubmitStatus({
          type: "error",
          message: "Invalid invitation link. Please contact the administrator."
        });
      }
    }
  }, [isCompleteMode, inviteToken]);

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "experience" ? (value === "" ? "" : parseInt(value) || 0) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Common validations
      if (!formData.username.trim()) {
        throw new Error("Username is required");
      }
      if (!formData.password.trim()) {
        throw new Error("Password is required");
      }
      if (formData.password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }
      if (!formData.phoneNumber.trim()) {
        throw new Error("Phone number is required");
      }
      if (!formData.licenseNumber.trim()) {
        throw new Error("License number is required");
      }
      if (!formData.specialization) {
        throw new Error("Specialization is required");
      }
      if (formData.experience === "" || formData.experience === 0) {
        throw new Error("Experience is required");
      }
      if (typeof formData.experience === "string" || formData.experience < 0) {
        throw new Error("Experience must be a positive number");
      }
      if (!formData.bio.trim() || formData.bio.length < 10) {
        throw new Error("Bio must be at least 10 characters long");
      }

      // Additional validations for new application mode
      if (!isCompleteMode) {
        if (!formData.firstName.trim()) {
          throw new Error("First name is required");
        }
        if (!formData.lastName.trim()) {
          throw new Error("Last name is required");
        }
        if (!formData.email.trim()) {
          throw new Error("Email is required");
        }
      }

      let response;

      if (isCompleteMode) {
        // Complete registration mode (invited counselor)
        const token = inviteToken || new URLSearchParams(window.location.search).get("token");
        
        if (!token) {
          throw new Error("Invalid invitation token");
        }

        const completeData: CompleteCounselorRegistrationData = {
          username: formData.username,
          password: formData.password,
          phoneNumber: formData.phoneNumber,
          licenseNumber: formData.licenseNumber,
          specialization: formData.specialization,
          experience: Number(formData.experience),
          bio: formData.bio,
        };

        response = await completeCounselorRegistration(token, completeData);
      } else {
        // New application mode
        const apiData: CounselorRegistrationData = {
          ...formData,
          experience: Number(formData.experience),
        };
        response = await registerCounselor(apiData);
      }

      if (response.success) {
        setSubmitStatus({
          type: "success",
          message: response.message || 
            (isCompleteMode 
              ? "Registration completed successfully! You can now log in with your credentials."
              : "Application submitted successfully! Please check your email for confirmation."
            ),
        });

        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          phoneNumber: "",
          username: "",
          email: "",
          password: "",
          licenseNumber: "",
          specialization: "",
          experience: "",
          bio: "",
        });

        // Redirect after success in complete mode
        if (isCompleteMode) {
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        }
      } else {
        setSubmitStatus({
          type: "error",
          message: response.message || 
            (isCompleteMode 
              ? "Failed to complete registration. Please try again."
              : "Failed to submit application. Please try again."
            ),
        });
      }
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 py-32 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            {isCompleteMode ? "Complete Your Registration" : "Counselor Application"}
          </h1>
          <p className="text-gray-600 text-lg">
            {isCompleteMode 
              ? "Finish setting up your counselor account"
              : "Join our team of professional counselors"
            }
          </p>
        </div>

        {/* Status Message */}
        {submitStatus.type && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${submitStatus.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
              }`}
          >
            {submitStatus.type === "success" ? (
              <CheckCircle
                className="text-green-600 flex-shrink-0 mt-0.5"
                size={20}
              />
            ) : (
              <AlertCircle
                className="text-red-600 flex-shrink-0 mt-0.5"
                size={20}
              />
            )}
            <p
              className={`${submitStatus.type === "success"
                ? "text-green-800"
                : "text-red-800"
                }`}
            >
              {submitStatus.message}
            </p>
          </div>
        )}

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section - Only for new applications */}
            {!isCompleteMode && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200">
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                      placeholder="Enter first name"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-gray-700 font-medium mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    placeholder="07XX XXX XXX"
                  />
                </div>
              </div>
            )}

            {/* Account Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200">
                Account Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    minLength={3}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    placeholder="Choose a username"
                  />
                </div>

                {!isCompleteMode && (
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                      placeholder="your.email@example.com"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none pr-12"
                      placeholder="Create a secure password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum 6 characters
                  </p>
                </div>

                {isCompleteMode && (
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                      placeholder="07XX XXX XXX"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Professional Information Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-purple-200">
                Professional Information
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                    placeholder="LIC-XXXX-XXX"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Specialization <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                  >
                    <option value="" disabled>
                      Select a specialization
                    </option>
                    {COUNSELING_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Years of Experience <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    Professional Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    required
                    minLength={10}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none resize-none"
                    placeholder="Tell us about your experience, approach, and areas of expertise..."
                  ></textarea>
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.bio.length} characters
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
              >
                {isSubmitting 
                  ? "Submitting..." 
                  : isCompleteMode 
                    ? "Complete Registration" 
                    : "Submit Application"
                }
              </button>
            </div>
          </form>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-600 mt-6 text-sm">
          By submitting this {isCompleteMode ? "registration" : "application"}, you agree to our terms and conditions
        </p>
      </div>
    </div>
  );
};

export default CounselorApplicationForm;