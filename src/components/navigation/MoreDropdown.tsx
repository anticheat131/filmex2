import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const MoreDropdown = () => {
  const { t } = useTranslation();
  return (
    <div className="absolute left-0 top-full flex justify-center items-start text-left">
      <div data-state="open" data-orientation="horizontal" className="origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]" style={{textAlign: 'left', '--radix-navigation-menu-viewport-width': '650px', '--radix-navigation-menu-viewport-height': '214px'}}>
        <div aria-labelledby="more-dropdown-trigger" data-orientation="horizontal" className="left-0 top-0 w-full md:absolute md:w-auto" style={{textAlign: 'left'}}>
          <div className="p-6 pb-0" style={{textAlign: 'left'}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-collapse mr-1 inline size-4"><path d="m3 10 2.5-2.5L3 5"></path><path d="m3 19 2.5-2.5L3 14"></path><path d="M10 6h11"></path><path d="M10 12h11"></path><path d="M10 18h11"></path></svg> {t('More')}
            <p className="mt-2 text-sm">{t('MoreDropdownDescription')}</p>
          </div>
          <div className="grid w-[650px] grid-cols-2 p-4" style={{textAlign: 'left'}}>
            <Link className="select-none space-y-2 rounded-md p-3 hover:bg-accent" to="/person/popular">
              <div className="text-sm font-medium leading-none">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart mr-2 inline size-3"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg> {t('Popular')}
                </div>
              </div>
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{t('MoreDropdownPopularPeopleDescription')}</p>
            </Link>
            <Link className="select-none space-y-2 rounded-md p-3 hover:bg-accent bg-[#43437b] hover:bg-[#333385]" to="/news">
              <div className="text-sm font-medium leading-none">
                <div className="flex items-center">
                  <svg stroke="currentColor" fill="none" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true" className="mr-2 inline size-3" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"></path></svg> {t('Latest News')}
                  <div className="inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 ml-2 px-1 py-0 text-[9px] leading-normal tracking-wide">{t('NEW')}</div>
                </div>
              </div>
              <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{t('MoreDropdownLatestNewsDescription')}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreDropdown;
