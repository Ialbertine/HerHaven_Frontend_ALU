import React from "react";
import { LogOut } from "lucide-react";

const QuickExitButton: React.FC = () => {
  const handleQuickExit = () => {
    sessionStorage.clear();
    
    // Clear cookies
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });

    // Redirect
    window.location.replace('https://www.google.com');
  };

  return (
    <button
      onClick={handleQuickExit}
      className="fixed bottom-8 right-8 px-6 py-3 bg-gradient-to-br from-[#9c27b0] to-[#7b2cbf] rounded-full shadow-lg hover:shadow-2xl hover:from-purple-600 hover:to-purple-700 transform transition duration-200 ease-out hover:scale-105 flex items-center gap-2 z-50 focus:outline-none active:scale-95"
      aria-label="Quick Exit"
      title="Click to exit immediately"
    >
      <LogOut className="w-5 h-5 text-white" />
      <span className="text-white font-semibold">Quick Exit</span>
    </button>
  );
};

export default QuickExitButton;