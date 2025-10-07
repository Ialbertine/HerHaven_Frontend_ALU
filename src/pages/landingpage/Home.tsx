import React from "react";
import { Link } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";
import { Heart, Users, MessageCircle, ArrowRight } from "lucide-react";

const CONFIG = {
  heroContent: {
    tagline: "Find support and healing",
    heading: "Guiding you toward mental wellness",
    description:
      "A trauma-informed, stigma-free space supporting women and survivors of abuse with confidential mental health resources, crisis support, and healing pathways, empowering recovery through safety, compassion, and hope",
  },
  dotIndicators: [
    { delay: "0.1s", color: "bg-purple-400" },
    { delay: "0.2s", color: "bg-pink-400" },
    { delay: "0.3s", color: "bg-purple-400" },
  ],
  servicesPreview: [
    {
      icon: Heart,
      title: "Professional Support",
      description:
        "Connect with licensed counselors specializing in trauma and gender-based violence.",
      gradient: "from-purple-400 to-pink-400",
    },
    {
      icon: Users,
      title: "Peer Community",
      description:
        "Join a supportive community of women who understand your experiences.",
      gradient: "from-pink-400 to-purple-400",
    },
    {
      icon: MessageCircle,
      title: "AI Support Chat",
      description:
        "Get instant, confidential guidance available 24/7 to provide immediate assistance.",
      gradient: "from-purple-500 to-pink-500",
    },
  ],
} as const;

export const Home: React.FC = () => {
  const { tagline, heading, description } = CONFIG.heroContent;

  const renderDotIndicators = () =>
    CONFIG.dotIndicators.map((dot, index) => (
      <div
        key={index}
        className={`w-2 h-2 ${dot.color} rounded-full animate-bounce`}
        style={{ animationDelay: dot.delay }}
      />
    ));

  return (
    <>
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        aria-labelledby="hero-heading"
      >
        {/* Animated Background */}
        <AnimatedBackground variant="default" />

        {/* Content */}
        <div className="mx-auto px-6 relative z-10 w-full">
          <div className="max-w-2xl text-center mx-auto pt-20">
            <p className="text-[#9c27b0] text-lg mb-6 font-medium animate-fade-in-up">
              {tagline}
            </p>

            <h1
              id="hero-heading"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight animate-fade-in-up animation-delay-200"
            >
              {heading}
            </h1>

            <p className="text-gray-600 text-base mb-8 leading-relaxed max-w-xl mx-auto animate-fade-in-up animation-delay-400">
              {description}
            </p>

            <Link to="/login">
              <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-600">
                Begin Your Journey
              </button>
            </Link>

            {/* Dot indicators */}
            <div className="mt-12 flex justify-center space-x-4">
              {renderDotIndicators()}
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="relative py-20 px-6 bg-gradient-to-br from-purple-50 via-pink-50 to-white">
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <p className="text-[#9c27b0] text-lg mb-4 font-medium">
              What We Offer
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 leading-tight">
              Services Designed for You
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive support tailored to your healing journey
            </p>
          </div>

          {/* Services Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {CONFIG.servicesPreview.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Icon */}
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${service.gradient} rounded-full flex items-center justify-center mb-4 shadow-md`}
                  >
                    <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 mb-3">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* View All Services Link */}
          <div className="text-center animate-fade-in-up animation-delay-400">
            <Link to="/services">
              <button className="inline-flex items-center gap-2 text-[#9c27b0] font-semibold text-lg hover:gap-3 transition-all duration-300 group">
                View All Services
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
