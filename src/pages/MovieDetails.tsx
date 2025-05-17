import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getMovieRecommendations, getMovieTrailer, backdropSizes, posterSizes, getMovieCast } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { MovieDetails, Media, CastMember } from '@/utils/types';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import ContentRow from '@/components/ContentRow';
import ReviewSection from '@/components/ReviewSection';
import { Play, Clock, Calendar, Star, ArrowLeft, Heart, Bookmark } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWatchHistory } from '@/hooks/watch-history';

const slugify = (text: string) => 
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with -
    .replace(/^-+|-+$/g, '');    // Trim leading/trailing -

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
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'unknown-year';
      const slugTitle = slugify(movie.title || 'movie');
      navigate(`/watch/movie/${movie.id}/${slugTitle}-${year}`);
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
            className={`w-full h-full object-cover transition-opacity duration-700 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLogoLoaded(true)}
            loading="lazy"
          />
        </div>
        
        <div className="flex flex-col text-white max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {movie.title} {movie.release_date && `(${new Date(movie.release_date).getFullYear()})`}
          </h1>
          <p className="text-sm mb-3 max-w-xl line-clamp-4">{movie.overview}</p>
          
          <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-300 text-sm">
            {movie.release_date && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(movie.release_date).toLocaleDateString()}</span>
              </div>
            )}
            {movie.runtime && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
            )}
            {movie.vote_average && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{movie.vote_average.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-4">
            <Button onClick={handlePlayMovie} variant="primary" className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Play
            </Button>
            
            <Button 
              onClick={handleToggleFavorite} 
              variant={isFavorite ? "destructive" : "outline"} 
              aria-pressed={isFavorite}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className="h-5 w-5" />
            </Button>
            
            <Button
              onClick={handleToggleWatchlist}
              variant={isInMyWatchlist ? "destructive" : "outline"}
              aria-pressed={isInMyWatchlist}
              aria-label={isInMyWatchlist ? "Remove from watchlist" : "Add to watchlist"}
            >
              <Bookmark className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  {/* Tabs Section */}
  <section className="max-w-6xl mx-auto p-4 md:p-8">
    <nav className="flex space-x-6 border-b border-gray-700 mb-6" role="tablist" aria-label="Movie details tabs">
      <button
        role="tab"
        aria-selected={activeTab === 'about'}
        aria-controls="tab-about"
        id="tab-about-btn"
        className={`pb-2 border-b-2 font-semibold text-lg ${
          activeTab === 'about' ? 'border-primary text-white' : 'border-transparent text-gray-400 hover:text-white'
        }`}
        onClick={() => setActiveTab('about')}
      >
        About
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 'reviews'}
        aria-controls="tab-reviews"
        id="tab-reviews-btn"
        className={`pb-2 border-b-2 font-semibold text-lg ${
          activeTab === 'reviews' ? 'border-primary text-white' : 'border-transparent text-gray-400 hover:text-white'
        }`}
        onClick={() => setActiveTab('reviews')}
      >
        Reviews
      </button>
      <button
        role="tab"
        aria-selected={activeTab === 'cast'}
        aria-controls="tab-cast"
        id="tab-cast-btn"
        className={`pb-2 border-b-2 font-semibold text-lg ${
          activeTab === 'cast' ? 'border-primary text-white' : 'border-transparent text-gray-400 hover:text-white'
        }`}
        onClick={() => setActiveTab('cast')}
      >
        Cast
      </button>
    </nav>
    
    <div
      role="tabpanel"
      id="tab-about"
      aria-labelledby="tab-about-btn"
      hidden={activeTab !== 'about'}
      className="text-gray-300"
    >
      <p>{movie.overview || 'No description available.'}</p>
    </div>
    
    <div
      role="tabpanel"
      id="tab-reviews"
      aria-labelledby="tab-reviews-btn"
      hidden={activeTab !== 'reviews'}
    >
      <ReviewSection movieId={movie.id} />
    </div>
    
    <div
      role="tabpanel"
      id="tab-cast"
      aria-labelledby="tab-cast-btn"
      hidden={activeTab !== 'cast'}
      className="overflow-x-auto"
    >
      <div className="flex gap-4 min-w-max">
        {cast.length === 0 ? (
          <p className="text-gray-400">No cast information available.</p>
        ) : (
          cast.map((member) => (
            <div
              key={member.cast_id}
              className="w-28 text-center flex-shrink-0"
            >
              <img
                src={getImageUrl(member.profile_path, posterSizes.small)}
                alt={member.name}
                className="rounded-md mb-2 aspect-[2/3] object-cover"
                loading="lazy"
              />
              <p className="text-sm font-semibold text-white">{member.name}</p>
              <p className="text-xs text-gray-400">{member.character}</p>
            </div>
          ))
        )}
      </div>
    </div>
  </section>
  
  {/* Recommendations */}
  {recommendations.length > 0 && (
    <ContentRow
      title="You Might Also Like"
      items={recommendations}
      mediaType="movie"
    />
  )}
</div>
);
};

export default MovieDetailsPage;
