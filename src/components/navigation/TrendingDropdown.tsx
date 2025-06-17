import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TrendingDropdown = () => {
  const { t } = useTranslation();
  return (
    <div className="absolute left-0 top-full flex justify-center items-start text-left">
      <div data-state="open" data-orientation="horizontal" className="origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]" style={{textAlign: 'left', '--radix-navigation-menu-viewport-width': '650px', '--radix-navigation-menu-viewport-height': '213px'}}>
        <div aria-labelledby="trending-dropdown-trigger" data-orientation="horizontal" className="left-0 top-0 w-full md:absolute md:w-auto" style={{textAlign: 'left'}}>
          <div className="p-6 pb-0" style={{textAlign: 'left'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trending-up mr-1 inline size-4"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg> {t('Trending')}
            <p className="mt-2 text-sm">{t('TrendingDropdownDescription')}</p>
          </div>
          <div className="grid w-[650px] grid-cols-2 p-4" style={{textAlign: 'left'}}>
            <Link className="select-none space-y-2 rounded-md p-3 hover:bg-accent" to="/trending/movie">
              <div className="text-sm font-medium leading-none">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clapperboard mr-2 inline size-3"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"></path><path d="m6.2 5.3 3.1 3.9"></path><path d="m12.4 3.4 3.1 4"></path><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path></svg> {t('Movies')}
                </div>
              </div>
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{t('TrendingDropdownMoviesDescription')}</p>
            </Link>
            <Link className="select-none space-y-2 rounded-md p-3 hover:bg-accent" to="/trending/tv">
              <div className="text-sm font-medium leading-none">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tv mr-2 inline size-3"><rect width="20" height="15" x="2" y="7" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg> {t('Shows')}
                </div>
              </div>
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{t('TrendingDropdownShowsDescription')}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingDropdown;
