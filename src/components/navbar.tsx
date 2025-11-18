import React, { useState, useEffect, useRef } from "react";
import { Menu, X, Globe, ALargeSmall, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTextSize } from "@/hooks/useTextSize";

interface DropdownItem {
  href: string;
  label: string;
}

interface NavLink {
  href: string;
  label: string;
  isActive?: boolean;
  hasDropdown?: boolean;
  dropdownItems?: DropdownItem[];
}

const navLinks: NavLink[] = [
  { href: "/", label: "nav.home" },
  { href: "/aboutus", label: "nav.about" },
  {
    href: "/services",
    label: "nav.services",
    hasDropdown: true,
    dropdownItems: [
      { href: "/services", label: "nav.allServices" },
      { href: "/therapy", label: "nav.therapyServices" },
      { href: "/assessments", label: "nav.selfAssessment" },
      { href: "/havenchatbot", label: "nav.havenchatbot" },
    ],
  },
  { href: "/resources", label: "nav.resources" },
  { href: "/contact", label: "nav.contact" },
];

export const Logo: React.FC = () => (
  <div className="flex items-center gap-1">
    <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10">
      <img src="/herhaven.svg" alt="HerHaven Logo" />
    </div>
    <span className="text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-black">
      HerHaven
    </span>
  </div>
);

const ResizeText: React.FC = () => {
  const { textSize, setTextSize } = useTextSize();
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const textSizes = [
    { value: "small" as const, label: "Small", multiplier: "87.5%" },
    { value: "medium" as const, label: "Medium", multiplier: "100%" },
    { value: "large" as const, label: "Large", multiplier: "112.5%" },
    { value: "extra-large" as const, label: "Extra Large", multiplier: "125%" },
  ];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowSizeMenu(false);
      }
    };

    if (showSizeMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSizeMenu]);

  const handleSizeChange = (size: typeof textSize) => {
    setTextSize(size);
    setShowSizeMenu(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-label="Change text size"
        aria-expanded={showSizeMenu}
        aria-haspopup="true"
        className="hover:scale-110 transition-transform flex items-center justify-center p-2"
        onClick={() => setShowSizeMenu(!showSizeMenu)}
        title="Text Size Options"
      >
        <ALargeSmall className="w-5 h-5 md:w-6 md:h-6 text-black" />
      </button>
      {showSizeMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowSizeMenu(false)}
            aria-hidden="true"
          />
          <div
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            role="menu"
            aria-label="Text size options"
          >
            {textSizes.map((size) => (
              <button
                key={size.value}
                onClick={() => handleSizeChange(size.value)}
                className={`flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-purple-50 transition-colors ${textSize === size.value
                  ? "bg-purple-100 text-purple-700 font-semibold"
                  : "text-gray-700"
                  }`}
                role="menuitem"
                aria-checked={textSize === size.value}
              >
                <span className="text-sm">{size.label}</span>
                <span className="text-xs text-gray-500">{size.multiplier}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const LanguageToggle: React.FC = () => {
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
    <div className="relative">
      <button
        aria-label="Toggle languages"
        className="hover:scale-110 transition-transform flex items-center justify-center p-2"
        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
      >
        <Globe className="w-5 h-5 md:w-6 md:h-6 text-black" />
      </button>
      {showLanguageMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => toggleLanguage(lang.code)}
              className={`flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-purple-50 transition-colors ${i18n.language === lang.code
                ? "bg-purple-100 text-purple-700 font-semibold"
                : "text-gray-700"
                }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Function to determine if a navigation item should be active
const isNavItemActive = (navItem: NavLink, currentPath: string): boolean => {
  // For dropdown items, check if any dropdown item is active
  if (navItem.hasDropdown && navItem.dropdownItems) {
    return navItem.dropdownItems.some((item) => {
      if (item.href === "/") {
        return currentPath === "/";
      }
      return currentPath.startsWith(item.href);
    });
  }

  // For regular items
  if (navItem.href === "/") {
    return currentPath === "/";
  }

  return currentPath.startsWith(navItem.href);
};

const SignUpButton: React.FC<{ fullWidth?: boolean }> = ({
  fullWidth = false,
}) => {
  const { t } = useTranslation("landing");

  return (
    <Link to="/signup">
      <button
        className={`bg-[#7b1fa2] hover:bg-[#9c27b0] text-white 
          px-4 py-2 sm:px-4 sm:py-2 md:px-4 md:py-2 
          text-sm sm:text-base md:text-base
          rounded-full font-medium transition-all duration-200 
          hover:shadow-lg hover:scale-105
          ${fullWidth ? "w-full" : ""}`}
      >
        {t("nav.signup")}
      </button>
    </Link>
  );
};

interface DropdownMenuProps {
  items: DropdownItem[];
  isOpen: boolean;
  onClose: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items, isOpen, onClose }) => {
  const { t } = useTranslation("landing");

  if (!isOpen) return null;

  return (
    <>
      {/* Invisible overlay to close dropdown when clicking outside */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
        {items.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className="block px-4 py-3 hover:bg-purple-50 transition-colors"
            onClick={onClose}
          >
            <div className="font-medium text-black">{t(item.label)}</div>
          </Link>
        ))}
      </div>
    </>
  );
};

interface NavItemProps {
  link: NavLink;
  isMobile?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ link, isMobile = false }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { t } = useTranslation("landing");
  const location = useLocation();
  const isActive = isNavItemActive(link, location.pathname);

  const baseClasses = isMobile ? "block py-2" : "";
  const activeClasses = isActive
    ? "text-[#9c27b0]"
    : "text-black hover:text-[#9c27b0]";

  if (link.hasDropdown && link.dropdownItems) {
    if (isMobile) {
      return (
        <li>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`${baseClasses} ${activeClasses} transition-colors w-full text-left flex items-center justify-between`}
          >
            {t(link.label)}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>
          {dropdownOpen && (
            <div className="pl-4 mt-2 space-y-2">
              {link.dropdownItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block py-2 text-gray-700 hover:text-[#9c27b0] transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <div className="font-medium">{t(item.label)}</div>
                </Link>
              ))}
            </div>
          )}
        </li>
      );
    }

    // Desktop dropdown
    return (
      <li className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`${baseClasses} ${activeClasses} transition-colors flex items-center gap-1 cursor-pointer`}
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
          aria-current={isActive ? "page" : undefined}
        >
          {t(link.label)}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
          />
        </button>
        <DropdownMenu
          items={link.dropdownItems}
          isOpen={dropdownOpen}
          onClose={() => setDropdownOpen(false)}
        />
      </li>
    );
  }

  return (
    <li>
      <Link
        to={link.href}
        className={`${baseClasses} ${activeClasses} transition-colors`}
        aria-current={isActive ? "page" : undefined}
      >
        {t(link.label)}
      </Link>
    </li>
  );
};

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 color-lavender-50 backdrop-blur-md xl:px-14">
      <nav className="px-6 py-4" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          <Logo />

          {/* Navigation - Hidden on mobile/sm, visible from md (768px) */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavItem key={link.href} link={link} />
            ))}
          </ul>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <ResizeText />
            <LanguageToggle />
            <SignUpButton />
          </div>

          {/*  Menu */}
          <button
            className="lg:hidden p-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-gray-200 shadow-lg">
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavItem key={link.href} link={link} isMobile />
              ))}
              {/* Show Sign Up button only on smaller screens where actions are hidden */}
              <li className="pt-2 border-t border-gray-300 md:hidden">
                <SignUpButton fullWidth />
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
};
