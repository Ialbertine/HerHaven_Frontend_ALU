import React from "react";
import { Link } from "react-router-dom";
import AnimatedBackground from "@/components/AnimatedBackground";

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
  );
};

export default Home;
