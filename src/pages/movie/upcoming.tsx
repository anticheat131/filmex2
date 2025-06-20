import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaCard from '@/components/MediaCard';
import { getDiscoverMovies } from '@/utils/services/movies';
import { ensureExtendedMediaArray } from '@/utils/types';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 20; // TMDB default
const TOTAL_PAGES = 20; // Limit to 3 months, so fewer pages

function getUpcomingDateRange() {
  const now = new Date();
  const start = now.toISOString().slice(0, 10);
  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 3);
  const end = endDate.toISOString().slice(0, 10);
  return { start, end };
}

export default function MovieUpcoming() {
  const { t } = useTranslation();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    setLoading(true);
    setError('');
    const { start, end } = getUpcomingDateRange();
    getDiscoverMovies({
      page,
      sort_by: 'primary_release_date.asc',
      'primary_release_date.gte': start,
      'primary_release_date.lte': end,
    })
      .then((data) => setMovies(ensureExtendedMediaArray(data.results)))
      .catch(() => setError(t('Failed to load upcoming movies.')))
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
                  onClick={e => { e.preventDefault(); setSearchParams({ page: String(p) }); }}
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
              onClick={e => { e.preventDefault(); if (page < TOTAL_PAGES) setSearchParams({ page: String(page + 1) }); }}
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
        <div className="container space-y-8">
          <div className="md:mb-12 md:mt-6 pt-16 text-left">
            <h1 className="mb-2 text-2xl font-medium text-left">{t('Upcoming Movies')}</h1>
            <p className="max-w-3xl text-muted-foreground text-left">
              {t('Following content that will come, in next 3 months will be listed here.')}
            </p>
          </div>
          {loading ? (
            <div className="py-16 text-center text-white">{t('Loading…')}</div>
          ) : error ? (
            <div className="py-16 text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-x-6 gap-y-8 justify-start">
              {movies.filter(movie => movie.poster_path).map((movie) => (
                <div key={movie.media_id} className="group relative">
                  <MediaCard 
                    media={movie} 
                    trendingNow 
                    className="w-[175px] h-[275px] md:h-[350px] sm:w-full"
                  />
                  <div className="w-full text-center mt-2 text-sm text-muted-foreground font-medium">
                    {movie.release_date ? new Date(movie.release_date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
          {renderPagination()}
        </div>
      </div>
      <Footer />
    </div>
  );
}
