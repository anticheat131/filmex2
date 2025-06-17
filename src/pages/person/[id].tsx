import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getPersonDetails, getPersonCombinedCredits, getPersonImages } from '../../utils/services/tmdb';

const getHeroImage = (credits, images, person, id) => {
  let creditWithBackdrop = credits?.cast?.find(c => c.backdrop_path);
  if (creditWithBackdrop) {
    return {
      src: `//wsrv.nl/?url=https://image.tmdb.org/t/p/original${creditWithBackdrop.backdrop_path}&w=1368&h=726&sharp=1&output=webp`,
      label: `An image from ${creditWithBackdrop.title || creditWithBackdrop.name}, one of the productions that also features ${person.name}.`,
    };
  }
  let creditWithPoster = credits?.cast?.find(c => c.poster_path);
  if (creditWithPoster) {
    return {
      src: `//wsrv.nl/?url=https://image.tmdb.org/t/p/original${creditWithPoster.poster_path}&w=1368&h=726&sharp=1&output=webp`,
      label: `A poster from ${creditWithPoster.title || creditWithPoster.name}, one of the productions that also features ${person.name}.`,
    };
  }
  const localLandscape = `/images/person-${id}-cover.jpg`;
  return {
    src: localLandscape,
    label: '',
  };
};

const PersonDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [person, setPerson] = useState(null);
  const [credits, setCredits] = useState(null);
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('known');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getPersonDetails(id),
      getPersonCombinedCredits(id),
      getPersonImages(id),
    ]).then(([person, credits, images]) => {
      setPerson(person);
      setCredits(credits);
      setImages(images);
      setLoading(false);
    });
  }, [id]);

  if (loading || !person) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg">Loading...</span>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const heroImage = getHeroImage(credits, images, person, id);
  const profileImg = person.profile_path
    ? `https://image.tmdb.org/t/p/w780${person.profile_path}`
    : images?.profiles?.[0]?.file_path
    ? `https://image.tmdb.org/t/p/w780${images.profiles[0].file_path}`
    : '';

  const personalInfo = [
    { label: t('Known For'), value: t(person.known_for_department) },
    { label: t('Known Credits'), value: credits?.cast?.length || 0 },
    { label: t('Gender'), value: person.gender === 2 ? t('Male') : person.gender === 1 ? t('Female') : t('Other') },
    { label: t('Birthday'), value: formatDate(person.birthday) },
    { label: t('Place of Birth'), value: person.place_of_birth },
    { label: t('Also Known As'), value: person.also_known_as?.join(', ') },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Hero Banner */}
      <div className="w-full relative aspect-[16/6] bg-zinc-900 overflow-hidden rounded-b-2xl shadow-lg">
        {heroImage.src && (
          <img
            alt={person.name}
            className="absolute inset-0 w-full h-full object-cover object-top"
            src={heroImage.src}
            style={{ zIndex: 1 }}
          />
        )}
        {heroImage.label && (
          <div className="absolute right-6 top-6 z-10 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold bg-secondary text-secondary-foreground shadow-md">
            {heroImage.label}
          </div>
        )}
      </div>
      {/* Main Content */}
      <div className="container xl:px-32 mt-0 md:-mt-36 xl:-mt-44 relative z-10 flex flex-col gap-10 xl:gap-20">
        <div className="flex flex-col md:flex-row gap-10 items-start mt-32">
          {/* Left: Profile image and personal info */}
          <div className="flex flex-col items-center md:items-start w-full md:w-80 xl:w-96 flex-shrink-0">
            {profileImg && (
              <div className="relative w-56 h-56 xl:w-64 xl:h-64 rounded-full border-4 border-background shadow-2xl bg-background overflow-hidden -mt-36 md:-mt-44 xl:-mt-60 z-20 mb-6" style={{ left: '-25%' }}>
                <img
                  alt={person.name}
                  className="w-full h-full object-cover rounded-full"
                  src={profileImg}
                />
              </div>
            )}
            {/* Personal Info below profile image, even more left and more down */}
            <aside className="w-full rounded-2xl p-6 shadow-xl border mt-20 ml-[-48px] md:ml-[-64px] xl:ml-[-96px]">
              <h2 className="text-lg font-semibold mb-4">{t('Personal Info')}</h2>
              <ul className="space-y-3">
                {personalInfo.map(
                  (item, idx) => item.value && (
                    <li key={idx} className="flex flex-col text-sm">
                      <span className="font-medium text-muted-foreground">{item.label}</span>
                      <span>{item.value}</span>
                    </li>
                  )
                )}
              </ul>
            </aside>
          </div>
          {/* Right: Description/info, pulled down 25% */}
          <div className="flex-1 flex flex-col justify-center rounded-2xl p-10 shadow-xl min-h-[340px] mt-32">
            <h1 className="text-4xl font-bold xl:text-5xl mb-4 leading-tight text-foreground">{person.name}</h1>
            <div className="mb-4 text-muted-foreground text-lg font-medium">
              {formatDate(person.birthday)}{person.place_of_birth ? ` — ${person.place_of_birth}` : ''}
            </div>
            <div className="prose prose-neutral max-w-none text-foreground text-lg leading-relaxed relative">
              <p className={`whitespace-pre-line ${showFullBio ? '' : 'line-clamp-6 max-h-48 overflow-hidden'}`}>{person.biography}</p>
              {!showFullBio && person.biography && person.biography.length > 600 && (
                <>
                  <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                  <button
                    className="absolute bottom-2 right-4 z-10 px-4 py-1 rounded bg-background/80 text-primary font-medium shadow hover:bg-background"
                    onClick={() => setShowFullBio(true)}
                  >
                    {t('Show more')}
                  </button>
                </>
              )}
              {showFullBio && person.biography && person.biography.length > 600 && (
                <button
                  className="mt-2 px-4 py-1 rounded bg-background/80 text-primary font-medium shadow hover:bg-background"
                  onClick={() => setShowFullBio(false)}
                >
                  {t('Show less')}
                </button>
              )}
            </div>
          </div>
        </div>
        {/* Tab Bar and Content (tab bar hard left, cards 40% smaller) */}
        <div className="flex flex-col mt-8">
          {/* Tab Bar - hard left aligned */}
          <div dir="ltr" data-orientation="horizontal">
            <div
              role="tablist"
              aria-orientation="horizontal"
              className="inline-flex items-center rounded-md bg-muted p-1 text-muted-foreground sm:h-10 mb-4"
              tabIndex={0}
              data-orientation="horizontal"
              style={{ outline: 'none', justifyContent: 'flex-start', width: 'auto', minWidth: 0, maxWidth: 'fit-content', marginLeft: 0 }}
            >
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'known'}
                aria-controls="radix-person-content-known"
                data-state={tab === 'known' ? 'active' : 'inactive'}
                id="radix-person-trigger-known"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                tabIndex={-1}
                data-orientation="horizontal"
                data-radix-collection-item=""
                onClick={() => setTab('known')}
              >
                {t('Known for')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'credits'}
                aria-controls="radix-person-content-credits"
                data-state={tab === 'credits' ? 'active' : 'inactive'}
                id="radix-person-trigger-credits"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                tabIndex={-1}
                data-orientation="horizontal"
                data-radix-collection-item=""
                onClick={() => setTab('credits')}
              >
                {t('Credits')}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'images'}
                aria-controls="radix-person-content-images"
                data-state={tab === 'images' ? 'active' : 'inactive'}
                id="radix-person-trigger-images"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                tabIndex={-1}
                data-orientation="horizontal"
                data-radix-collection-item=""
                onClick={() => setTab('images')}
              >
                {t('Images')}
              </button>
            </div>
            {/* Tab Panels */}
            <div
              data-state={tab === 'known' ? 'active' : 'inactive'}
              data-orientation="horizontal"
              role="tabpanel"
              aria-labelledby="radix-person-trigger-known"
              id="radix-person-content-known"
              tabIndex={0}
              className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{ animationDuration: '0s', display: tab === 'known' ? undefined : 'none' }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                {credits?.cast?.map((item) => (
                  <div key={item.id} className="aspect-poster group relative" style={{ aspectRatio: '2/3', height: '432px', minHeight: '432px', maxHeight: '432px' }}>
                    <img
                      alt={item.title || item.name}
                      loading="lazy"
                      decoding="async"
                      data-nimg="fill"
                      className="size-full rounded-md border bg-muted object-cover"
                      style={{ position: 'absolute', height: '100%', width: '100%', left: 0, top: 0, right: 0, bottom: 0, color: 'transparent' }}
                      src={item.poster_path ? `//wsrv.nl/?url=https://image.tmdb.org/t/p/w500/${item.poster_path}&w=320&h=576&sharp=1&output=webp` : '/placeholder.svg'}
                    />
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center space-y-2 opacity-100 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100">
                      <a className="hidden min-w-24 items-center justify-between rounded-lg bg-white/80 px-4 py-2 text-black transition-all hover:bg-red-200 hover:text-black md:flex md:bg-white/60" href={`/${item.media_type === 'tv' ? 'tv' : 'movie'}/${item.id}-${(item.title || item.name || '').toLowerCase().replace(/\s+/g, '-')}`}>{t('Details')} <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="ml-2 size-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M13 5h8"></path><path d="M13 9h5"></path><path d="M13 15h8"></path><path d="M13 19h5"></path><path d="M3 4m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path><path d="M3 14m0 1a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"></path></svg></a>
                      <a className="flex min-w-24 items-center justify-between rounded-lg bg-black/80 px-4 py-2 text-white transition-all hover:bg-red-200 hover:text-black md:bg-black/60" href={`/watch/${item.media_type === 'tv' ? 'tv' : 'movie'}/${item.season_number || 1}-${item.episode_number || 1}/${item.id}-${(item.title || item.name || '').toLowerCase().replace(/\s+/g, '-')}`}>{t('Watch')} <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" className="ml-2 size-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M133 440a35.37 35.37 0 0 1-17.5-4.67c-12-6.8-19.46-20-19.46-34.33V111c0-14.37 7.46-27.53 19.46-34.33a35.13 35.13 0 0 1 35.77.45l247.85 148.36a36 36 0 0 1 0 61l-247.89 148.4A35.5 35.5 0 0 1 133 440z"></path></svg></a>
                    </div>
                    <button className="absolute right-2 top-2 z-10 rounded-full p-2 text-white" title={t('Add to Favorites')}>
                      <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" className="size-6" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"></path></svg>
                    </button>
                    <div className="overlay">
                      <div className="p-2 md:p-4">
                        <button data-state="closed">
                          <div className="rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80 flex items-center gap-1 mb-2">{item.vote_average?.toFixed(1) ?? ''}</div>
                        </button>
                        <h2 className="line-clamp-1 text-sm font-medium md:text-lg">{item.title || item.name}</h2>
                        <p className="line-clamp-3 text-xs text-muted-foreground md:text-base">{(item.release_date || item.first_air_date || '').slice(0, 4)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div
              data-state={tab === 'credits' ? 'active' : 'inactive'}
              data-orientation="horizontal"
              role="tabpanel"
              aria-labelledby="radix-person-trigger-credits"
              id="radix-person-content-credits"
              tabIndex={0}
              className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{ animationDuration: '0s', display: tab === 'credits' ? undefined : 'none' }}
            >
              <div className="space-y-8">
                <div tabIndex={-1} className="flex size-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-medium">{t('Acting')}</h2>
                      <div className="flex items-center gap-4">
                        <div className="rounded-md border-x border-t">
                          <div className="flex items-center border-b px-3">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search mr-2 size-4 shrink-0 opacity-50"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                            <input
                              className="flex rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 h-10 w-40"
                              placeholder={t('Search...')}
                              autoComplete="off"
                              autoCorrect="off"
                              spellCheck={false}
                              aria-autocomplete="list"
                              role="combobox"
                              aria-expanded="true"
                              type="text"
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                        <select
                          className="flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-40"
                          value={filterType}
                          onChange={e => setFilterType(e.target.value)}
                        >
                          <option value="all">{t('All')}</option>
                          <option value="movie">{t('Movies')}</option>
                          <option value="tv">{t('TvShow')}</option>
                        </select>
                      </div>
                    </div>
                    <div className="overflow-y-auto overflow-x-hidden max-h-full">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm">
                          <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-12"></th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-24">{t('Year')}</th>
                              <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground w-full align-bottom">{t('Details')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {credits?.cast
                              ?.filter(item =>
                                (filterType === 'all' || item.media_type === filterType) &&
                                (!searchTerm || (item.title || item.name || '').toLowerCase().includes(searchTerm.toLowerCase()))
                              )
                              .map((item) => (
                                <tr key={item.credit_id} className="border-b transition-colors hover:bg-muted/50">
                                  <td className="p-4 align-middle text-center font-medium">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clapperboard inline-block size-4"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"></path><path d="m6.2 5.3 3.1 3.9"></path><path d="m12.4 3.4 3.1 4"></path><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path></svg>
                                  </td>
                                  <td className="p-4 align-middle">{(item.release_date || item.first_air_date || '').slice(0, 4) || '-'}</td>
                                  <td className="p-4 align-top">
                                    <div className="flex flex-col items-start">
                                      <a className="font-medium" href={`/${item.media_type === 'tv' ? 'tv' : 'movie'}/${item.id}-${(item.title || item.name || '').toLowerCase().replace(/\s+/g, '-')}`}>{item.title || item.name}</a>
                                      <p className="text-muted-foreground">as {item.character}</p>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              data-state={tab === 'images' ? 'active' : 'inactive'}
              data-orientation="horizontal"
              role="tabpanel"
              aria-labelledby="radix-person-trigger-images"
              id="radix-person-content-images"
              tabIndex={0}
              className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{ animationDuration: '0s', display: tab === 'images' ? undefined : 'none' }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                {images?.profiles?.map((img, idx) => (
                  <img
                    key={idx}
                    alt={person.name}
                    className="rounded-md border bg-muted object-cover w-full h-auto"
                    src={`https://image.tmdb.org/t/p/w500${img.file_path}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PersonDetailPage;
