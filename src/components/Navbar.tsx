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

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'nav-scrolled' : 'nav-transparent'
      }`}
      style={{
        backgroundColor: 'rgb(9, 9, 11)',
        borderBottom: '1px solid rgb(19 19 21)',
        width: '100vw',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="container mx-auto px-4"
        style={{
          paddingTop: '10px',
          paddingBottom: '10px',
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ marginTop: '-2px' }}
        >
          {/* Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Nav Links (Desktop only) */}
          <div className="hidden md:flex items-center justify-center ml-8">
            <NavLinks />
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Desktop Search */}
            <div className="hidden md:block">
              <SearchBar />
            </div>

            {/* Mobile Search Collapsed */}
            {isMobile && !isSearchExpanded && (
              <SearchBar
                isMobile
                expanded={isSearchExpanded}
                onToggleExpand={toggleSearch}
              />
            )}

            {/* Mobile Search Expanded */}
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
                  expanded
                  onToggleExpand={toggleSearch}
                  className="flex-1"
                  onSearch={toggleSearch}
                />
              </div>
            )}

            {/* User Menu or Auth */}
            {!isSearchExpanded && (
              <>
                {user ? <UserMenu /> : <AuthButtons />}

                {/* Mobile Menu Button */}
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

      {/* Mobile Menu Overlay */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};

export default Navbar;
