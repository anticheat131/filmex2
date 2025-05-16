import React, { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Lock scroll when mobile menu is open
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
      className="fixed top-0 left-0 right-0 z-50 bg-black"
      style={{ height: '60px' }}
    >
      <div className="container mx-auto px-5 flex items-center justify-between h-full">
        {/* Logo left */}
        <div className="flex items-center">
          <Logo className="h-8 w-auto" />
        </div>

        {/* Desktop nav: uppercase, thin, spaced */}
        <nav className="hidden md:flex space-x-10 items-center uppercase font-thin text-white tracking-wide text-sm">
          <NavLinks />
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {/* Desktop search bar is hidden, replaced with search icon */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearch}
              className="text-white hover:text-accent transition"
              aria-label="Toggle search"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Mobile search icon */}
          {isMobile && !isSearchExpanded && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSearch}
              className="text-white hover:text-accent transition"
              aria-label="Open search"
            >
              <Search className="h-6 w-6" />
            </Button>
          )}

          {/* Mobile expanded search overlay */}
          {isMobile && isSearchExpanded && (
            <div className="fixed inset-0 bg-black z-50 flex items-center px-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSearch}
                className="text-white hover:text-accent mr-4"
                aria-label="Close search"
              >
                <X className="h-6 w-6" />
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

          {/* User menu or auth buttons */}
          {!isSearchExpanded && (
            <>
              {user ? <UserMenu /> : <AuthButtons />}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:text-accent transition"
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu overlay */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};

export default Navbar;
