import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react'; // Using lucide-react's Play icon for play button
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
    .replace(/[^a-z0-9 ]/g, '') // remove special chars
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

  // Modern styled season dropdown
  const renderSeasonDropdown = () => (
    <select
      value={selectedSeason ?? ''}
      onChange={(e) => setSelectedSeason(Number(e.target.value))}
      className="bg-background border border-white/20 rounded-md text-white px-4 py-2 max-w-[160px] appearance-none cursor-pointer relative pr-8"
      aria-label="Select Season"
      style={{
        backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='white' height='16' viewBox='0 0 24 24' width='16' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1rem',
      }}
    >
      {Array.isArray(tvShow.seasons) && tvShow.seasons.length > 0 ? (
        tvShow.seasons.map((season) => (
          <option key={season.id} value={season.season_number}>
            {season.name || `Season ${season.season_number}`}
          </option>
        ))
      ) : (
        <option>No seasons available</option>
      )}
    </select>
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
            <div className="mb-4 flex justify-start">{renderSeasonDropdown()}</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
              {episodes?.map((ep) => {
                const episodeTitle = ep.name || `Episode ${ep.episode_number}`;
                const description = ep.overview?.trim()
                  ? ep.overview
                  : episodeTitle;

                return (
                  <div
                    key={ep.id}
                    className="bg-gray-900 rounded-md p-3 flex flex-col cursor-pointer hover:bg-accent/80 transition"
                    onClick={() =>
                      handlePlayEpisode(
                        selectedSeason!,
                        ep.episode_number
                      )
                    }
                    title={`${episodeTitle} - ${description}`}
                  >
                    {/* Episode image or placeholder */}
                    {ep.still_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                        alt={episodeTitle}
                        className="rounded-md mb-2 object-cover w-full h-40"
                      />
                    ) : (
                      <div className="rounded-md mb-2 w-full h-40 bg-gray-700 flex items-center justify-center text-gray-400 text-sm select-none">
                        No photo available
                      </div>
                    )}

                    <div className="flex justify-between items-center mb-1">
                      <p
                        className="text-white font-semibold truncate max-w-[70%]"
                        title={episodeTitle}
                      >
                        Ep {ep.episode_number}: {episodeTitle}
                      </p>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayEpisode(
                            selectedSeason!,
                            ep.episode_number
                          );
                        }}
                        aria-label={`Play Episode ${ep.episode_number}`}
                        className="text-accent hover:text-accent-light transition"
>
<Play size={20} />
</button>
</div>
                {description && (
                  <p className="text-sm text-white/70 line-clamp-3">
                    {description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </>
    )}

    {activeTab === 'about' && <TVShowAbout tvShow={tvShow} />}

    {activeTab === 'cast' && <TVShowCast cast={cast} />}

    {activeTab === 'reviews' && (
      <ReviewSection
        mediaType="tv"
        mediaId={tvShow.id}
        recommendations={recommendations}
      />
    )}
  </div>

  <ContentRow
    title="Recommended TV Shows"
    media={recommendations}
  />
</div>
);
};

export default TVDetailsPage;
