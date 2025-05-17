import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getMovieDetails, 
  getMovieRecommendations, 
  getMovieTrailer, 
  backdropSizes, 
  posterSizes, 
  getMovieCast 
} from '@/utils/api';
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
          setIsLoading(false);
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
              title="Movie Trailer"
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
                    src={getImageUrl(movie.logo_path, backdropSizes.original)}
                   
alt={${movie.title} logo}
className={w-full object-contain rounded-lg ${ logoLoaded ? 'opacity-100' : 'opacity-0' }}
onLoad={() => setLogoLoaded(true)}
draggable={false}
/>
</div>
) : (
<h1 className="text-3xl font-bold text-white mb-3">{movie.title}</h1>
)}
          {/* Basic info */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-white text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{movie.runtime ? formatRuntime(movie.runtime) : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{movie.release_date || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres?.slice(0, 3).map((genre) => (
              <span
                key={genre.id}
                className="bg-primary/50 text-primary rounded-full px-3 py-1 text-xs font-semibold"
              >
                {genre.name}
              </span>
            ))}
          </div>

          {/* Overview */}
          <p className="text-gray-300 mb-6 max-w-3xl">{movie.overview}</p>

          {/* Action buttons */}
          <div className="flex gap-4 flex-wrap">
            <Button onClick={handlePlayMovie} size="lg" className="flex items-center gap-2">
              <Play className="h-5 w-5" /> Play
            </Button>
            <Button 
              onClick={handleToggleFavorite} 
              size="lg" 
              variant={isFavorite ? 'destructive' : 'default'} 
              className="flex items-center gap-2"
            >
              <Heart className="h-5 w-5" /> {isFavorite ? 'Remove Favorite' : 'Add Favorite'}
            </Button>
            <Button 
              onClick={handleToggleWatchlist} 
              size="lg" 
              variant={isInMyWatchlist ? 'destructive' : 'default'} 
              className="flex items-center gap-2"
            >
              <Bookmark className="h-5 w-5" /> {isInMyWatchlist ? 'Remove Watchlist' : 'Add Watchlist'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Tabs: About, Reviews, Cast */}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
    <nav className="flex border-b border-gray-700">
      <button
        onClick={() => setActiveTab('about')}
        className={`py-3 px-6 text-sm font-medium text-white ${
          activeTab === 'about' ? 'border-b-2 border-primary' : 'border-b-2 border-transparent hover:border-gray-600'
        }`}
      >
        About
      </button>
      <button
        onClick={() => setActiveTab('reviews')}
        className={`py-3 px-6 text-sm font-medium text-white ${
          activeTab === 'reviews' ? 'border-b-2 border-primary' : 'border-b-2 border-transparent hover:border-gray-600'
        }`}
      >
        Reviews
      </button>
      <button
        onClick={() => setActiveTab('cast')}
        className={`py-3 px-6 text-sm font-medium text-white ${
          activeTab === 'cast' ? 'border-b-2 border-primary' : 'border-b-2 border-transparent hover:border-gray-600'
        }`}
      >
        Cast
      </button>
    </nav>

    <div className="py-8">
      {activeTab === 'about' && (
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Overview</h2>
          <p className="text-gray-300 max-w-4xl">{movie.overview}</p>
        </section>
      )}

      {activeTab === 'reviews' && (
        <ReviewSection mediaId={movie.id} mediaType="movie" />
      )}

      {activeTab === 'cast' && (
        <section>
          <h2 className="text-2xl font-semibold text-white mb-6">Cast</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {cast.map((member) => (
              <div key={member.cast_id} className="flex flex-col items-center text-center">
                <img
                  src={getImageUrl(member.profile_path, posterSizes.small)}
                  alt={member.name}
                  className="w-24 h-32 rounded-lg object-cover mb-2"
                  loading="lazy"
                />
                <p className="text-white font-semibold text-sm">{member.name}</p>
                <p className="text-gray-400 text-xs">{member.character}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>

    {/* Recommendations */}
    {recommendations.length > 0 && (
      <ContentRow
        title="Recommended Movies"
        items={recommendations}
        mediaType="movie"
      />
    )}
  </div>
</div>
);
};

export default MovieDetailsPage;
