import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ContentRow from '@/components/ContentRow';
import Navbar from '@/components/Navbar';
import ReviewSection from '@/components/ReviewSection';
import TVShowHeader from '@/components/tv/TVShowHeader';
import TVShowAbout from '@/components/tv/TVShowAbout';
import TVShowCast from '@/components/tv/TVShowCast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTVDetails } from '@/hooks/use-tv-details';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function generateTVShowSlugURL(id: number | string, name?: string, year?: string | number) {
  if (!name) return `/tv/${id}`;
  const slug = name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim().replace(/\s+/g, '-');
  return year ? `/tv/${id}-${slug}-${year}` : `/tv/${id}-${slug}`;
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
      const year = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : undefined;
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

  if (error || !tvShow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl text-white mb-4">{error || 'TV Show not found'}</h1>
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
          {['episodes', 'about', 'cast', 'reviews'].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 font-medium whitespace-nowrap ${
                activeTab === tab
                  ? 'text-white border-b-2 border-accent'
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'episodes' && (
          <>
            <div className="mb-4">
              <Label className="text-white mb-2 block text-lg font-semibold">Season</Label>
              <Select
                value={selectedSeason?.season_number?.toString()}
                onValueChange={(value) =>
                  setSelectedSeason(tvShow.seasons?.find((s) => s.season_number.toString() === value)!)
                }
              >
                <SelectTrigger className="w-[200px] bg-white/10 text-white border-none focus:ring-0 focus:outline-none">
                  <SelectValue placeholder="Select Season" />
                </SelectTrigger>
                <SelectContent>
                  {tvShow.seasons?.map((season) => (
                    <SelectItem key={season.id} value={season.season_number.toString()}>
                      {season.name || `Season ${season.season_number}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {episodes?.map((ep) => (
                <div key={ep.id} className="flex bg-white/5 rounded-xl overflow-hidden shadow-md">
                  <img
                    src={
                      ep.still_path
                        ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                        : '/placeholder.jpg'
                    }
                    alt={ep.name}
                    className="w-40 h-auto object-cover"
                  />
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        Episode {ep.episode_number}: {ep.name}
                      </h3>
                      {ep.overview && (
                        <p className="text-sm text-white/70 mt-1 line-clamp-3">{ep.overview}</p>
                      )}
                    </div>
                    <Button
                      className="mt-3 w-fit px-3 py-1 text-sm"
                      onClick={() => handlePlayEpisode(ep)}
                    >
                      <Play className="w-4 h-4 mr-1" /> Play
                    </Button>
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
