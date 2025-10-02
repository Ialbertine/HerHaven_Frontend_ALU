import React from "react";
import { Link } from "react-router-dom";

interface AnimationElement {
  top?: string;
  bottom?: string;
  left: string;
  right?: string;
  width: string;
  height: string;
  bgColor: string;
  opacity: number;
  animation: string;
  delay?: string;
}

// Reusable configuration
const CONFIG = {
  heroContent: {
    tagline: "Find support and healing",
    heading: "Guiding you toward mental wellness",
    description: "A trauma-informed, stigma-free space supporting women and survivors of abuse with confidential mental health resources, crisis support, and healing pathways, empowering recovery through safety, compassion, and hope"
  },
  floatingElements: [
    { top: 'top-1/4', left: 'left-1/4', width: 'w-16', height: 'h-16', bgColor: 'bg-purple-200', opacity: 40, animation: 'animate-float-slow' },
    { top: 'top-1/3', right: 'right-1/4', left: '', width: 'w-12', height: 'h-12', bgColor: 'bg-pink-200', opacity: 50, animation: 'animate-float-medium' },
    { bottom: 'bottom-1/4', left: 'left-1/3', width: 'w-20', height: 'h-20', bgColor: 'bg-lavender-300', opacity: 30, animation: 'animate-float-slow' },
    { top: 'top-1/2', right: 'right-1/3', left: '', width: 'w-14', height: 'h-14', bgColor: 'bg-purple-100', opacity: 60, animation: 'animate-float-fast' },
  ],
  bubbles: [
    { bottom: 'bottom-0', left: 'left-[10%]', width: 'w-8', height: 'h-8', bgColor: 'bg-purple-200', opacity: 50, animation: 'animate-bubble-rise', delay: '0s' },
    { bottom: 'bottom-0', left: 'left-[25%]', width: 'w-12', height: 'h-12', bgColor: 'bg-pink-200', opacity: 40, animation: 'animate-bubble-rise', delay: '2s' },
    { bottom: 'bottom-0', left: 'left-[45%]', width: 'w-6', height: 'h-6', bgColor: 'bg-lavender-300', opacity: 60, animation: 'animate-bubble-rise', delay: '4s' },
    { bottom: 'bottom-0', left: 'left-[60%]', width: 'w-10', height: 'h-10', bgColor: 'bg-purple-300', opacity: 45, animation: 'animate-bubble-rise', delay: '1s' },
    { bottom: 'bottom-0', left: 'left-[75%]', width: 'w-14', height: 'h-14', bgColor: 'bg-pink-300', opacity: 35, animation: 'animate-bubble-rise', delay: '3s' },
    { bottom: 'bottom-0', left: 'left-[55%]', width: 'w-8', height: 'h-8', bgColor: 'bg-lavender-400', opacity: 45, animation: 'animate-bubble-rise', delay: '2.5s' },
    { bottom: 'bottom-0', left: 'left-[70%]', width: 'w-6', height: 'h-6', bgColor: 'bg-purple-200', opacity: 55, animation: 'animate-bubble-rise', delay: '4.5s' },
    { bottom: 'bottom-0', left: 'right-[80%]', width: 'w-12', height: 'h-12', bgColor: 'bg-pink-200', opacity: 40, animation: 'animate-bubble-rise', delay: '1.5s' },
  ],
  dotIndicators: [
    { delay: '0.1s', color: 'bg-purple-400' },
    { delay: '0.2s', color: 'bg-pink-400' },
    { delay: '0.3s', color: 'bg-purple-400' },
  ]
} as const;

// Reusable component for animated elements
const AnimatedElement: React.FC<AnimationElement> = ({ 
  top, bottom, left, right, width, height, bgColor, opacity, animation, delay 
}) => (
  <div
    className={`absolute ${top || ''} ${bottom || ''} ${left} ${right || ''} ${width} ${height} ${bgColor} rounded-full opacity-${opacity} ${animation}`}
    style={{ animationDelay: delay }}
  />
);

export const Home: React.FC = () => {
  const { tagline, heading, description } = CONFIG.heroContent;

  const renderAnimatedElements = (elements: AnimationElement[]) => 
    elements.map((element, index) => <AnimatedElement key={index} {...element} />);

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
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-lavender-50 to-pink-50" />
        
        {renderAnimatedElements([...CONFIG.floatingElements])}
        {renderAnimatedElements([...CONFIG.bubbles])}

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

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