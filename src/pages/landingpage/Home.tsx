import React from 'react';

interface HeroContent {
  tagline: string;
  heading: string;
  description: string;
}

const heroContent: HeroContent = {
  tagline: 'Find support and healing',
  heading: 'Guiding you toward mental wellness',
  description: 'A trauma-informed, stigma-free space supporting women and survivors of abuse with confidential mental health resources, crisis support, and healing pathways, empowering recovery through safety, compassion, and hope',
};

export const Home: React.FC = () => {
  const { tagline, heading, description } = heroContent;

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden" aria-labelledby="hero-heading">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-lavender-50 to-pink-50" />
        
        <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-purple-200 rounded-full opacity-40 animate-float-slow" />
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-pink-200 rounded-full opacity-50 animate-float-medium" />
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-lavender-300 rounded-full opacity-30 animate-float-slow" />
        <div className="absolute top-1/2 right-1/3 w-14 h-14 bg-purple-100 rounded-full opacity-60 animate-float-fast" />
        
       
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>

      {/* Content */}
      <div className="mx-auto px-6 relative z-10 w-full">
        <div className="max-w-2xl text-center mx-auto pt-20">
          {/* Tagline */}
          <p className="text-[#9c27b0] text-lg mb-6 font-medium animate-fade-in-up">
            {tagline}
          </p>
          
          {/* Main heading */}
          <h1 
            id="hero-heading" 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 leading-tight animate-fade-in-up animation-delay-200"
          >
            {heading}
          </h1>
          
          {/* Description*/}
          <p 
            className="text-gray-600 text-base mb-8 leading-relaxed max-w-xl mx-auto animate-fade-in-up animation-delay-400"
          >
            {description}
          </p>

          <button 
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up animation-delay-600"
          >
            Begin Your Journey
          </button>

          {/* Decorative elements */}
          <div className="mt-12 flex justify-center space-x-4">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
        </div>
      </div>
    </section>
  );
};