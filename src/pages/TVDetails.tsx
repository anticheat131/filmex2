import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContentRow from '@/components/ContentRow';
import Navbar from '@/components/Navbar';
import ReviewSection from '@/components/ReviewSection';
import TVShowHeader from '@/components/tv/TVShowHeader';
import TVShowEpisodes from '@/components/tv/TVShowEpisodes'; // You can keep this or remove if not needed anymore
import TVShowAbout from '@/components/tv/TVShowAbout';
import TVShowCast from '@/components/tv/TVShowCast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTVDetails } from '@/hooks/use-tv-details';
import React from 'react';

const TVDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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

  // Filter episodes for selected season only
  const episodesForSelectedSeason = episodes.filter(
    (ep) => ep.season_number === selectedSeason
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
          <div>
            {/* Season dropdown */}
            <label
              htmlFor="season-select"
              className="text-white mb-2 block font-semibold"
            >
              Select Season
            </label>
            <select
              id="season-select"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(parseInt(e.target.value, 10))}
              className="mb-6 p-2 rounded bg-gray-800 text-white w-full max-w-xs"
            >
              {tvShow.seasons.map((season) => (
                <option key={season.id} value={season.season_number}>
                  {season.name || `Season ${season.season_number}`}
                </option>
              ))}
            </select>

            {/* Episodes list for selected season */}
            <div className="space-y-4">
              {episodesForSelectedSeason.length === 0 && (
                <p className="text-white/70">
                  No episodes available for this season.
                </p>
              )}

              {episodesForSelectedSeason.map((episode) => (
                <div
                  key={episode.id}
                  className="cursor-pointer p-4 bg-gray-900 rounded hover:bg-gray-800 transition"
                  onClick={() => handlePlayEpisode(episode)}
                >
                  <div className="flex items-center space-x-4">
                    {episode.still_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w154${episode.still_path}`}
                        alt={episode.name}
                        className="w-32 rounded"
                      />
                    ) : (
                      <div className="w-32 h-18 bg-gray-700 rounded flex items-center justify-center text-gray-400">
                        No Image
                      </div>
                    )}
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        Episode {episode.episode_number}: {episode.name}
                      </h3>
                      <p className="text-white/70 mt-1">{episode.air_date}</p>
                      <p className="text-white/60 mt-2 line-clamp-3">
                        {episode.overview}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
