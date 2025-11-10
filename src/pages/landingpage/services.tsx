import React from "react";
import {
  Heart,
  Users,
  MessageCircle,
  Shield,
  Phone,
  BookOpen,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const Services: React.FC = () => {
  const { t } = useTranslation("landing");
  const features = [
    {
      icon: Heart,
      title: t("services.professionalSupport.title"),
      description: t("services.professionalSupport.description"),
    },
    {
      icon: Users,
      title: t("services.peerCommunity.title"),
      description: t("services.peerCommunity.description"),
    },
    {
      icon: MessageCircle,
      title: t("services.aiChat.title"),
      description: t("services.aiChat.description"),
    },
    {
      icon: Shield,
      title: t("services.safeConfidential.title"),
      description: t("services.safeConfidential.description"),
    },
    {
      icon: Phone,
      title: t("services.crisisSupport.title"),
      description: t("services.crisisSupport.description"),
    },
    {
      icon: BookOpen,
      title: t("services.educational.title"),
      description: t("services.educational.description"),
    },
  ];

  return (
    <section className="relative min-h-screen pt-24 pb-20 px-6 bg-lavender-50 overflow-hidden">

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="text-[#9c27b0] text-lg mb-4 font-medium">
            {t("services.title")}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 leading-tight">
            How HerHaven Helps
          </h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            {t("services.description")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon with Gradient Background */}
                <div
                  className={`w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6 shadow-md`}
                >
                  <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in-up animation-delay-600">
          <p className="text-gray-700 text-lg mb-6">
            {t("services.readyToStart")}
          </p>
          <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            {t("services.getStarted")}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Services;
