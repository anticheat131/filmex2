import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/hooks';
import { useIsMobile } from '@/hooks/use-mobile';
import Logo from './navigation/Logo';
import SearchBar from './navigation/SearchBar';
import NavLinks from './navigation/NavLinks';
import MobileMenu from './navigation/MobileMenu';
import UserMenu from './navigation/UserMenu';
import AuthButtons from './navigation/AuthButtons';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded);
  };

  useEffect(() => {
    const addGoogleTranslate = () => {
      if (document.getElementById('google-translate-script')) return;

      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          'google_translate_element'
        );
      };
    };

    addGoogleTranslate();
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'nav-scrolled' : 'nav-transparent'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center justify-center ml-8">
            <NavLinks />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Desktop search */}
            <div className="hidden md:block">
              <SearchBar />
            </div>

            {/* Mobile search */}
            {isMobile && !isSearchExpanded && (
              <SearchBar 
                isMobile 
                expanded={isSearchExpanded} 
                onToggleExpand={toggleSearch}
              />
            )}

            {isMobile && isSearchExpanded && (
              <div className="absolute inset-x-0 top-0 p-3 bg-black/95 backdrop-blur-xl z-50 flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleSearch}
                  className="mr-2 text-white hover:bg-white/10"
                >
                  <Menu className="h-6 w-6" />
                </Button>
                <SearchBar 
                  isMobile 
                  expanded={true} 
                  onToggleExpand={toggleSearch} 
                  className="flex-1"
                  onSearch={toggleSearch}
                />
              </div>
            )}

            {/* Auth/User menu */}
            {!isSearchExpanded && (
              <>
                {user ? <UserMenu /> : <AuthButtons />}

                {/* Language switcher (desktop only) */}
                <div
                  id="google_translate_element"
                  className="hidden md:block px-2 py-1 bg-black/40 rounded text-white text-sm border border-white/20"
                  style={{ transform: 'scale(0.85)', transformOrigin: 'right' }}
                />

                {/* Mobile menu button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-white hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu drawer with translate */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
      >
        <div className="mt-4 px-4 block md:hidden">
          <div
            id="google_translate_element_mobile"
            className="bg-black/70 px-2 py-1 rounded text-white text-sm border border-white/20"
          />
        </div>
      </MobileMenu>
    </header>
  );
};

export default Navbar;
