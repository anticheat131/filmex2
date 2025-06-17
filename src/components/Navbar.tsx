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
import { Link } from 'react-router-dom';
import MoviesDropdown from './navigation/MoviesDropdown';
import ShowsDropdown from './navigation/ShowsDropdown';
import TrendingDropdown from './navigation/TrendingDropdown';
import MoreDropdown from './navigation/MoreDropdown';
import NavbarSearch from './navigation/NavbarSearch';
import { Root as PopoverRoot, Trigger as PopoverTrigger, Content as PopoverContent } from '@radix-ui/react-popover';
import { useTheme } from '@/contexts/theme';
import { useTranslation } from 'react-i18next';
import { setTmdbLanguage } from '@/utils/services/tmdb';

const regions = [
  { code: 'en', flag: 'gb' },
  { code: 'de', flag: 'de' }
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showMoviesDropdown, setShowMoviesDropdown] = React.useState(false);
  const [showShowsDropdown, setShowShowsDropdown] = React.useState(false);
  const [showTrendingDropdown, setShowTrendingDropdown] = React.useState(false);
  const [showMoreDropdown, setShowMoreDropdown] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);                                                                                                                                                                                                                                                                                                                                                            
  const [region, setRegion] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved === 'de' ? 'de' : 'en';
  }); // Default to United States
  const [regionDropdown, setRegionDropdown] = useState(false);
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme ? useTheme() : { theme: 'system', setTheme: () => {} };
  const { t, i18n } = useTranslation();

  const regionNames: Record<string, string> = {
    en: t('English', 'English'),
    de: t('German', 'German')
  };

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

  const handleRegionChange = (code: string) => {
    setRegion(code);
    setRegionDropdown(false);
    if (code === 'de') {
      i18n.changeLanguage('de');
      setTmdbLanguage('de-DE');
      localStorage.setItem('language', 'de');
    } else {
      i18n.changeLanguage('en');
      setTmdbLanguage('en-US');
      localStorage.setItem('language', 'en');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved === 'de') {
      i18n.changeLanguage('de');
      setTmdbLanguage('de-DE');
      setRegion('de');
    } else {
      i18n.changeLanguage('en');
      setTmdbLanguage('en-US');
      setRegion('en');
    }
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full border-b bg-background">
      <div className="container flex h-14 items-center justify-between w-full px-2 sm:px-4">
        {/* Logo and nav links grouped together */}
        <div className="flex items-center">
          <Link to="/">
            <span className="font-semibold text-2xl tracking-tight select-none">
              <span style={{ color: '#4F46E5' }}>F</span><span className="text-white">ilmex</span>
            </span>
          </Link>
          {/* Main nav links (desktop, centered relative to logo) */}
          <nav aria-label="Main" data-orientation="horizontal" dir="ltr" className="relative z-10 main-container flex-1 items-center justify-center ml-2 hidden lg:flex">
            <div style={{position:'relative'}}>
              <ul data-orientation="horizontal" className="group flex flex-1 list-none items-center justify-center space-x-1" dir="ltr">
                <li
                  onMouseEnter={() => setShowMoviesDropdown(true)}
                  onMouseLeave={() => setShowMoviesDropdown(false)}
                  style={{ position: 'relative' }}
                >
                  <button className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 group gap-2">
                    {/* Movies icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clapperboard size-4"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"></path><path d="m6.2 5.3 3.1 3.9"></path><path d="m12.4 3.4 3.1 4"></path><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path></svg>
                    {t('Movies')}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down relative top-px ml-1 size-3 transition duration-200 group-data-[state=open]:rotate-180"><path d="m6 9 6 6 6-6"></path></svg>
                  </button>
                  {showMoviesDropdown && <MoviesDropdown />}
                </li>
                <li
                  onMouseEnter={() => setShowShowsDropdown(true)}
                  onMouseLeave={() => setShowShowsDropdown(false)}
                  style={{ position: 'relative' }}
                >
                  <button className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 group gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tv size-4"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
                    {t('Shows')}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down relative top-px ml-1 size-3 transition duration-200 group-data-[state=open]:rotate-180"><path d="m6 9 6 6 6-6"></path></svg>
                  </button>
                  {showShowsDropdown && <ShowsDropdown />}
                </li>
                <li>
                  <Link className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 gap-2 relative" to="/live-tv">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-antenna size-4"><path d="M2 12 7 2"></path><path d="m7 12 5-10"></path><path d="m12 12 5-10"></path><path d="m17 12 5-10"></path><path d="M4.5 7h15"></path><path d="M12 16v6"></path></svg>
                    {t('TV')}
                  </Link>
                </li>
                <li>
                  <Link className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 gap-2 relative" to="/audiobooks">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" className="size-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M640 199.9v54l-320 200L0 254v-54l320 200 320-200.1zm-194.5 72l47.1-29.4c-37.2-55.8-100.7-92.6-172.7-92.6-72 0-135.5 36.7-172.6 92.4h.3c2.5-2.3 5.1-4.5 7.7-6.7 89.7-74.4 219.4-58.1 290.2 36.3zm-220.1 18.8c16.9-11.9 36.5-18.7 57.4-18.7 34.4 0 65.2 18.4 86.4 47.6l45.4-28.4c-20.9-29.9-55.6-49.5-94.8-49.5-38.9 0-73.4 19.4-94.4 49zM103.6 161.1c131.8-104.3 318.2-76.4 417.5 62.1l.7 1 48.8-30.4C517.1 112.1 424.8 58.1 319.9 58.1c-103.5 0-196.6 53.5-250.5 135.6 9.9-10.5 22.7-23.5 34.2-32.6zm467 32.7z"></path></svg>
                    Audible
                  </Link>
                </li>
                <li
                  onMouseEnter={() => setShowTrendingDropdown(true)}
                  onMouseLeave={() => setShowTrendingDropdown(false)}
                  style={{ position: 'relative' }}
                >
                  <button className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 group gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up size-4"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                    {t('Trending')}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down relative top-px ml-1 size-3 transition duration-200 group-data-[state=open]:rotate-180"><path d="m6 9 6 6 6-6"></path></svg>
                  </button>
                  {showTrendingDropdown && <TrendingDropdown />}
                </li>
                <li
                  onMouseEnter={() => setShowMoreDropdown(true)}
                  onMouseLeave={() => setShowMoreDropdown(false)}
                  style={{ position: 'relative' }}
                >
                  <button className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 group gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-collapse size-4"><path d="m3 10 2.5-2.5L3 5"></path><path d="m3 19 2.5-2.5L3 14"></path><path d="M10 6h11"></path><path d="M10 12h11"></path><path d="M10 18h11"></path></svg>
                    {t('More')}
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down relative top-px ml-1 size-3 transition duration-200 group-data-[state=open]:rotate-180"><path d="m6 9 6 6 6-6"></path></svg>
                  </button>
                  {showMoreDropdown && <MoreDropdown />}
                </li>
                <li>
                  <Link className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 gap-2 relative" to="/4k-contents">
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" className="size-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M3.577 8.9v.03h1.828V5.898h-.062a47 47 0 0 0-1.766 3.001z"></path><path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm2.372 3.715.435-.714h1.71v3.93h.733v.957h-.733V11H5.405V9.888H2.5v-.971c.574-1.077 1.225-2.142 1.872-3.202m7.73-.714h1.306l-2.14 2.584L13.5 11h-1.428l-1.679-2.624-.615.7V11H8.59V5.001h1.187v2.686h.057L12.102 5z"></path></svg>
                    {t('Contents')}
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        {/* Right side: search, settings, menu */}
        <div className="flex items-center gap-1 sm:gap-2 w-full max-w-xs sm:max-w-none lg:ml-24">
          <div className="relative flex items-center flex-[0.96] min-w-0 w-full sm:w-44 md:w-56 max-w-xs sm:max-w-xs md:max-w-sm lg:max-w-xs">
            <NavbarSearch />
          </div>
          <a href="https://discord.gg/ascmZ7nExu" target="_blank" rel="noopener noreferrer" className="gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10 bg-backround flex size-10 items-center justify-center border hidden sm:flex" title="Share on Reddit">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 640 512" className="size-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69 28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path></svg>
          </a>
          {/* Settings menu button and popover */}
          <PopoverRoot open={settingsOpen} onOpenChange={setSettingsOpen}>
            <PopoverTrigger asChild>
              <button
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 shrink-0"
                type="button"
                aria-haspopup="dialog"
                aria-expanded={settingsOpen}
                aria-controls="settings-menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings size-4"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <span className="sr-only">{t('Settings')}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent sideOffset={8} align="end" className="z-[2147483647] w-72 rounded-sm border bg-popover p-4 text-popover-foreground shadow-md outline-none space-y-4">
              <div className="text-left">
                <h5 className="font-bold text-lg mb-2">{t('Settings')}</h5>
                <div className="mt-2 space-y-2">
                  <label className="font-medium text-xs text-muted-foreground block">{t('Account')}</label>
                  <div className="flex flex-col gap-2">
                    {user ? (
                      <>
                        <a href="/profile">
                          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 w-full rounded-sm border bg-background px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-accent text-left">
                            {t('Profile')}
                          </button>
                        </a>
                        <button
                          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 w-full rounded-sm border bg-background px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-red-600 text-left"
                          onClick={logout}
                        >
                          {t('Logout')}
                        </button>
                      </>
                    ) : (
                      <a href="/login">
                        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 w-full rounded-sm border bg-background px-4 py-2 text-white transition duration-300 ease-in-out hover:bg-accent text-left">
                          {t('Login')}
                        </button>
                      </a>
                    )}
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  <label className="font-medium text-xs text-muted-foreground block">{t('Region')}</label>
                  <div className="relative">
                    <button type="button" onClick={() => setRegionDropdown(v => !v)} className="flex h-10 w-full items-center justify-between rounded-sm border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 text-left">
                      <span style={{ pointerEvents: 'none' }}>
                        <div className="flex items-center gap-2">
                          <img src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${region === 'en' ? 'gb' : region}.svg`} style={{ display: 'inline-block', width: '1em', height: '1em', verticalAlign: 'middle' }} alt={region} />
                          {regionNames[region] || t('Select region')}
                        </div>
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down size-4 opacity-50" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                    </button>
                    {regionDropdown && (
                      <div className="absolute left-0 top-full mt-1 w-full bg-background border border-input shadow-lg z-50 rounded-sm max-h-48 overflow-y-auto">
                        {regions.map(r => (
                          <button key={r.code} onClick={() => { handleRegionChange(r.code); }} className={`flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-accent ${region === r.code ? 'bg-accent text-accent-foreground font-bold' : ''} rounded-sm`}>
                            <img src={`https://cdn.jsdelivr.net/gh/lipis/flag-icons/flags/4x3/${r.flag}.svg`} style={{ width: '1em', height: '1em', verticalAlign: 'middle' }} alt={regionNames[r.code]} />
                            {regionNames[r.code]}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <label className="font-medium text-xs text-muted-foreground block">{t('Theme')}</label>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setTheme && setTheme('light')} className={`inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${theme === 'light' ? 'bg-primary text-primary-foreground' : ''}`}> 
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sun size-4 mr-2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
                      <span className="capitalize">{t('Light')}</span>
                    </button>
                    <button onClick={() => setTheme && setTheme('dark')} className={`inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${theme === 'dark' ? 'bg-primary text-primary-foreground' : ''}`}> 
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-moon size-4 mr-2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
                      <span className="capitalize">{t('Dark')}</span>
                    </button>
                    <button onClick={() => setTheme && setTheme('system')} className={`inline-flex items-center justify-start gap-2 whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 ${theme === 'system' ? 'bg-primary text-primary-foreground' : ''}`}> 
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-monitor-cog size-4 mr-2"><path d="M12 17v4"></path><path d="m15.2 4.9-.9-.4"></path><path d="m15.2 7.1-.9.4"></path><path d="m16.9 3.2-.4-.9"></path><path d="m16.9 8.8-.4.9"></path><path d="m19.5 2.3-.4.9"></path><path d="m19.5 9.7-.4-.9"></path><path d="M21.7 4.5-.9.4"></path><path d="M21.7 7.5-.9-.4"></path><path d="M22 13v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"></path><path d="M8 21h8"></path><circle cx="18" cy="6" r="3"></circle></svg>
                      <span className="capitalize">{t('System')}</span>
                    </button>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </PopoverRoot>
          <div className="lg:hidden">
            <button
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
              type="button"
              aria-haspopup="dialog"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-menu size-4"><line x1="4" x2="20" y1="12" y2="12"></line><line x1="4" x2="20" y1="6" y2="6"></line><line x1="4" x2="20" y1="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu overlay */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </header>
  );
};

export default Navbar;
