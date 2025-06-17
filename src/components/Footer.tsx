import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ExternalLink, 
  Github, 
  Twitter, 
  Facebook, 
  Instagram, 
  Mail, 
  ChevronDown, 
  Heart,
  Smartphone
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Separator } from '@/components/ui/separator';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const isMobile = useIsMobile();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const FooterSection = ({ 
    title, 
    children, 
    id 
  }: { 
    title: string; 
    children: React.ReactNode; 
    id: string;
  }) => {
    const isExpanded = expandedSection === id;
    
    return (
      <div className="w-full">
        {isMobile ? (
          <div className="w-full">
            <button 
              onClick={() => toggleSection(id)}
              className="w-full flex justify-between items-center py-3 text-white font-medium"
            >
              <span>{t(title)}</span>
              <ChevronDown 
                className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'transform rotate-180' : ''}`} 
              />
            </button>
            <div 
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isExpanded ? 'max-h-60 opacity-100 mb-4' : 'max-h-0 opacity-0'
              }`}
            >
              {children}
            </div>
            {!isExpanded && <Separator className="bg-white/10 my-1" />}
          </div>
        ) : (
          <div className="w-full">
            <h3 className="text-white font-medium text-lg mb-4">{t(title)}</h3>
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <footer className="mt-auto bg-gradient-to-b from-black/60 to-black border-t border-white/10 pt-8 pb-6">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className={`${isMobile ? 'flex flex-col' : 'grid grid-cols-1 md:grid-cols-4 gap-8'}`}>
          
          {/* About Section */}
          <FooterSection title={t("Watch on Filmex.to")} id="about">
            <p className="text-white/70 text-sm mb-4">
              {t('Discover and enjoy the best movies and TV shows all in one place. Let\'s Filmex helps you find, explore, and watch your favorite content online.')}
            </p>
            {isMobile && (
              <div className="flex items-center mb-2">
                <Smartphone className="h-4 w-4 text-accent mr-2" />
                <span className="text-white/70 text-xs">{t('Download our mobile app')}</span>
              </div>
            )}
          </FooterSection>
          
          {/* Quick Links */}
          <FooterSection title={t("Explore")} id="explore">
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-white/70 hover:text-accent transition-colors flex items-center">
                  <span className="w-1 h-1 bg-accent/70 rounded-full mr-2"></span>
                  {t('Home')}
                </Link>
              </li>
              <li>
                <Link to="/movies" className="text-white/70 hover:text-accent transition-colors flex items-center">
                  <span className="w-1 h-1 bg-accent/70 rounded-full mr-2"></span>
                  {t('Movies')}
                </Link>
              </li>
              <li>
                <Link to="/tv" className="text-white/70 hover:text-accent transition-colors flex items-center">
                  <span className="w-1 h-1 bg-accent/70 rounded-full mr-2"></span>
                  {t('TV Shows')}
                </Link>
              </li>
              <li>
                <Link to="/trending" className="text-white/70 hover:text-accent transition-colors flex items-center">
                  <span className="w-1 h-1 bg-accent/70 rounded-full mr-2"></span>
                  {t('Trending')}
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-white/70 hover:text-accent transition-colors flex items-center">
                  <span className="w-1 h-1 bg-accent/70 rounded-full mr-2"></span>
                  {t('Search')}
                </Link>
              </li>
            </ul>
          </FooterSection>
          
          {/* Legal */}
          <FooterSection title={t("Legal")} id="legal">
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-white/70 hover:text-accent transition-colors flex items-center">
                  <span className="w-1 h-1 bg-accent/70 rounded-full mr-2"></span>
                  {t('Terms of Service')}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/70 hover:text-accent transition-colors flex items-center">
                  <span className="w-1 h-1 bg-accent/70 rounded-full mr-2"></span>
                  {t('Privacy Policy')}
                </Link>
              </li>
              <li>
                <Link to="/dmca" className="text-white/70 hover:text-accent transition-colors flex items-center">
                  <span className="w-1 h-1 bg-accent/70 rounded-full mr-2"></span>
                  {t('DMCA Notice')}
                </Link>
              </li>
              <li>
                <Link to="/content-removal" className="text-white/70 hover:text-accent transition-colors flex items-center">
                  <span className="w-1 h-1 bg-accent/70 rounded-full mr-2"></span>
                  {t('Content Removal')}
                </Link>
              </li>
            </ul>
          </FooterSection>
          
          {/* Social */}
          <FooterSection title={t("Connect")} id="connect">
            <div className="flex flex-wrap gap-2">
              <a 
                href="https://discord.gg/ascmZ7nExu" 
                className="bg-white/5 hover:bg-accent/20 hover:scale-105 p-2 rounded-full transition-all duration-200"
                aria-label="Discord"
              >
                <Github className="h-5 w-5 text-white" />
              </a>
              <a 
                href="https://x.com/" 
                className="bg-white/5 hover:bg-accent/20 hover:scale-105 p-2 rounded-full transition-all duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-white" />
              </a>
              <a 
                href="https://facebook.com/" 
                className="bg-white/5 hover:bg-accent/20 hover:scale-105 p-2 rounded-full transition-all duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-white" />
              </a>
              <a 
                href="https://instagram.com/" 
                className="bg-white/5 hover:bg-accent/20 hover:scale-105 p-2 rounded-full transition-all duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a 
                href="mailto:nomailyet@nomail.com" 
                className="bg-white/5 hover:bg-accent/20 hover:scale-105 p-2 rounded-full transition-all duration-200"
                aria-label="Email"
              >
                <Mail className="h-5 w-5 text-white" />
              </a>
            </div>
            <p className="mt-4 text-white/50 text-xs flex items-center">
              <span className="mr-1">{t('Powered by')}</span>
              <a 
                href="https://www.themoviedb.org/" 
                className="hover:text-accent transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                TMDB
              </a>
            </p>
          </FooterSection>
        </div>
        
        <div className="mt-8 pt-4 border-t border-white/10 text-center">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-white/50 text-xs flex items-center">
              © {currentYear} Filmex.to All rights reserved.
              <span className="inline-flex items-center mx-1">
                {t('Built with')} <Heart className="h-3 w-3 text-accent mx-1" fill="#E63462" /> {t('by the community')}
              </span>
            </p>
            
            <p className="text-white/50 text-xs hidden md:block">
              {t('This site does not store any files on its server. All contents are provided by non-affiliated third parties.')}
            </p>
          </div>
          
          {isMobile && (
            <p className="text-white/50 text-xs mt-2">
              {t('This site does not store any files on its server.')}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
