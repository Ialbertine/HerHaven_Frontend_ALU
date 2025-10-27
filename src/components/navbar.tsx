import React, { useState } from "react";
import { Menu, X, Globe, ALargeSmall, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

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
  { href: "/", label: "Home" },
  { href: "/aboutus", label: "About us" },
  {
    href: "/services",
    label: "Services",
    hasDropdown: true,
    dropdownItems: [
      { href: "/services", label: "All Services" },
      { href: "/therapy", label: "Therapy Services" },
      { href: "/havenchatbot", label: "Herhaven Chatbot" },
    ],
  },
  { href: "/resources", label: "Resources" },
  { href: "/contact", label: "Contact Us" },
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

const ResizeText: React.FC = () => (
  <button
    aria-label="Resize text"
    className="hover:scale-110 transition-transform"
  >
    <ALargeSmall className="w-5 h-5 md:w-6 md:h-6 text-black" />
  </button>
);

const LanguageToggle: React.FC = () => (
  <button
    aria-label="Toggle languages"
    className="hover:scale-110 transition-transform"
  >
    <Globe className="w-5 h-5 md:w-6 md:h-6 text-black" />
  </button>
);

// Function to determine if a navigation item should be active
const isNavItemActive = (navItem: NavLink, currentPath: string): boolean => {
  // For dropdown items, check if any dropdown item is active
  if (navItem.hasDropdown && navItem.dropdownItems) {
    return navItem.dropdownItems.some(item => {
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
}) => (
  <Link to="/signup">
    <button
      className={`bg-[#9c27b0] hover:bg-[#7b1fa2] text-white 
        px-4 py-2 sm:px-4 sm:py-2 md:px-4 md:py-2 
        text-sm sm:text-base md:text-base
        rounded-full font-medium transition-all duration-200 
        hover:shadow-lg hover:scale-105
        ${fullWidth ? "w-full" : ""}`}
    >
      Sign Up
    </button>
  </Link>
);

interface DropdownMenuProps {
  items: DropdownItem[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ items }) => (
  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
    {items.map((item) => (
      <Link
        key={item.href}
        to={item.href}
        className="block px-4 py-3 hover:bg-purple-50 transition-colors"
      >
        <div className="font-medium text-black">{item.label}</div>
      </Link>
    ))}
  </div>
);

interface NavItemProps {
  link: NavLink;
  isMobile?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ link, isMobile = false }) => {
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
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
            onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)}
            className={`${baseClasses} ${activeClasses} transition-colors w-full text-left flex items-center justify-between`}
          >
            {link.label}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${mobileDropdownOpen ? "rotate-180" : ""
                }`}
            />
          </button>
          {mobileDropdownOpen && (
            <div className="pl-4 mt-2 space-y-2">
              {link.dropdownItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="block py-2 text-gray-700 hover:text-[#9c27b0] transition-colors"
                >
                  <div className="font-medium">{item.label}</div>
                </Link>
              ))}
            </div>
          )}
        </li>
      );
    }

    return (
      <li className="relative group">
        <a
          href={link.href}
          className={`${baseClasses} ${activeClasses} transition-colors flex items-center gap-1`}
          aria-current={isActive ? "page" : undefined}
        >
          {link.label}
          <ChevronDown className="w-4 h-4" />
        </a>
        <DropdownMenu items={link.dropdownItems} />
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
        {link.label}
      </Link>
    </li>
  );
};

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 color-lavender-50 backdrop-blur-md">
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
          <div className="hidden md:flex items-right gap-2 lg:gap-3">
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
