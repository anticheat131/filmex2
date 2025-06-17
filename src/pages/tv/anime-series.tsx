import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { tmdb } from '@/utils/services/tmdb';
import MediaGrid from '@/components/MediaGrid';
import { ensureExtendedMediaArray, Media } from '@/utils/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sheet, SheetTrigger, SheetContent, SheetClose } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import * as Select from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useTranslation } from 'react-i18next';

const ANIME_GENRE_ID = 16;
const currentYear = new Date().getFullYear();

export default function TVAnimeSeries() {
  const location = useLocation();
  const { t } = useTranslation();
  const [shows, setShows] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [filterOpen, setFilterOpen] = useState(false);
  // Anime-specific filters
  const [fromYear, setFromYear] = useState<number | null>(null);
  const [toYear, setToYear] = useState<number | null>(null);
  const [language, setLanguage] = useState<string>('');
  const [voteAverage, setVoteAverage] = useState<number>(0);
  const [minVotes, setMinVotes] = useState<number>(0);

  const TV_LANGUAGES = [
    { code: 'en', name: t('English') },
    { code: 'ja', name: t('Japanese') },
    { code: 'ko', name: t('Korean') },
    { code: 'zh', name: t('Chinese') },
    { code: 'fr', name: t('French') },
    { code: 'es', name: t('Spanish') },
    { code: 'de', name: t('German') },
    { code: 'it', name: t('Italian') },
  ];
  const SORT_OPTIONS = [
    { value: 'popularity.desc', label: t('Highest Popularity'), chevron: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down size-4"><path d="m6 9 6 6 6-6"></path></svg>
    ) },
    { value: 'popularity.asc', label: t('Lowest Popularity'), chevron: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up size-4"><path d="m18 15-6-6-6 6"></path></svg>
    ) },
    { value: 'first_air_date.desc', label: t('Most Recent'), chevron: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down size-4"><path d="m6 9 6 6 6-6"></path></svg>
    ) },
    { value: 'first_air_date.asc', label: t('Least Recent'), chevron: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up size-4"><path d="m18 15-6-6-6 6"></path></svg>
    ) },
    { value: 'vote_average.desc', label: t('Highest Rating'), chevron: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down size-4"><path d="m6 9 6 6 6-6"></path></svg>
    ) },
    { value: 'vote_average.asc', label: t('Lowest Rating'), chevron: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up size-4"><path d="m18 15-6-6-6 6"></path></svg>
    ) },
    { value: 'vote_count.desc', label: t('Most Voted'), chevron: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down size-4"><path d="m6 9 6 6 6-6"></path></svg>
    ) },
    { value: 'vote_count.asc', label: t('Least Voted'), chevron: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up size-4"><path d="m18 15-6-6-6 6"></path></svg>
    ) },
  ];

  const clearFilters = () => {
    setFromYear(null);
    setToYear(null);
    setLanguage('');
    setVoteAverage(0);
    setMinVotes(0);
  };

  useEffect(() => {
    async function fetchAnimeShows() {
      setLoading(true);
      // Parse query params from URL
      const urlParams = new URLSearchParams(location.search);
      const apiParams: any = {
        page,
        sort_by: sortBy,
        with_genres: ANIME_GENRE_ID,
        'first_air_date.gte': fromYear ? `${fromYear}-01-01` : undefined,
        'first_air_date.lte': toYear ? `${toYear}-12-31` : undefined,
        with_original_language: language || undefined,
        vote_average_gte: voteAverage > 0 ? voteAverage : undefined,
        vote_count_gte: minVotes > 0 ? minVotes : undefined,
      };
      // Forward all query params from URL (except those controlled by UI)
      let hasWatchProviders = false;
      urlParams.forEach((value, key) => {
        if (
          ![
            'page',
            'sort_by',
            'with_genres',
            'first_air_date.gte',
            'first_air_date.lte',
            'with_original_language',
            'vote_average_gte',
            'vote_count_gte',
          ].includes(key)
        ) {
          apiParams[key] = value;
        }
        if (key === 'with_watch_providers' && value) {
          hasWatchProviders = true;
        }
      });
      // If with_watch_providers is present but watch_region is not, default to US
      if (hasWatchProviders && !('watch_region' in apiParams)) {
        apiParams['watch_region'] = 'US';
      }
      const { data } = await tmdb.get('/discover/tv', { params: apiParams });
      setShows(data.results);
      setTotalPages(Math.min(data.total_pages, 24)); // TMDB max pages for anime
      setLoading(false);
    }
    fetchAnimeShows();
  }, [location.search, page, sortBy, fromYear, toYear, language, voteAverage, minVotes]);

  const yearOptions = Array.from({ length: 80 }, (_, i) => currentYear - i);

  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
          <div className="md:mb-12 md:mt-6 text-left">
            <h1 className="mb-2 text-2xl font-medium text-white text-left">{t('Anime TV Shows')}</h1>
            <p className="max-w-3xl text-muted-foreground text-left">
              {t('Dive into the vast world of anime series, from ongoing hits to all-time classics. Find your next binge-worthy show across all genres and art styles.')}
            </p>
          </div>
          <div className="flex justify-end gap-2 mb-6">
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sliders-horizontal mr-2 size-4"><line x1="21" x2="14" y1="4" y2="4"></line><line x1="10" x2="3" y1="4" y2="4"></line><line x1="21" x2="12" y1="12" y2="12"></line><line x1="8" x2="3" y1="12" y2="12"></line><line x1="21" x2="16" y1="20" y2="20"></line><line x1="12" x2="3" y1="20" y2="20"></line><line x1="14" x2="14" y1="2" y2="6"></line><line x1="8" x2="8" y1="10" y2="14"></line><line x1="16" x2="16" y1="18" y2="22"></line></svg>
                  {t('Filters')}
                  {(fromYear || toYear || language || voteAverage > 0 || minVotes > 0) && (
                    <div className="inline-flex items-center rounded-full border py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 ml-2 px-2 text-xs leading-none">1</div>
                  )}
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm flex flex-col px-0">
                <div className="flex flex-col space-y-2 text-center sm:text-left px-4 md:px-6">
                  <h2 className="text-lg font-semibold text-foreground">{t('Filters')}</h2>
                  <p className="text-sm text-muted-foreground">{t('Narrow down your anime search results.')}</p>
                </div>
                <div className="relative overflow-hidden px-4 md:px-6">
                  <div className="space-y-8">
                    {/* Date pickers */}
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none text-muted-foreground">{t('From')}</label>
                        <select className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full justify-start text-left font-normal text-muted-foreground" value={fromYear || ''} onChange={e => setFromYear(e.target.value ? Number(e.target.value) : null)}>
                          <option value="">{t('Select date...')}</option>
                          {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium leading-none text-muted-foreground">{t('To')}</label>
                        <select className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full justify-start text-left font-normal text-muted-foreground" value={toYear || ''} onChange={e => setToYear(e.target.value ? Number(e.target.value) : null)}>
                          <option value="">{t('Select date...')}</option>
                          {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                    </div>
                    {/* Language */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium leading-none text-muted-foreground">{t('Language')}</label>
                      <select className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-muted-foreground w-full justify-between text-left" value={language} onChange={e => setLanguage(e.target.value)}>
                        <option value="">{t('Select language...')}</option>
                        {TV_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                      </select>
                    </div>
                    {/* Vote Average */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium leading-none text-muted-foreground">{t('Vote Average')}</label>
                      <Slider min={0} max={10} step={0.1} value={[voteAverage]} onValueChange={([v]) => setVoteAverage(v)} />
                      <div className="mt-4 flex justify-between border-t">
                        {[...Array(11)].map((_, i) => (
                          <div className="relative pt-2" key={i}>
                            <span className="text-[9px] text-muted-foreground">{i}</span>
                            <span className="absolute left-1/2 top-0 block h-1/3 w-px -translate-x-px bg-muted"></span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Minimum Votes */}
                    <div className="space-y-4">
                      <label className="text-sm font-medium leading-none text-muted-foreground">{t('Minimum Votes')}</label>
                      <Slider min={0} max={500} step={10} value={[minVotes]} onValueChange={([v]) => setMinVotes(v)} />
                      <div className="mt-4 flex justify-between border-t">
                        {[0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500].map(v => (
                          <div className="relative pt-2" key={v}>
                            <span className="text-[9px] text-muted-foreground">{v}</span>
                            <span className="absolute left-1/2 top-0 block h-1/3 w-px -translate-x-px bg-muted"></span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2 px-4 md:gap-0 md:px-6 mt-6">
                  <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8" onClick={clearFilters} type="button">{t('Clear')}</button>
                  <SheetClose asChild>
                    <button type="button" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" onClick={() => { setPage(1); setFilterOpen(false); }}>{t('Save Changes')}</button>
                  </SheetClose>
                </div>
                <button type="button" className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=open]:bg-secondary" onClick={() => setFilterOpen(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x size-4"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
                  <span className="sr-only">{t('Close')}</span>
                </button>
              </SheetContent>
            </Sheet>
            {/* Sort by popover button */}
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="sortby-dropdown" data-state="closed" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-down-wide-narrow mr-2 size-4"><path d="m3 16 4 4 4-4"></path><path d="M7 20V4"></path><path d="M11 4h10"></path><path d="M11 8h7"></path><path d="M11 12h4"></path></svg>
                  {t('Sort by')}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" side="top" className="z-50 w-72 rounded-md border bg-popover text-popover-foreground shadow-md outline-none flex flex-col gap-1 p-1">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} className={`inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 justify-between text-left font-normal ${sortBy === opt.value ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-accent hover:text-accent-foreground'}`} onClick={() => { setSortBy(opt.value); setPage(1); }}>
                    <span className="flex items-center">{opt.label}</span>
                    {opt.chevron}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
          <div>
            {loading ? (
              <div className="text-white text-center py-12">{t('Loading anime TV shows...')}</div>
            ) : (
              <MediaGrid media={ensureExtendedMediaArray(shows)} title="" />
            )}
          </div>
          {/* Pagination controls */}
          <div className="flex justify-center mt-10">
            <button className="px-3 py-2 mx-1 rounded bg-gray-800 text-white disabled:opacity-50" onClick={() => setPage(page - 1)} disabled={page === 1}>{t('Previous')}</button>
            <span className="px-4 py-2 text-white">{t('Page {{page}} of {{totalPages}}', { page, totalPages })}</span>
            <button className="px-3 py-2 mx-1 rounded bg-gray-800 text-white disabled:opacity-50" onClick={() => setPage(page + 1)} disabled={page === totalPages}>{t('Next')}</button>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
