import React, { useEffect, useState } from "react";
import { IoMdArrowDropright } from "react-icons/io";
import {
  FaLinkedinIn,
  FaPinterestP,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";
// import { Link } from "react-router-dom";
// import { Logo } from "./navbar";

interface LinkItem {
  label: string;
  path: string;
}

interface InfoSection {
  title: string;
  content: string;
}

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

const Footer: React.FC = () => {
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
    { label: "About Us", path: "/about-us" },
    { label: "Our Services", path: "/our-services" },
    { label: "Education Hub", path: "/education-hub" },
    { label: "haven AI Chatbot", path: "/haven-ai" },
  ];

  const services: LinkItem[] = [
    { label: "Mental health", path: "/mental-health" },
    { label: "counseling", path: "/counseling" },
    { label: "peer community", path: "/peer-community" },
    { label: "GBV awareness", path: "/awareness " },
  ];

  const infoSections: InfoSection[] = [
    {
      title: "Contact Us",
      content: "Phone: +(250) 789 123 456\n Email: herhaven@example.com",
    },
  ];

  const renderLinkList = (items: LinkItem[]) => (
    <div className="flex flex-col gap-4 mt-4">
      {items.map((item, index) => (
        <div className="flex items-center whitespace-nowrap" key={index}>
          <IoMdArrowDropright className="text-xl text-white" />
          <span className="ml-2 hover:text-[#e1bee7] text-[15px] text-white transition-colors duration-300">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#9c27b0] via-[#7b2cbf] to-[#4a148c]">
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

      {/* Animated background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z"
            fill="white"
            style={{ animation: "wave 8s ease-in-out infinite" }}
          />
        </svg>
      </div>

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
        <div className="text-gray-300 sm:px-5 lg:px-10 lg:pt-10 sm:pt-6">
          <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-24 lg:py-10">
            {/* Left Side */}
            <div className="lg:w-1/3">
              <div className="mb-6">
                <div className="flex items-center gap-1">
                  <div className="w-10 h-10">
                    <img src="/herhaven.svg" alt="HerHaven Logo" />
                  </div>
                  <span className="text-2xl font-bold text-white">
                    HerHaven
                  </span>
                </div>
                <p className="text-[14px] mt-4 text-white">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut
                  elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus
                  leo.
                </p>
              </div>
              <form className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="py-3 px-6 rounded-full bg-white/90 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#9c27b0] transition-all duration-300"
                />
                <button
                  type="submit"
                  className="px-6 py-3 rounded-full border border-transparent bg-gradient-to-r from-[#9c27b0] to-[#7b2cbf] text-white font-bold hover:from-[#7b2cbf] hover:to-[#6a1b9a] hover:shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Right Side: Quick Links, Services, and Address */}
            <div className="flex flex-col lg:flex-row gap-16 lg:w-2/3 mt-5">
              <div className="flex flex-col">
                <h2 className="font-bold text-xl text-white">Quick Links</h2>
                {renderLinkList(quickLinks)}
              </div>

              <div className="flex flex-col">
                <h2 className="font-bold text-xl text-white">Our Services</h2>
                {renderLinkList(services)}
              </div>

              <div className="flex flex-col gap-5 lg:ml-auto">
                {infoSections.map((section, index) => (
                  <div className="flex flex-col gap-3" key={index}>
                    <h2 className="font-bold text-xl text-white">
                      {section.title}
                    </h2>
                    <p
                      className={`text-[15px] text-white ${
                        index === 0 ? "lg:w-[85%]" : ""
                      }`}
                    >
                      {section.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="px-[2rem]">
          <hr className="my-4 border-t border-dashed border-white/30" />
        </div>

        {/* Footer Section */}
        <footer className="text-white pb-4 lg:px-[2rem]">
          <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-200">
                Copyright © {new Date().getFullYear()} Her Haven. All Rights
                Reserved.
              </p>
            </div>

            {/* Social Media Icons */}
            <div className="flex space-x-4">
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
