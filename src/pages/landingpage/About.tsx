import React from "react";
import {
  Handshake,
  Globe,
  Sparkles,
  Shield,
  Sprout,
  Lightbulb,
  Ear,
  Link2,
  ArrowRight,
  Smartphone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const About: React.FC = () => {
  const { t } = useTranslation("landing");

  const coreValues = [
    {
      icon: Handshake,
      title: t("about.values.empathy.title"),
      description: t("about.values.empathy.description"),
    },
    {
      icon: Shield,
      title: t("about.values.safety.title"),
      description: t("about.values.safety.description"),
    },
    {
      icon: Sprout,
      title: t("about.values.healing.title"),
      description: t("about.values.healing.description"),
    },
    {
      icon: Lightbulb,
      title: t("about.values.collaboration.title"),
      description: t("about.values.collaboration.description"),
    },
  ];

  const workflowSteps = [
    {
      icon: Ear,
      title: t("about.howWeWork.listen.title"),
      description: t("about.howWeWork.listen.description"),
    },
    {
      icon: Shield,
      title: t("about.howWeWork.build.title"),
      description: t("about.howWeWork.build.description"),
    },
    {
      icon: Link2,
      title: t("about.howWeWork.empower.title"),
      description: t("about.howWeWork.empower.description"),
    },
  ];

  const partners = [
    "IOSC",
    "Ministry of Health",
    "UNFPA Rwanda",
    "UN Women Rwanda",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-lavender-50 to-white">
      {/* Section 1: About herhaven */}
      <section className="pt-36 pb-6 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-2 animate-[fade-in-up_1s_ease-out_forwards]">
          <h1 className="text-2xl md:text-4xl font-bold text-purple-900 mb-6">
            {t("about.title")}
          </h1>
          <p className="text-lg md:text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {t("about.description")}
          </p>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-r from-purple-50 to-lavender-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Vision Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <Globe className="w-6 h-6 text-purple-600 mr-4" />
                <h2 className="text-2xl font-semibold text-purple-900">
                  {t("about.vision.title")}
                </h2>
              </div>
              <p className="text-gray-600 text-base leading">
                {t("about.vision.description")}
              </p>
            </div>

            {/* Mission Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 mr-4" />
                <h2 className="text-2xl font-semibold text-purple-900">
                  {t("about.mission.title")}
                </h2>
              </div>
              <p className="text-gray-600 text-base leading">
                {t("about.mission.description")}
              </p>
            </div>

            {/* why her haven */}
            <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1">
              <div className="flex items-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 mr-4" />
                <h2 className="text-2xl font-semibold text-purple-900">
                  {t("about.whyHerHaven.title")}
                </h2>
              </div>
              <p className="text-gray-600 text-base leading">
                {t("about.whyHerHaven.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Core Values */}
      <section className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-purple-900 text-center mb-12">
          {t("about.values.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-lavender-100 to-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex justify-center mb-4">
                  <IconComponent className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-purple-900 mb-3 text-center">
                  {value.title}
                </h3>
                <p className="text-gray-700 text-center leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Partners */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-b from-white to-lavender-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-purple-900 text-center mb-12">
            {t("about.partners.title")}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 flex items-center justify-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <p className="text-lg font-semibold text-purple-900 text-center">
                  {partner}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-purple-900 text-center mb-12">
          {t("about.howWeWork.title")}
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {workflowSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div
                key={index}
                className="relative bg-gradient-to-br from-lavender-100 via-white to-lavender-50 rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <IconComponent className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-purple-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {step.description}
                </p>
                {index < workflowSteps.length - 1 && (
                  <div className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2">
                    <ArrowRight className="w-8 h-8 text-purple-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Why It Matters */}
      <section className="py-16 px-4 md:px-8 lg:px-16 bg-gradient-to-r from-purple-900 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("about.whyMatters.title")}
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl font-bold mb-2">
                {t("about.whyMatters.stat1")}
              </div>
              <p className="text-lg">
                {t("about.whyMatters.stat1Description")}
              </p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="text-3xl font-bold mb-2">
                {t("about.whyMatters.stat2")}
              </div>
              <p className="text-lg">
                {t("about.whyMatters.stat2Description")}
              </p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-lg rounded-xl p-8 hover:bg-white/20 transition-all duration-300">
              <div className="flex justify-center mb-2">
                <Smartphone className="w-14 h-14" />
              </div>
              <p className="text-lg">
                {t("about.whyMatters.stat3Description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-purple-900 mb-6">
            {t("about.joinUs.title")}
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-10 leading-relaxed">
            {t("about.joinUs.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <button className="px-8 py-4 bg-lavender-500 hover:bg-lavender-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {t("about.joinUs.partner")}
              </button>
            </Link>
            <Link to="/counselorform">
              <button className="px-8 py-4 bg-purple-100 hover:bg-purple-200 text-purple-900 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                {t("about.joinUs.joinCounselor")}
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
