import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
      setIsScrolled(window.scrollY > 30);
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
      className={`fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md transition-shadow duration-300 ${
        isScrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Logo />
          {!isMobile && <NavLinks />}
        </div>

        <div className="flex items-center space-x-4">
          {!isMobile && <SearchBar />}

          {isMobile && !isSearchExpanded && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearch}
              aria-label="Open search"
              className="text-white"
            >
              <Menu className="w-6 h-6" />
            </Button>
          )}

          {isMobile && isSearchExpanded && (
            <div className="fixed inset-0 bg-black/90 z-50 flex items-center px-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSearch}
                aria-label="Close search"
                className="text-white mr-4"
              >
                ✕
              </Button>
              <SearchBar
                isMobile
                expanded
                onToggleExpand={toggleSearch}
                className="flex-grow"
              />
            </div>
          )}

          {user ? <UserMenu /> : <AuthButtons />}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open menu"
            className="md:hidden text-white"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
};

export default Navbar;
