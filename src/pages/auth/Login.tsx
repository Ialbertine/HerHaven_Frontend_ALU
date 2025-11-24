import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, X, Loader2 } from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import { login } from "@/apis/auth";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
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

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (message) {
      setMessage(null);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await login(formData.email, formData.password);

        if (response.success) {
          const userData = response.data?.user;
          const userRole = (userData?.role || "user").toLowerCase();

          localStorage.setItem("userRole", userRole);
          localStorage.setItem("accessType", "authenticated");
          localStorage.removeItem("guestSessionId");
          if (userData) {
            localStorage.setItem("user", JSON.stringify(userData));
          }

          setMessage({
            type: "success",
            text: "Login successful. Redirecting...",
          });

          // Navigate based on role
          if (userRole === "super_admin") {
            navigate("/admin/dashboard");
          } else if (userRole === "counselor") {
            navigate("/counselor/dashboard");
          } else if (userRole === "user") {
            navigate("/user/dashboard");
          } else {
            navigate("/user/dashboard");
          }
        } else {
          setMessage({
            type: "error",
            text:
              response.message ||
              "Login failed. Please check your credentials.",
          });
        }
      } catch {
        setMessage({
          type: "error",
          text: "An unexpected error occurred. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <section className="relative min-h-screen flex items-center bg-lavender-50 overflow-hidden pb-2">
      {/* Animated Background */}
      <AnimatedBackground variant="default" />

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
              Welcome Back
            </h1>
            <p className="text-gray-600">Sign in to continue to HerHaven</p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 mb-6 animate-fade-in-up animation-delay-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              SIGN IN
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

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email
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
                    placeholder="Email"
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
                    placeholder="Password"
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
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <X size={12} /> {errors.password}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-gray-300 text-[#9c27b0] focus:ring-[#9c27b0]"
                  />
                  <span className="text-sm text-gray-700">Remember Me</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-[#9c27b0] hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#9027b0] to-[#9c27b0] text-white py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </button>
            </form>
          </div>

          <div className="text-center animate-fade-in-up animation-delay-400">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-[#9c27b0] hover:underline font-semibold"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
