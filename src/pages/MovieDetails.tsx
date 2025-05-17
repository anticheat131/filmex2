import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails, getMovieRecommendations, getMovieTrailer, getMovieCast } from '@/utils/api';
import { getImageUrl } from '@/utils/services/tmdb';
import { MovieDetails, Media, CastMember } from '@/types';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import ReviewSection from '@/components/ReviewSection';
import MovieAbout from '@/components/movie/MovieAbout';
import MovieCast from '@/components/movie/MovieCast';
import MovieHeader from '@/components/movie/MovieHeader';
import ContentRow from '@/components/ContentRow';
import { useIsMobile } from '@/hooks/use-mobile';

function generateMovieSlugURL(
  id: number | string,
  title?: string,
  year?: string | number
) {
  if (!title) return `/movie/${id}`;
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '') // remove special chars
    .trim()
    .replace(/\s+/g, '-');

  if (year) {
    return `/movie/${id}-${slug}-${year}`;
  }
  return `/movie/${id}-${slug}`;
}

const MovieDetailsPage = () => {
  const { id: rawId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Media[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [activeTab, setActiveTab] = useState<'about' | 'cast' | 'reviews'>('about');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const id = rawId?.split('-')[0];

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const details = await getMovieDetails(id);
        setMovie(details);

        const title = details.title || details.original_title;
        const year = details.release_date
          ? new Date(details.release_date).getFullYear()
          : undefined;

        const expectedUrl = generateMovieSlugURL(details.id, title, year);
        if (window.location.pathname !== expectedUrl) {
          navigate(expectedUrl, { replace: true });
        }

        const recs = await getMovieRecommendations(id);
        setRecommendations(recs || []);

        const trailer = await getMovieTrailer(id);
        setTrailerKey(trailer || null);

        const movieCast = await getMovieCast(id);
        setCast(movieCast || []);

        setError(null);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch movie details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse-slow text-white font-medium">Loading...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <h1 className="text-2xl text-white mb-4">{error || 'Movie not found'}</h1>
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

        <MovieHeader movie={movie} trailerKey={trailerKey} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex border-b border-white/10 mb-6 overflow-x-auto pb-1 hide-scrollbar">
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

        {activeTab === 'about' && <MovieAbout movie={movie} />}
        {activeTab === 'cast' && <MovieCast cast={cast} />}
        {activeTab === 'reviews' && (
          <ReviewSection
            mediaType="movie"
            mediaId={movie.id}
            recommendations={recommendations}
          />
        )}
      </div>

      <ContentRow
        title="Recommended Movies"
        items={recommendations}
        mediaType="movie"
        showSeeAll={false}
      />
    </div>
  );
};

export default MovieDetailsPage;
