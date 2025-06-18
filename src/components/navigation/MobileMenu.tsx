import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from './Logo';
import NavLinks from './NavLinks';
import { useAuth } from '@/hooks';
import UserMenu from './UserMenu';
import MobileAccordionMenu from './MobileAccordionMenu';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { user } = useAuth();

  React.useEffect(() => {
    if (!isOpen) return;
    function handleMenuCloseEvent(e: CustomEvent) {
      onClose();
    }
    window.addEventListener('closeMobileMenu', handleMenuCloseEvent as EventListener);
    return () => window.removeEventListener('closeMobileMenu', handleMenuCloseEvent as EventListener);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <MobileAccordionMenu />
  );
};

export default MobileMenu;
