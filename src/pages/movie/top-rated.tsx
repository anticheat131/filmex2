import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { getTopRatedMovies } from '@/utils/services/movies';
import { ensureExtendedMediaArray } from '@/utils/types';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 20; // TMDB default
const TOTAL_PAGES = 510; // TMDB max for top rated

export default function MovieTopRated() {
  const { t } = useTranslation();
  const [movies, setMovies] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getTopRatedMovies(page)
      .then((data) => setMovies(ensureExtendedMediaArray(data)))
      .catch(() => setError(t('Failed to load movies.')))
      .finally(() => setLoading(false));
  }, [page]);

  // Pagination logic for first 3, last, and next
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= 3; i++) {
      pages.push(i);
    }
    pages.push('ellipsis');
    pages.push(TOTAL_PAGES);
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
              className="items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 gap-1 pr-2.5 hidden md:flex"
              aria-label="Go to next page"
              rel="next"
              href={`?page=${page + 1}`}
              onClick={e => { e.preventDefault(); if (page < TOTAL_PAGES) setPage(page + 1); }}
              style={page >= TOTAL_PAGES ? { pointerEvents: 'none', opacity: 0.5 } : {}}
            >
              <span>{t('Next')}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right size-4"><path d="m9 18 6-6-6-6"></path></svg>
            </a>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="relative flex-1 py-4">
        <div className="main-container mx-auto px-4 py-8 w-full flex-1" style={{maxWidth:'1850px'}}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white text-left">{t('Top Rated Movies')}</h1>
              <p className="text-gray-300 mt-1 text-base max-w-2xl text-left">
                {t('Explore the pinnacle of cinematic excellence with our collection of top-rated movies. These films have been recognized for their outstanding storytelling, direction, and performances.')}
              </p>
            </div>
          </div>
          {loading ? (
            <div className="py-16 text-center text-white">{t('Loading…')}</div>
          ) : error ? (
            <div className="py-16 text-center text-red-500">{error}</div>
          ) : (
            <div className="grid-list">
              <MediaGrid media={movies} />
            </div>
          )}
          {renderPagination()}
        </div>
      </div>
      <Footer />
    </div>
  );
}
