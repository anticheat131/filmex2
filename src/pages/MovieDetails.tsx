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

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
    .replace(/(^-|-$)+/g, '');   // Remove leading/trailing hyphens
};

const MovieDetailsPage = () => {
  // URL param is now expected to be like "123456-the-movie-title-2024"
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
    if (!id) {
      setError("Movie ID is required");
      setIsLoading(false);
      return;
    }

    // Extract movieId from the param before the first hyphen
    const movieIdStr = id.split('-')[0];
    const movieId = parseInt(movieIdStr, 10);
    if (isNaN(movieId)) {
      setError("Invalid movie ID");
      setIsLoading(false);
      return;
    }
    
    const fetchMovieData = async () => {
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
      // Navigate to SEO-friendly watch URL: /watch/movie/{id}-{slug}-{year}
      const slug = slugify(movie.title);
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
      navigate(`/watch/movie/${movie.id}-${slug}-${year}`);
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
        )
        }
        
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
            />
          </div>
        )}

        {/* Movie info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
          <div className="flex flex-col md:flex-row items-start gap-6 max-w-6xl mx-auto">
            <div className="hidden md:block flex-shrink-0 w-48 xl:w-64 rounded-lg overflow-hidden shadow-lgborder border-gray-700">
<img
src={getImageUrl(movie.poster_path, posterSizes.w342)}
alt={movie.title || 'Movie poster'}
className={w-full h-auto object-cover transition-opacity duration-700 ${ logoLoaded ? 'opacity-100' : 'opacity-0' }}
onLoad={() => setLogoLoaded(true)}
/>
</div>
        <div className="flex-1 text-white space-y-3 max-w-3xl">
          <h1 className="text-4xl font-bold tracking-wide">{movie.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{movie.release_date?.slice(0, 4)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatRuntime(movie.runtime)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400" />
              <span>{movie.vote_average.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-sm text-gray-300 max-h-32 overflow-y-auto">{movie.overview}</p>

          <div className="flex space-x-4 mt-4">
            <Button
              variant="default"
              size="lg"
              className="flex items-center space-x-2"
              onClick={handlePlayMovie}
              aria-label="Play movie"
            >
              <Play className="h-5 w-5" />
              <span>Play</span>
            </Button>

            <Button
              variant={isFavorite ? 'destructive' : 'outline'}
              size="lg"
              className="flex items-center space-x-2"
              onClick={handleToggleFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className="h-5 w-5" />
              <span>{isFavorite ? 'Remove Favorite' : 'Favorite'}</span>
            </Button>

            <Button
              variant={isInMyWatchlist ? 'destructive' : 'outline'}
              size="lg"
              className="flex items-center space-x-2"
              onClick={handleToggleWatchlist}
              aria-label={isInMyWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            >
              <Bookmark className="h-5 w-5" />
              <span>{isInMyWatchlist ? 'Remove Watchlist' : 'Watchlist'}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>

  {/* Tabs Section */}
  <div className="max-w-6xl mx-auto p-4 md:p-8 text-white">
    <nav className="flex space-x-6 border-b border-gray-700 mb-6">
      <button
        onClick={() => setActiveTab('about')}
        className={`pb-2 font-semibold ${
          activeTab === 'about' ? 'border-b-2 border-white text-white' : 'text-gray-400'
        }`}
      >
        About
      </button>
      <button
        onClick={() => setActiveTab('cast')}
        className={`pb-2 font-semibold ${
          activeTab === 'cast' ? 'border-b-2 border-white text-white' : 'text-gray-400'
        }`}
      >
        Cast
      </button>
      <button
        onClick={() => setActiveTab('reviews')}
        className={`pb-2 font-semibold ${
          activeTab === 'reviews' ? 'border-b-2 border-white text-white' : 'text-gray-400'
        }`}
      >
        Reviews
      </button>
    </nav>

    {activeTab === 'about' && (
      <div>
        <h2 className="text-2xl font-semibold mb-2">Overview</h2>
        <p className="text-gray-300">{movie.overview || 'No overview available.'}</p>
        {/* Additional info can go here */}
      </div>
    )}

    {activeTab === 'cast' && (
      <div>
        <h2 className="text-2xl font-semibold mb-4">Cast</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {cast.map((member) => (
            <div key={member.id} className="text-center">
              <img
                src={getImageUrl(member.profile_path, posterSizes.w154)}
                alt={member.name}
                className="rounded-md w-full h-auto"
                loading="lazy"
              />
              <p className="text-sm mt-2">{member.name}</p>
              <p className="text-xs text-gray-400">{member.character}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {activeTab === 'reviews' && (
      <ReviewSection mediaId={movie.id} mediaType="movie" />
    )}

    {/* Recommendations */}
    <ContentRow
      title="Recommended Movies"
      items={recommendations}
      mediaType="movie"
      onItemClick={(item) => {
        const slug = slugify(item.title);
        const year = item.release_date ? new Date(item.release_date).getFullYear() : '';
        navigate(`/movie/${item.id}-${slug}-${year}`);
      }}
    />
  </div>
</div>
);
};

export default MovieDetailsPage;
