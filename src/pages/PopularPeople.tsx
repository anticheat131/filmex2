import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

function getKnownFor(knownFor) {
  if (!Array.isArray(knownFor) || knownFor.length === 0) return '';
  // Use the department of the first item, fallback to 'Acting'
  return knownFor[0]?.media_type === 'person' ? knownFor[0]?.known_for_department : knownFor[0]?.media_type === 'movie' ? 'Acting' : 'Acting';
}

export default function PopularPeoplePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`${TMDB_BASE_URL}/person/popular?api_key=${TMDB_API_KEY}&page=${page}`)
      .then(res => res.json())
      .then(data => {
        setPeople(data.results || []);
        setTotalPages(data.total_pages || 1);
        setLoading(false);
      });
  }, [page]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="relative flex-1 py-4">
        <div className="container space-y-8">
          <div className="md:mb-24 md:mt-12">
            <h1 className="mb-2 text-2xl font-medium">{t('Popular People')}</h1>
            <p className="main-container text-muted-foreground">{t('Explore the most popular people in the entertainment industry. From award-winning actors to visionary directors, discover the faces behind your favorite movies and TV shows.')}</p>
          </div>
          {loading ? (
            <div className="text-center py-12">{t('Loading...')}</div>
          ) : (
            <div className="grid-list grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {people.map(person => (
                <a className="w-full" key={person.id} href={`/person/${person.id}`}>
                  <div className="relative aspect-poster">
                    {person.profile_path ? (
                      <img
                        alt={person.name}
                        loading="lazy"
                        className="size-full rounded-md border bg-muted object-cover"
                        src={`//wsrv.nl/?url=${TMDB_IMAGE_BASE}${person.profile_path}&w=320&h=480&sharp=1&output=webp`}
                        style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0, right: 0, bottom: 0, color: 'transparent' }}
                      />
                    ) : (
                      <div className="size-full rounded-md border bg-muted text-muted-foreground grid place-items-center">
                        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 32 32" className="size-12" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M 16 3.03125 L 15.28125 3.75 L 13.09375 5.96875 L 10.90625 6.65625 L 10 6.9375 L 10.21875 7.84375 L 11.40625 12.65625 L 9.6875 11.46875 L 9 11 L 6.78125 13.21875 L 3.84375 14.53125 L 2.96875 14.9375 L 3.3125 15.8125 L 4.4375 18.65625 L 4.125 21.03125 L 4 22.03125 L 11 22.90625 L 11 25 L 15 25 L 15 29 L 17 29 L 17 25 L 21 25 L 21 22.90625 L 28 22.03125 L 27.875 21.03125 L 27.5625 18.65625 L 28.6875 15.8125 L 29.03125 14.9375 L 28.15625 14.53125 L 25.21875 13.21875 L 23 11 L 22.3125 11.46875 L 20.59375 12.65625 L 21.78125 7.84375 L 22 6.9375 L 21.09375 6.65625 L 18.90625 5.96875 L 16.71875 3.75 Z M 16 5.875 L 17.875 7.75 L 18.09375 7.8125 L 19.625 8.28125 L 18.03125 14.75 L 17.40625 17.34375 L 19.5625 15.8125 L 22.75 13.59375 L 23.90625 14.78125 L 24.0625 14.90625 L 24.21875 15 L 26.46875 16 L 25.625 18.15625 L 25.53125 18.40625 L 25.5625 18.65625 L 25.75 20.28125 L 19.875 21 L 19 21.125 L 19 23 L 13 23 L 13 21.125 L 12.125 21 L 6.25 20.28125 L 6.4375 18.65625 L 6.46875 18.40625 L 6.375 18.15625 L 5.53125 16 L 7.78125 15 L 7.9375 14.90625 L 8.09375 14.78125 L 9.25 13.59375 L 12.4375 15.8125 L 14.59375 17.34375 L 13.96875 14.75 L 12.375 8.28125 L 13.90625 7.8125 L 14.125 7.75 Z"></path></svg>
                      </div>
                    )}
                    <div className="overlay">
                      <div className="p-2 md:p-4">
                        <h2 className="line-clamp-1 text-sm font-medium md:text-lg mt-2">{person.name}</h2>
                        <p className="line-clamp-3 text-xs text-muted-foreground md:text-base">{t('Known for')} {/* --> */}{person.known_for_department || getKnownFor(person.known_for) || 'Acting'}</p>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
          {/* Pagination */}
          <nav role="navigation" aria-label="pagination" className="mx-auto flex w-full justify-center mt-8">
            <ul className="flex flex-row items-center gap-1">
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => (
                <li key={i}>
                  <a
                    aria-current={page === i + 1 ? 'page' : undefined}
                    className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10 ${page === i + 1 ? '' : ''}`}
                    href={`/person/popular?page=${i + 1}`}
                    onClick={e => {
                      e.preventDefault();
                      setSearchParams({ page: (i + 1).toString() });
                    }}
                  >
                    {i + 1}
                  </a>
                </li>
              ))}
              {totalPages > 3 && (
                <span aria-hidden="true" className="size-9 items-center justify-center hidden md:flex">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-ellipsis size-4"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                  <span className="sr-only">{t('More pages')}</span>
                </span>
              )}
              {totalPages > 1 && (
                <li>
                  <a
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10"
                    href={`/person/popular?page=${page + 1}`}
                    aria-label="Go to next page"
                    rel="next"
                    onClick={e => {
                      e.preventDefault();
                      setSearchParams({ page: (page + 1).toString() });
                    }}
                  >
                    <span>{t('Next')}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right size-4"><path d="m9 18 6-6-6-6"></path></svg>
                  </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </main>
      <Footer />
    </div>
  );
}
