import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, User, Mail, Lock, Check, X, Loader2 } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { register, continueAsGuest } from "@/apis/auth";

interface PasswordRequirement {
  label: string;
  regex: RegExp;
}

const CONFIG = {
  passwordRequirements: [
    { label: "At least 6 characters", regex: /.{6,}/ },
    { label: "Include uppercase & lowercase", regex: /(?=.*[a-z])(?=.*[A-Z])/ },
    { label: "Include numbers", regex: /(?=.*\d)/ },
  ] as PasswordRequirement[],
} as const;

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    // Clear inline messages when user edits inputs
    if (message) setMessage(null);
  };

  const calculatePasswordStrength = (
    password: string
  ): { strength: number; label: string; color: string } => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2)
      return { strength: 25, label: "Weak", color: "bg-red-500" };
    if (strength === 3)
      return { strength: 50, label: "Fair", color: "bg-yellow-500" };
    if (strength === 4)
      return { strength: 75, label: "Good", color: "bg-blue-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3 || formData.username.length > 30) {
      newErrors.username = "Username must be 3-30 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Terms validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsRegistering(true);
      setIsLoading(true);

      try {
        const response = await register(
          formData.username,
          formData.email,
          formData.password
        );

        if (response.success) {
          setMessage({
            type: "success",
            text: "You have successfully registered",
          });
          navigate("/login");
        } else {
          setMessage({
            type: "error",
            text: response.message || "Registration failed. Please try again.",
          });
        }
      } catch {
        setMessage({
          type: "error",
          text: "An unexpected error occurred. Please try again.",
        });
      } finally {
        setIsRegistering(false);
        setIsLoading(false);
      }
    }
  };

  const handleGuestAccess = async () => {
    setIsGuestLoading(true);
    setIsLoading(true);
    try {
      const response = await continueAsGuest();

      if (response.success) {
        // Set guest role in localStorage for ProtectedRoute
        localStorage.setItem("userRole", "guest");
        localStorage.setItem("accessType", "guest");

        setMessage({ type: "success", text: "Continuing as guest" });
        // Redirect to user dashboard with limited features
        navigate("/user/dashboard");
      } else {
        setMessage({
          type: "error",
          text: response.message || "Guest access failed. Please try again.",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsGuestLoading(false);
      setIsLoading(false);
    }
  };

  const passwordStrength = calculatePasswordStrength(formData.password);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pb-2">
      {/* Animated Background */}
      <AnimatedBackground variant="default" />

      <Link
        to="/"
        className="absolute top-4 left-4 sm:left-6 inline-flex items-center gap-2 text-[#9c27b0] font-semibold bg-white/90 backdrop-blur px-3 py-2 rounded-full shadow-md hover:text-purple-900 transition-colors cursor-pointer z-50"
        aria-label="Back to HerHaven home"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Back home</span>
      </Link>

      {/* Content */}
      <div className="mx-auto px-6 relative z-10 w-full">
        <div className="max-w-md mx-auto pt-8">
          {/* Logo and Header */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16">
                <img
                  src="/herhaven.svg"
                  alt="HerHaven Logo"
                  className="w-full h-full"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to HerHaven
            </h1>
            <p className="text-gray-600">Your Safe Space for Support</p>
          </div>

          {/* Signup Form Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-6 animate-fade-in-up animation-delay-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              CREATE YOUR ACCOUNT
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Inline success / error message (replaces toasts) */}
              {message && (
                <div
                  className={`p-3 rounded-md text-sm font-medium ${message.type === "success"
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                    }`}
                >
                  {message.text}
                </div>
              )}

              {/* Username Field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <User size={20} />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 rounded-full border ${errors.username ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-[#9c27b0] focus:border-transparent transition-all`}
                    placeholder="Enter your username"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  3-30 characters, letters/numbers/_
                </p>
                {errors.username && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <X size={12} /> {errors.username}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 rounded-full border ${errors.email ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-[#9c27b0] focus:border-transparent transition-all`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <X size={12} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={20} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-3 rounded-full border ${errors.password ? "border-red-500" : "border-gray-300"
                      } focus:outline-none focus:ring-2 focus:ring-[#9c27b0] focus:border-transparent transition-all`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {passwordStrength.label}
                      </span>
                    </div>

                    {/* Password Requirements */}
                    <div className="space-y-1">
                      {CONFIG.passwordRequirements.map((req, index) => {
                        const isMet = req.regex.test(formData.password);
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-xs"
                          >
                            {isMet ? (
                              <Check size={14} className="text-green-500" />
                            ) : (
                              <X size={14} className="text-gray-400" />
                            )}
                            <span
                              className={
                                isMet ? "text-green-600" : "text-gray-500"
                              }
                            >
                              {req.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <X size={12} /> {errors.password}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-[#9c27b0] focus:ring-[#9c27b0]"
                  />
                  <span className="text-sm text-gray-700">
                    I agree to{" "}
                    <Link
                      to="/terms"
                      className="text-[#9c27b0] hover:underline font-medium"
                    >
                      Terms & Conditions
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1 ml-7">
                    <X size={12} /> {errors.agreeToTerms}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isRegistering ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    Creating Account...
                  </span>
                ) : (
                  "Register"
                )}
              </button>
            </form>
          </div>

          {/* OR Divider */}
          <div className="flex items-center gap-4 mb-6 animate-fade-in-up animation-delay-400">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-gray-500 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Guest Access Card */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 text-center animate-fade-in-up animation-delay-600">
            <button
              onClick={handleGuestAccess}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:border-[#9c27b0] hover:text-[#9c27b0] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGuestLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  Loading...
                </>
              ) : (
                <>
                  <User size={20} />
                  Continue as Guest
                </>
              )}
            </button>
            <p className="text-xs text-gray-600 mt-3">
              Access limited features without signup
            </p>
          </div>

          {/* Sign In Link */}
          <div className="text-center animate-fade-in-up animation-delay-600">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#9c27b0] hover:underline font-semibold cursor-pointer"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signup;
