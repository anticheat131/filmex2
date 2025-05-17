import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContentRow from '@/components/ContentRow';
import Navbar from '@/components/Navbar';
import ReviewSection from '@/components/ReviewSection';
import TVShowHeader from '@/components/tv/TVShowHeader';
import TVShowEpisodes from '@/components/tv/TVShowEpisodes';
import TVShowAbout from '@/components/tv/TVShowAbout';
import TVShowCast from '@/components/tv/TVShowCast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTVDetails } from '@/hooks/use-tv-details';

// Helper to generate slug URL for TV show
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
            <div className="mb-6 w-48">
              <label htmlFor="season-select" className="block mb-2 text-white font-medium">
                Select Season
              </label>
              <select
                id="season-select"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="w-full bg-background border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {(tvShow.seasons ?? []).map((season) => (
                  <option key={season.id} value={season.season_number}>
                    {season.name || `Season ${season.season_number}`}
                  </option>
                ))}
              </select>
            </div>

            <TVShowEpisodes
              seasons={tvShow.seasons ?? []}
              episodes={episodes ?? []}
              selectedSeason={selectedSeason}
              onSeasonChange={setSelectedSeason}
              onPlayEpisode={handlePlayEpisode}
            />
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
