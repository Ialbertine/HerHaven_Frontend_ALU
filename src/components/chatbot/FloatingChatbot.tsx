import React, { useState } from "react";
import { MessageCircle } from "lucide-react";
import { ChatbotWindow } from "./ChatbotWindow";

interface FloatingChatbotProps {
  position?: "bottom-right" | "bottom-left";
  className?: string;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
  position = "bottom-right",
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggle = () => {
    if (isMinimized) {
      setIsMinimized(false);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  const handleMinimize = () => {
    setIsOpen(false);
    setIsMinimized(true);
  };

  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
  };

  return (
    <div className={`fixed z-50 ${positionClasses[position]} ${className}`}>
      {/* Chatbot Window */}
      {(isOpen || isMinimized) && (
        <div
          className={`${isMinimized ? "hidden" : "block"} mb-4 
          w-screen h-screen sm:w-96 sm:h-[600px] 
          sm:max-w-full sm:max-h-[80vh]
          fixed sm:relative 
          inset-0 sm:inset-auto
          sm:mb-4`}
        >
          <ChatbotWindow
            isOpen={isOpen}
            onClose={handleClose}
            onMinimize={handleMinimize}
          />
        </div>
      )}

      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={handleToggle}
          className="group relative w-14 h-14 bg-gradient-to-r from-[#9c27b0] to-[#7b1fa2] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-300"
          aria-label="Open Haven AI chatbot"
        >
          <MessageCircle className="w-6 h-6 mx-auto" />

          {/* Pulse animation when not open */}
          {!isMinimized && (
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9c27b0] to-[#7b1fa2] animate-ping opacity-20"></div>
          )}

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Chat with Haven AI
          </div>
        </button>
      )}
    </div>
  );
};
