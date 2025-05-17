import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import ContentRow from '@/components/ContentRow';
import Navbar from '@/components/Navbar';
import ReviewSection from '@/components/ReviewSection';
import TVShowHeader from '@/components/tv/TVShowHeader';
import TVShowAbout from '@/components/tv/TVShowAbout';
import TVShowCast from '@/components/tv/TVShowCast';

import { useIsMobile } from '@/hooks/use-mobile';
import { useTVDetails } from '@/hooks/use-tv-details';

function generateTVShowSlugURL(
  id: number | string,
  name?: string,
  year?: string | number
) {
  if (!name) return `/tv/${id}`;

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  if (year) {
    return `/tv/${id}-${slug}-${year}`;
  }

  return `/tv/${id}-${slug}`;
}

const TVDetailsPage = () => {
  const { id: rawId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const id = rawId?.split('-')[0];

  const {
    tvShow,
    episodes,
    selectedSeason,
    setSelectedSeason,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    recommendations,
    cast,
    trailerKey,
    isFavorite,
    isInMyWatchlist,
    handlePlayEpisode,
    handleToggleFavorite,
    handleToggleWatchlist,
    getLastWatchedEpisode,
  } = useTVDetails(id);

  useEffect(() => {
    if (tvShow) {
      const name = tvShow.name || tvShow.original_name || tvShow.title || '';
      const year = tvShow.first_air_date
        ? new Date(tvShow.first_air_date).getFullYear()
        : undefined;

      const expectedUrl = generateTVShowSlugURL(tvShow.id, name, year);

      if (window.location.pathname !== expectedUrl) {
        navigate(expectedUrl, { replace: true });
      }
    }
  }, [tvShow, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse-slow text-white font-medium">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl text-white mb-4">{error}</h1>
        <Button onClick={() => navigate('/')} variant="outline">
          Return to Home
        </Button>
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl text-white mb-4">TV Show not found</h1>
        <Button onClick={() => navigate('/')} variant="outline">
          Return to Home
        </Button>
      </div>
    );
  }

  // Modern play icon CSS as a React component
  const PlayIcon = () => (
    <span
      aria-hidden="true"
      className="block w-5 h-5 ml-0.5"
      style={{
        clipPath: 'polygon(0% 0%, 100% 50%, 0% 100%)',
        backgroundColor: 'currentColor',
      }}
    />
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-6 z-10 text-white p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {!isMobile && trailerKey && (
          <div className="absolute inset-0 bg-black/60">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Trailer"
            />
          </div>
        )}

        <TVShowHeader
          tvShow={tvShow}
          isFavorite={isFavorite}
          isInWatchlist={isInMyWatchlist}
          onToggleFavorite={handleToggleFavorite}
          onToggleWatchlist={handleToggleWatchlist}
          onPlayEpisode={handlePlayEpisode}
          lastWatchedEpisode={getLastWatchedEpisode()}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex border-b border-white/10 mb-6 overflow-x-auto pb-1 hide-scrollbar">
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${
              activeTab === 'episodes'
                ? 'text-white border-b-2 border-accent'
                : 'text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveTab('episodes')}
          >
            Episodes
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${
              activeTab === 'about'
                ? 'text-white border-b-2 border-accent'
                : 'text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${
              activeTab === 'cast'
                ? 'text-white border-b-2 border-accent'
                : 'text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveTab('cast')}
          >
            Cast
          </button>
          <button
            className={`py-2 px-4 font-medium whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'text-white border-b-2 border-accent'
                : 'text-white/60 hover:text-white'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        {activeTab === 'episodes' && (
          <>
            {/* Modernized season dropdown */}
            <div className="mb-6 max-w-xs relative">
              <label
                htmlFor="season-select"
                className="block mb-2 text-white font-semibold"
              >
                Select Season
              </label>
              <select
                id="season-select"
                className="appearance-none w-full bg-gray-900 text-white rounded-md p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
              />
              <svg
                className="pointer-events-none absolute top-11 right-3 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              {(tvShow.seasons ?? []).map((season) => (
                <option key={season.id} value={season.season_number}>
                  {season.name ?? `Season ${season.season_number}`}
                </option>
              ))}
            </div>

            {/* Episodes list */}
            <div className="space-y-4 max-w-4xl">
              {(episodes ?? []).map((episode) => (
                <div
                  key={episode.id}
                  className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition"
                  onClick={() => handlePlayEpisode(episode)}
                  title={episode.name}
                >
                  {/* Episode thumbnail or placeholder text */}
                  {episode.still_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${episode.still_path}`}
                      alt={episode.name}
                      className="w-24 h-14 rounded-md object-cover flex-shrink-0"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-24 h-14 rounded-md bg-gray-700 flex items-center justify-center text-gray-400 text-xs font-semibold select-none">
                      No Photo
                    </div>
                  )}

                  {/* Episode info */}
                  <div className="flex flex-col flex-grow overflow-hidden">
                    <h3 className="text-white font-semibold truncate">
                      {`Episode ${episode.episode_number}: ${episode.name}`}
                    </h3>
                    <p className="text-sm text-gray-300 truncate">
                      {episode.overview || 'No description available.'}
                    </p>
                  </div>

                  {/* Duration and Play button */}
                  <div className="flex flex-col items-end justify-between">
                    {episode.runtime && (
                      <span className="text-xs text-gray-400">
                        {episode.runtime} min
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayEpisode(episode);
                      }}
                      className="text-accent hover:text-accent-light p-1 rounded-full transition-colors"
                      aria-label={`Play ${episode.name}`}
                    >
                      <PlayIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'about' && <TVShowAbout tvShow={tvShow} />}

        {activeTab === 'cast' && <TVShowCast cast={cast} />}

        {activeTab === 'reviews' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">User Reviews</h2>
            <ReviewSection mediaId={parseInt(id!, 10)} mediaType="tv" />
          </div>
        )}
      </div>

      {recommendations.length > 0 && (
        <ContentRow title="More Like This" media={recommendations} />
      )}
    </div>
  );
};

export default TVDetailsPage;
