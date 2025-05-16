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
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-black/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-5 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Logo className="h-10 w-auto" />
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex space-x-8 items-center">
          <NavLinks />
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Desktop search */}
          <div className="hidden md:block">
            <SearchBar />
          </div>

          {/* Mobile search icon */}
          {isMobile && !isSearchExpanded && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearch}
              className="text-white hover:bg-white/10"
              aria-label="Open search"
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}

          {/* Mobile expanded search */}
          {isMobile && isSearchExpanded && (
            <div className="absolute inset-x-0 top-0 p-3 bg-black/95 backdrop-blur-xl z-50 flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSearch}
                className="mr-2 text-white hover:bg-white/10"
                aria-label="Close search"
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

          {/* User or auth buttons */}
          {!isSearchExpanded && (
            <>
              {user ? <UserMenu /> : <AuthButtons />}

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

      {/* Mobile menu */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
};

export default Navbar;
