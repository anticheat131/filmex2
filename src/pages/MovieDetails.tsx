import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getMovieRecommendations, getMovieTrailer, backdropSizes, posterSizes, getMovieCast } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { MovieDetails, Media, CastMember } from '@/utils/types';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import ContentRow from '@/components/ContentRow';
import ReviewSection from '@/components/ReviewSection';
import { Play, Clock, Calendar, Star, ArrowLeft, Shield, Heart, Bookmark } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWatchHistory } from '@/hooks/watch-history';

const MovieDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backdropLoaded, setBackdropLoaded] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'reviews' | 'cast'>('about');
  const [recommendations, setRecommendations] = useState<Media[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const { 
    addToFavorites, 
    addToWatchlist,
    removeFromFavorites,
    removeFromWatchlist,
    isInFavorites,
    isInWatchlist 
  } = useWatchHistory();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInMyWatchlist, setIsInMyWatchlist] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) {
        setError("Movie ID is required");
        setIsLoading(false);
        return;
      }

      const movieId = parseInt(id, 10);
      if (isNaN(movieId)) {
        setError("Invalid movie ID");
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        const [movieData, recommendationsData, castData] = await Promise.all([
          getMovieDetails(movieId),
          getMovieRecommendations(movieId),
          getMovieCast(movieId),
        ]);
        
        if (!movieData) {
          setError("Movie not found");
          return;
        }
        
        setMovie(movieData);
        setRecommendations(recommendationsData);
        setCast(castData);
      } catch (error) {
        console.error('Error fetching movie data:', error);
        setError("Failed to load movie data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMovieData();
  }, [id]);
  
  useEffect(() => {
    const fetchTrailer = async () => {
      if (movie?.id) {
        try {
          const trailerData = await getMovieTrailer(movie.id);
          setTrailerKey(trailerData);
        } catch (error) {
          console.error('Error fetching trailer:', error);
        }
      }
    };
    
    fetchTrailer();
  }, [movie?.id]);

  useEffect(() => {
    if (movie?.id) {
      setIsFavorite(isInFavorites(movie.id, 'movie'));
      setIsInMyWatchlist(isInWatchlist(movie.id, 'movie'));
    }
  }, [movie?.id, isInFavorites, isInWatchlist]);

  const handlePlayMovie = () => {
    if (movie) {
      navigate(`/watch/movie/${movie.id}`);
    }
  };

  const handleToggleFavorite = () => {
    if (!movie) return;
    
    if (isFavorite) {
      removeFromFavorites(movie.id, 'movie');
      setIsFavorite(false);
    } else {
      addToFavorites({
        media_id: movie.id,
        media_type: 'movie',
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        rating: movie.vote_average
      });
      setIsFavorite(true);
    }
  };

  const handleToggleWatchlist = () => {
    if (!movie) return;
    
    if (isInMyWatchlist) {
      removeFromWatchlist(movie.id, 'movie');
      setIsInMyWatchlist(false);
    } else {
      addToWatchlist({
        media_id: movie.id,
        media_type: 'movie',
        title: movie.title,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        overview: movie.overview,
        rating: movie.vote_average
      });
      setIsInMyWatchlist(true);
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
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
  
  if (!movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl text-white mb-4">Movie not found</h1>
        <Button onClick={() => navigate('/')} variant="outline">
          Return to Home
        </Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Backdrop Image */}
      <div className="relative w-full h-[70vh]">
        {/* Loading skeleton */}
        {!backdropLoaded && (
          <div className="absolute inset-0 bg-background image-skeleton" />
        )}
        
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-20 left-6 z-10 text-white p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        
        <img
          src={getImageUrl(movie.backdrop_path, backdropSizes.original)}
          alt={movie.title || 'Movie backdrop'}
          className={`w-full h-full object-cover transition-opacity duration-700 ${
            backdropLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setBackdropLoaded(true)}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 details-gradient" />
        
        {/* Trailer section - only show on desktop */}
        {!isMobile && trailerKey && (
          <div className="absolute inset-0 bg-black/60">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`${movie.title} Trailer`}
            />
          </div>
        )}

        {/* Movie info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
          <div className="flex flex-col md:flex-row items-start gap-6 max-w-6xl mx-auto">
            <div className="hidden md:block flex-shrink-0 w-48 xl:w-64 rounded-lg overflow-hidden shadow-lg">
              <img 
                src={getImageUrl(movie.poster_path, posterSizes.medium)} 
                alt={movie.title || 'Movie poster'} 
                className="w-full h-auto"
              />
            </div>
            
            <div className="flex-1 animate-slide-up">
              {movie.logo_path ? (
                <div className="relative w-full max-w-[300px] md:max-w-[400px] lg:max-w-[500px] mx-auto mb-4 
                              transition-all duration-300 ease-in-out hover:scale-105">
                  {/* Loading skeleton */}
                  {!logoLoaded && (
                    <div className="absolute inset-0 bg-background image-skeleton rounded-lg" />
                  )}
                  
                  <img
                    src={getImageUrl(movie.logo_path,posterSizes.medium)}
alt={${movie.title} logo}
onLoad={() => setLogoLoaded(true)}
className={w-full object-contain transition-opacity duration-500 ${ logoLoaded ? 'opacity-100' : 'opacity-0' }}
/>
</div>
) : (
<h1 className="text-3xl md:text-5xl font-bold text-white mb-2">{movie.title}</h1>
)}
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80 mb-4">
            {movie.release_date && (
              <>
                <Calendar className="w-4 h-4" />
                <span>{new Date(movie.release_date).getFullYear()}</span>
              </>
            )}
            {movie.runtime && (
              <>
                <Clock className="w-4 h-4" />
                <span>{formatRuntime(movie.runtime)}</span>
              </>
            )}
            {movie.vote_average && (
              <>
                <Star className="w-4 h-4" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </>
            )}
          </div>

          <p className="text-white/90 mb-6 line-clamp-4">{movie.overview}</p>
          
          <div className="flex items-center gap-4">
            <Button onClick={handlePlayMovie} variant="primary" size="lg" className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Play
            </Button>
            
            <Button onClick={handleToggleFavorite} variant={isFavorite ? 'destructive' : 'outline'} size="lg">
              {isFavorite ? 'Remove Favorite' : 'Add to Favorite'}
            </Button>

            <Button onClick={handleToggleWatchlist} variant={isInMyWatchlist ? 'destructive' : 'outline'} size="lg">
              {isInMyWatchlist ? 'Remove Watchlist' : 'Add to Watchlist'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Tabs: About, Reviews, Cast */}
  <div className="max-w-6xl mx-auto px-4 py-12">
    <nav className="flex gap-8 border-b border-gray-700 text-white mb-8">
      <button
        onClick={() => setActiveTab('about')}
        className={`pb-2 ${activeTab === 'about' ? 'border-b-2 border-primary text-primary' : 'text-white/70 hover:text-white'}`}
      >
        About
      </button>
      <button
        onClick={() => setActiveTab('reviews')}
        className={`pb-2 ${activeTab === 'reviews' ? 'border-b-2 border-primary text-primary' : 'text-white/70 hover:text-white'}`}
      >
        Reviews
      </button>
      <button
        onClick={() => setActiveTab('cast')}
        className={`pb-2 ${activeTab === 'cast' ? 'border-b-2 border-primary text-primary' : 'text-white/70 hover:text-white'}`}
      >
        Cast
      </button>
    </nav>

    {activeTab === 'about' && (
      <>
        <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
        <p className="text-white/90 mb-8">{movie.overview}</p>

        {movie.genres && movie.genres.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Genres</h3>
            <ul className="flex flex-wrap gap-3">
              {movie.genres.map((genre) => (
                <li
                  key={genre.id}
                  className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm"
                >
                  {genre.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </>
    )}

    {activeTab === 'reviews' && (
      <ReviewSection mediaId={movie.id} mediaType="movie" />
    )}

    {activeTab === 'cast' && (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {cast.map((member) => (
          <div key={member.id} className="bg-background-dark rounded-md p-3 flex flex-col items-center">
            <img
              src={getImageUrl(member.profile_path, posterSizes.small)}
              alt={member.name}
              className="w-24 h-32 object-cover rounded-md mb-2"
            />
            <h4 className="text-white font-semibold text-sm text-center">{member.name}</h4>
            <p className="text-white/70 text-xs text-center">{member.character}</p>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Recommendations */}
  {recommendations.length > 0 && (
    <ContentRow
      title="More Like This"
      items={recommendations}
      mediaType="movie"
      seeAllLink={`/movies`}
    />
  )}
</div>
);
};

export default MovieDetailsPage;
