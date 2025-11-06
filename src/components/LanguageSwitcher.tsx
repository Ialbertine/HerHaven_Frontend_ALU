import React, { useState } from "react";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  buttonClassName = "",
  menuClassName = "",
}) => {
  const { i18n } = useTranslation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLanguageMenu(false);
  };

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" },
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        aria-label="Toggle languages"
        className={`hover:scale-110 transition-transform flex items-center gap-1 p-2 rounded-lg hover:bg-gray-100 ${buttonClassName}`}
        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
        title="Change Language"
      >
        <Globe className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
      </button>
      {showLanguageMenu && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowLanguageMenu(false)}
          />
          <div
            className={`absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 ${menuClassName}`}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={`flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-purple-50 transition-colors ${
                  i18n.language === lang.code
                    ? "bg-purple-100 text-purple-700 font-semibold"
                    : "text-gray-700"
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-sm">{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
