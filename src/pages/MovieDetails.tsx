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
      // Include slugified title and year in the URL
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
            <div className="hidden md:block flex-shrink-0 w-48 xl:w-64 rounded-lg overflow-hidden shadow-lg">
              <img 
                src={getImageUrl(movie.poster_path, posterSizes.medium)} 
                alt={movie.title || 'Movie poster'} 
                className="w-full h-auto"
              />
            </div>
            
            <div className="flex-1 animate-slide-up">
              {movie.logo_path && (
<img
src={getImageUrl(movie.logo_path, posterSizes.small)}
alt={${movie.title} logo}
onLoad={() => setLogoLoaded(true)}
className={max-h-16 mb-4 transition-opacity duration-700 ${ logoLoaded ? 'opacity-100' : 'opacity-0' }}
/>
)}
<h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{movie.title}</h1>
<div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
{movie.release_date && (
<div className="flex items-center gap-1">
<Calendar className="w-4 h-4" />
<span>{new Date(movie.release_date).toLocaleDateString()}</span>
</div>
)}
{movie.runtime && (
<div className="flex items-center gap-1">
<Clock className="w-4 h-4" />
<span>{formatRuntime(movie.runtime)}</span>
</div>
)}
<div className="flex items-center gap-1">
<Star className="w-4 h-4 text-yellow-400" />
<span>{movie.vote_average.toFixed(1)}</span>
</div>
{movie.genres && movie.genres.length > 0 && (
<div className="flex items-center gap-1 flex-wrap max-w-[60%]">
{movie.genres.slice(0, 3).map(genre => (
<span key={genre.id} className="bg-gray-700 rounded-full px-3 py-1 text-xs font-semibold">
{genre.name}
</span>
))}
</div>
)}
</div>
<p className="text-gray-300 mb-6 max-w-prose">{movie.overview}</p>
          <div className="flex gap-4 flex-wrap">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handlePlayMovie}
              leftIcon={<Play />}
              aria-label="Play movie"
            >
              Play
            </Button>

            <Button
              variant={isFavorite ? 'destructive' : 'outline'}
              size="lg"
              onClick={handleToggleFavorite}
              leftIcon={<Heart />}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? 'Remove Favorite' : 'Add Favorite'}
            </Button>

            <Button
              variant={isInMyWatchlist ? 'destructive' : 'outline'}
              size="lg"
              onClick={handleToggleWatchlist}
              leftIcon={<Bookmark />}
              aria-label={isInMyWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {isInMyWatchlist ? 'Remove Watchlist' : 'Add Watchlist'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  {/* Tabs: About, Cast, Reviews */}
  <div className="max-w-6xl mx-auto p-4 md:p-8">
    <nav className="flex gap-6 border-b border-gray-700 mb-8">
      <button
        onClick={() => setActiveTab('about')}
        className={`pb-2 font-semibold ${
          activeTab === 'about' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-white'
        }`}
        aria-current={activeTab === 'about' ? 'page' : undefined}
      >
        About
      </button>
      <button
        onClick={() => setActiveTab('cast')}
        className={`pb-2 font-semibold ${
          activeTab === 'cast' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-white'
        }`}
        aria-current={activeTab === 'cast' ? 'page' : undefined}
      >
        Cast & Crew
      </button>
      <button
        onClick={() => setActiveTab('reviews')}
        className={`pb-2 font-semibold ${
          activeTab === 'reviews' ? 'border-b-2 border-primary text-primary' : 'text-gray-400 hover:text-white'
        }`}
        aria-current={activeTab === 'reviews' ? 'page' : undefined}
      >
        Reviews
      </button>
    </nav>

    {activeTab === 'about' && (
      <section aria-label="Movie description" className="text-gray-300 prose max-w-none">
        <p>{movie.overview}</p>
      </section>
    )}

    {activeTab === 'cast' && (
      <section aria-label="Movie cast and crew" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {cast.length === 0 ? (
          <p className="text-gray-400">No cast information available.</p>
        ) : (
          cast.map(person => (
            <div key={person.id} className="flex flex-col items-center text-center">
              <img
                src={getImageUrl(person.profile_path, posterSizes.small)}
                alt={person.name}
                className="rounded-lg w-24 h-32 object-cover mb-2"
              />
              <h4 className="text-white font-semibold">{person.name}</h4>
              <p className="text-gray-400 text-sm">{person.character || person.job}</p>
            </div>
          ))
        )}
      </section>
    )}

    {activeTab === 'reviews' && (
      <ReviewSection movieId={movie.id} />
    )}

    {/* Recommendations */}
    {recommendations.length > 0 && (
      <ContentRow
        title="Recommendations"
        mediaList={recommendations}
        linkTo="/"
      />
    )}
  </div>
</div>
);
};

export default MovieDetailsPage;
