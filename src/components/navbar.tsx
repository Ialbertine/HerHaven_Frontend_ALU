import React, { useState } from 'react';
import { Menu, X, Globe, ALargeSmall } from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  isActive?: boolean;
}

const navLinks: NavLink[] = [
  { href: '#home', label: 'Home', isActive: true },
  { href: '#about', label: 'About us' },
  { href: '#services', label: 'Services' },
  { href: '#pages', label: 'Pages' },
  { href: '#contact', label: 'Contact Us' },
];

export const Logo: React.FC = () => (
  <div className="flex items-center gap-2">
    <div className="w-10 h-10">
      <img src="/herhaven.svg" alt="HerHaven Logo" />
    </div>
    <span className="text-2xl font-bold text-black">HerHaven</span>
  </div>
);

const ResizeText: React.FC = () => (
  <button aria-label="Resize text">
    <ALargeSmall className='w-6 h-6 text-black'/>
  </button>
);

const LanguageToggle: React.FC = () => (
  <button aria-label="Toggle languages">
    <Globe className='w-6 h-6 text-black'/>
  </button>
);

const SignUpButton: React.FC<{ fullWidth?: boolean }> = ({ fullWidth = false }) => (
  <button className={`bg-[#9c27b0] text-white px-6 py-3 rounded-full font-medium transition-colors ${fullWidth ? 'w-full' : ''}`}>
    Sign Up
  </button>
);

interface NavItemProps {
  link: NavLink;
  isMobile?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ link, isMobile = false }) => {
  const baseClasses = isMobile ? 'block py-2' : '';
  const activeClasses = link.isActive ? 'text-[#9c27b0]' : 'text-black hover:text-[#9c27b0]';
  
  return (
    <li>
      <a 
        href={link.href} 
        className={`${baseClasses} ${activeClasses} transition-colors`}
        {...(link.isActive && { 'aria-current': 'page' as const })}
      >
        {link.label}
      </a>
    </li>
  );
};

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <nav className="container mx-auto px-6 py-6" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          <Logo />

          {/* Navigation */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavItem key={link.href} link={link} />
            ))}
          </ul>

          <div className="hidden md:flex items-center gap-3">
            <ResizeText />
            <LanguageToggle />
            <SignUpButton />
          </div>

          <button
            className="md:hidden p-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
            <ul className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavItem key={link.href} link={link} isMobile />
              ))}
              <li className="pt-2 border-t border-gray-300">
                <SignUpButton fullWidth />
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
};