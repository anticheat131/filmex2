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
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
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
        backgroundColor: 'rgb(9, 9, 11)', // darker black background
        borderBottom: '2px solid rgb(57 55 55)', // 2px bottom border
        width: '100vw',
        boxSizing: 'border-box',
        // Reduce height by about 5%
        // We'll control padding inside container to shrink height and pull content up
      }}
    >
      <div className="container mx-auto px-4 py-[11px]"> 
        {/* Reduced vertical padding (original was probably py-3 = 12px) */}
        <div className="flex items-center justify-between" style={{ marginTop: '-4px' }}>
          {/* Pull up all content slightly by negative top margin */}

          {/* Logo area */}
          <div className="flex items-center">
            <Logo />
          </div>
          
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center justify-center ml-8">
            <NavLinks />
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            {/* Desktop search */}
            <div className="hidden md:block">
              <SearchBar />
            </div>
            
            {/* Mobile search - collapsed */}
            {isMobile && !isSearchExpanded && (
              <SearchBar 
                isMobile 
                expanded={isSearchExpanded} 
                onToggleExpand={toggleSearch}
              />
            )}

            {/* Mobile search - expanded */}
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
            
            {/* User menu or auth buttons */}
            {!isSearchExpanded && (
              <>
                {user ? (
                  <UserMenu />
                ) : (
                  <AuthButtons />
                )}
                
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
      
      {/* Mobile menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};

export default Navbar;
