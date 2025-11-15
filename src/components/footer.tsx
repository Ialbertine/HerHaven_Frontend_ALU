import React, { useEffect, useState } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import {
  FaLinkedinIn,
  FaPinterestP,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
// import { Logo } from "./navbar";

interface LinkItem {
  label: string;
  path: string;
}

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

const Footer: React.FC = () => {
  const { t } = useTranslation("landing");
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
      size: 2 + Math.random() * 4,
    }));
    setParticles(newParticles);
  }, []);

  const quickLinks: LinkItem[] = [
    { label: t("footer.links.aboutUs"), path: "/aboutus" },
    { label: t("footer.links.ourServices"), path: "/services" },
    { label: t("footer.links.educationHub"), path: "/resources" },
    { label: t("footer.links.havenAI"), path: "/havenchatbot" },
  ];

  const services: string[] = [
    t("footer.links.mentalHealth"),
    t("footer.links.counseling"),
    t("footer.links.peerCommunity"),
    t("footer.links.gbvAwareness"),
  ];

  const renderLinkList = (items: LinkItem[]) => (
    <div className="flex flex-col gap-4 mt-4">
      {items.map((item, index) => (
        <Link
          to={item.path}
          key={index}
          className="flex items-center whitespace-nowrap cursor-pointer"
        >
          <IoMdArrowDropright className="text-xl text-white" />
          <span className="ml-2 hover:text-[#e1bee7] text-[15px] text-white transition-colors duration-300">
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );

  const renderServiceList = (items: string[]) => (
    <div className="flex flex-col gap-4 mt-4">
      {items.map((item, index) => (
        <div className="flex items-center whitespace-nowrap" key={index}>
          <IoMdArrowDropright className="text-xl text-white" />
          <span className="ml-2 text-[15px] text-white">{item}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#9c27b0] via-[#7b2cbf] to-[#4a148c] xl:px-14">
      {/* Animated particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-white opacity-30 pointer-events-none"
          style={{
            left: `${particle.left}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Meditation circles - floating mandalas */}
      <div className="absolute top-1/4 left-10 opacity-20 pointer-events-none">
        <div className="w-16 h-16 rounded-full border-2 border-white animate-pulse" />
      </div>
      <div
        className="absolute top-1/2 right-20 opacity-15 pointer-events-none"
        style={{ animation: "spin-slow 20s linear infinite" }}
      >
        <div className="w-20 h-20 rounded-full border-2 border-white" />
      </div>
      <div className="absolute bottom-1/4 left-1/3 opacity-20 pointer-events-none">
        <div className="w-12 h-12 rounded-full border-2 border-white animate-pulse" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="text-gray-300 px-4 sm:px-5 lg:px-10 pt-6 lg:pt-10">
          <div className="flex flex-col lg:flex-row justify-between gap-8 sm:gap-12 lg:gap-24 pb-6 lg:py-10 w-full">
            {/* Left Side */}
            <div className="w-full lg:w-[30%]">
              <div className="mb-6">
                <div className="flex items-center gap-1">
                  <div className="w-10 h-10">
                    <img src="/herhaven.svg" alt="HerHaven Logo" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    HerHaven
                  </span>
                </div>
                <p className="text-[14px] sm:text-[15px] mt-4 text-white">
                  {t("footer.description")}
                </p>
              </div>
              <form className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 w-full">
                <input
                  type="email"
                  placeholder={t("footer.emailPlaceholder")}
                  className="w-full sm:flex-1 py-3 px-4 sm:px-6 rounded-full bg-white/90 text-gray-700 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#9c27b0] transition-all duration-300"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-full border border-transparent bg-[#9c27b0] text-white font-bold hover:bg-[#7b1fa2] hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out whitespace-nowrap"
                >
                  {t("footer.subscribe")}
                </button>
              </form>
            </div>

            {/* Right Side: Quick Links, Services, and Address */}
            <div className="flex flex-col sm:flex-row lg:flex-row gap-8 sm:gap-10 lg:gap-16 w-full lg:w-[70%]">
              <div className="flex flex-col">
                <h2 className="font-bold text-lg sm:text-xl text-white">
                  {t("footer.quickLinks")}
                </h2>
                {renderLinkList(quickLinks)}
              </div>

              <div className="flex flex-col">
                <h2 className="font-bold text-lg sm:text-xl text-white">
                  {t("footer.ourServices")}
                </h2>
                {renderServiceList(services)}
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-3">
                  <h2 className="font-bold text-lg sm:text-xl text-white">
                    {t("footer.contactUs")}
                  </h2>
                  <div className="text-sm sm:text-[15px] text-white">
                    <p>{t("footer.contactInfo.phone")}</p>
                    <p className="break-words">
                      {t("footer.contactInfo.email")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="px-4 sm:px-5 lg:px-10">
          <hr className="my-4 border-t border-dashed border-white/30" />
        </div>

        {/* Footer Section */}
        <footer className="text-white pb-4 px-4 sm:px-5 lg:px-10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="text-center sm:text-left">
              <p className="text-gray-200 text-sm sm:text-base">
                {new Date().getFullYear()} HerHaven, All rights reserved.
              </p>
            </div>

            {/* Social Media Icons */}
            <div className="flex space-x-3 sm:space-x-4">
              <a
                href="#"
                aria-label="LinkedIn"
                className="flex items-center justify-center w-9 h-9 bg-[#9c27b0] rounded-full hover:bg-[#0597e6] hover:transform hover:-translate-y-2 transition-all duration-300 ease-in-out shadow-lg"
              >
                <FaLinkedinIn className="text-white text-xl" />
              </a>
              <a
                href="#"
                aria-label="Pinterest"
                className="flex items-center justify-center w-9 h-9 bg-[#9c27b0] rounded-full hover:bg-[#E60023] hover:transform hover:-translate-y-2 transition-all duration-300 ease-in-out shadow-lg"
              >
                <FaPinterestP className="text-white text-xl" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="flex items-center justify-center w-9 h-9 bg-[#9c27b0] rounded-full hover:bg-[#1DA1F2] hover:transform hover:-translate-y-2 transition-all duration-300 ease-in-out shadow-lg"
              >
                <FaTwitter className="text-white text-xl" />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="flex items-center justify-center w-9 h-9 bg-[#9c27b0] rounded-full hover:bg-[#de2d2d] hover:transform hover:-translate-y-2 transition-all duration-300 ease-in-out shadow-lg"
              >
                <FaInstagram className="text-white text-xl" />
              </a>
            </div>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-120px) translateX(20px);
            opacity: 0.6;
          }
        }

        @keyframes wave {
          0% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(-25%);
          }
          100% {
            transform: translateX(0);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Footer;
