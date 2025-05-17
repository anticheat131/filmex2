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
import { Play, Clock, Calendar, Star, ArrowLeft, Heart, Bookmark } from 'lucide-react';
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
                    <div class Name="bg-gray-800 rounded-lg h-16 animate-pulse" />
)}
<img
src={getImageUrl(movie.logo_path, posterSizes.medium)}
alt={${movie.title} logo}
className={w-full h-auto object-contain ${ logoLoaded ? 'opacity-100' : 'opacity-0' }}
onLoad={() => setLogoLoaded(true)}
/>
</div>
) : (
<h1 className="text-4xl font-bold text-white mb-2">{movie.title}</h1>
)}
          <div className="flex flex-wrap gap-3 mb-4 text-sm font-medium text-white/80">
            <span>{movie.release_date?.split('-')[0]}</span>
            <span>•</span>
            <span>{formatRuntime(movie.runtime)}</span>
            <span>•</span>
            <span>TMDB: {movie.vote_average.toFixed(1)}</span>
            <span>•</span>
            <span>
              {movie.genres.slice(0, 3).map((genre, idx) => (
                <span key={genre.id}>
                  {genre.name}
                  {idx < Math.min(2, movie.genres.length - 1) ? ', ' : ''}
                </span>
              ))}
            </span>
          </div>
          
          <p className="text-white/90 mb-6 max-w-prose leading-relaxed">{movie.overview}</p>
          
          <div className="flex gap-4 flex-wrap">
            <Button onClick={handlePlayMovie} className="bg-primary text-black flex items-center gap-2 hover:bg-primary-dark">
              <Play className="h-5 w-5" />
              Play
            </Button>
            
            <Button
              onClick={handleToggleFavorite}
              variant={isFavorite ? 'default' : 'outline'}
              className="flex items-center gap-2"
              aria-pressed={isFavorite}
            >
              <Heart className="h-5 w-5" />
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </Button>
            
            <Button
              onClick={handleToggleWatchlist}
              variant={isInMyWatchlist ? 'default' : 'outline'}
              className="flex items-center gap-2"
              aria-pressed={isInMyWatchlist}
            >
              <Bookmark className="h-5 w-5" />
              {isInMyWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  {/* Tabs */}
  <div className="max-w-7xl mx-auto p-6">
    <nav className="flex border-b border-white/10 mb-6" aria-label="Tabs">
      {['about', 'reviews', 'cast'].map((tab) => (
        <button
          key={tab}
          className={`py-2 px-4 -mb-px text-white/80 font-semibold transition-colors ${
            activeTab === tab ? 'border-b-2 border-primary text-white' : 'hover:text-white'
          }`}
          onClick={() => setActiveTab(tab as typeof activeTab)}
          aria-current={activeTab === tab ? 'page' : undefined}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </nav>
    
    {activeTab === 'about' && (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-white mb-4">About the Movie</h2>
        <p className="text-white/90 leading-relaxed">{movie.overview}</p>
      </div>
    )}
    
    {activeTab === 'reviews' && (
      <ReviewSection mediaType="movie" mediaId={movie.id} />
    )}
    
    {activeTab === 'cast' && (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {cast.map((member) => (
          <div key={member.id} className="bg-gray-900 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
            <img
              src={getImageUrl(member.profile_path, posterSizes.small)}
              alt={member.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-2 text-center">
              <h3 className="text-white text-sm font-semibold truncate" title={member.name}>{member.name}</h3>
              <p className="text-white/70 text-xs truncate" title={member.character}>{member.character}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* Recommendations */}
  {recommendations.length > 0 && (
    <ContentRow title="You might also like" items={recommendations} />
  )}
</div>
);
};

export default MovieDetailsPage;
