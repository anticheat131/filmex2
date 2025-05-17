import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  getMovieDetails,
  getMovieRecommendations,
  getMovieTrailer,
  getMovieCast,
} from '@/utils/api';
import { MovieDetails, Media, CastMember } from '@/types';
import Navbar from '@/components/Navbar';
import ReviewSection from '@/components/ReviewSection';
import MovieAbout from '@/components/movie/MovieAbout';
import MovieCast from '@/components/movie/MovieCast';
import MovieHeader from '@/components/movie/MovieHeader';
import ContentRow from '@/components/ContentRow';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

function createSlug(title: string, year?: string | number) {
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, '-')
    .trim();
  return year ? `${safeTitle}-${year}` : safeTitle;
}

const MovieDetailsPage = () => {
  const { id: slugId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [recommendations, setRecommendations] = useState<Media[]>([]);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [activeTab, setActiveTab] = useState<'about' | 'cast' | 'reviews'>('about');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = slugId?.split('-')[0]; // Get the numeric ID part

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const movieData = await getMovieDetails(id);
        setMovie(movieData);

        // Generate slug from title and year
        const title = movieData.title || movieData.original_title || 'movie';
        const year = movieData.release_date?.split('-')[0];
        const expectedSlug = createSlug(title, year);
        const expectedPath = `/movie/${movieData.id}-${expectedSlug}`;

        if (location.pathname !== expectedPath) {
          navigate(expectedPath, { replace: true });
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
  }, [id, location.pathname, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-white">
        Loading...
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-white">
        <h1 className="text-2xl mb-4">{error || 'Movie not found'}</h1>
        <Button onClick={() => navigate('/')}>Return to Home</Button>
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
              allow="autoplay; encrypted-media"
              allowFullScreen
              title="Trailer"
            />
          </div>
        )}

        <MovieHeader movie={movie} trailerKey={trailerKey} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex border-b border-white/10 mb-6 overflow-x-auto pb-1 hide-scrollbar">
          {['about', 'cast', 'reviews'].map((tab) => (
            <button
              key={tab}
              className={`py-2 px-4 font-medium ${
                activeTab === tab
                  ? 'text-white border-b-2 border-accent'
                  : 'text-white/60 hover:text-white'
              }`}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </button>
          ))}
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
