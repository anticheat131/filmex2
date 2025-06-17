import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { getDiscoverMovies, DiscoverMoviesParams } from '@/utils/services/movies';
import { ensureExtendedMediaArray } from '@/utils/types';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 20; // TMDB default
const NETFLIX_PROVIDER_ID = '8';

export default function MovieNetflix() {
  const { t } = useTranslation();
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const params: DiscoverMoviesParams = {
      page,
      with_watch_providers: NETFLIX_PROVIDER_ID,
      watch_region: 'US', // or use user's region if available
      sort_by: 'popularity.desc',
    };
    getDiscoverMovies(params)
      .then((data) => {
        setMovies(ensureExtendedMediaArray(data.results));
        setTotalPages(Math.min(data.total_pages, 500));
      })
      .catch(() => setError(t('Failed to load Netflix movies.')))
      .finally(() => setLoading(false));
  }, [page]);

  // Pagination logic for first 3, last, and next
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= 3; i++) {
      pages.push(i);
    }
    if (totalPages > 4) {
      pages.push('ellipsis');
      pages.push(totalPages);
    }
    return (
      <nav role="navigation" aria-label="pagination" className="mx-auto flex w-full justify-center">
        <ul className="flex flex-row items-center gap-1">
          {pages.map((p, idx) =>
            p === 'ellipsis' ? (
              <span key={idx} aria-hidden="true" className="size-9 items-center justify-center hidden md:flex">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis size-4"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                <span className="sr-only">{t('More pages')}</span>
              </span>
            ) : (
              <li key={p}>
                <a
                  aria-current={page === p ? 'page' : undefined}
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-10 w-10 ${page === p ? 'border border-input bg-background' : 'hover:bg-accent hover:text-accent-foreground'}`}
                  href={`?page=${p}`}
                  onClick={e => { e.preventDefault(); setPage(Number(p)); }}
                >
                  {p}
                </a>
              </li>
            )
          )}
          <li>
            <a
              className={`items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pr-2.5 hidden md:flex ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
              aria-label="Go to next page"
              rel="next"
              href={`?page=${page + 1}`}
              onClick={e => { e.preventDefault(); if (page < totalPages) setPage(page + 1); }}
            >
              <span>Next</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right size-4"><path d="m9 18 6-6-6-6"/></svg>
            </a>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 px-4 pt-20 pb-8 main-container mx-auto w-full">
        <header className="mb-6 mt-2 flex flex-col items-start">
          <h1 className="mb-2 text-2xl font-medium flex items-center gap-4">
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" role="img" viewBox="0 0 24 24" className="size-28" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24zm8.489 0v9.63L18.6 22.951c-.043-7.86-.004-15.913.002-22.95zM5.398 1.05V24c1.873-.225 2.81-.312 4.715-.398v-9.22z"></path></svg>
          </h1>
          <p className="max-w-3xl text-muted-foreground text-left">{t('Dive into Netflix\'s vast library of original series, blockbuster movies, documentaries, and more. Stay ahead with their continually updated selection of binge-worthy content.')}</p>
        </header>
        {loading && <div className="text-center py-8">{t('Loading...')}</div>}
        {error && <div className="text-red-500 mb-4">{t(error)}</div>}
        {!loading && <MediaGrid media={movies} />}
        <div className="mt-8">{renderPagination()}</div>
      </main>
      <Footer />
    </div>
  );
}
