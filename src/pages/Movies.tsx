// Modified version of Movies.tsx

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getPopularMovies, getTopRatedMovies } from '@/utils/api';
import { Media, ensureExtendedMediaArray } from '@/utils/types';
import { trackMediaPreference } from '@/lib/analytics';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { MediaGridSkeleton } from '@/components/MediaSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Film, ChevronDown, Grid3X3, List } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { useToast } from '@/hooks/use-toast';
import { MultiSelect } from '@/components/MultiSelect'; // Create this component or use existing lib

const ITEMS_PER_PAGE = 20;

const genreOptions = [
  { label: 'Action', value: '28' },
  { label: 'Adventure', value: '12' },
  { label: 'Comedy', value: '35' },
  { label: 'Drama', value: '18' },
  { label: 'Horror', value: '27' },
  { label: 'Romance', value: '10749' },
  { label: 'Sci-Fi', value: '878' }
];

const Movies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'popular' | 'top_rated'>('popular');
  const [popularPage, setPopularPage] = useState(1);
  const [topRatedPage, setTopRatedPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [allPopularMovies, setAllPopularMovies] = useState<Media[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const popularMoviesQuery = useQuery({
    queryKey: ['popularMovies', popularPage],
    queryFn: () => getPopularMovies(popularPage),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (popularMoviesQuery.data) {
      setAllPopularMovies(prev => {
        const newMovies = popularMoviesQuery.data
          .filter(movie => !prev.some(p => p.id === (movie.id || movie.media_id)))
          .map(movie => ({
            ...movie,
            id: movie.id || movie.media_id || 0,
            media_id: movie.id || movie.media_id || 0,
            media_type: 'movie' as const,
          }));
        return [...prev, ...newMovies];
      });
    }
  }, [popularMoviesQuery.data]);

  useEffect(() => {
    if (popularMoviesQuery.data?.length === ITEMS_PER_PAGE) {
      queryClient.prefetchQuery({
        queryKey: ['popularMovies', popularPage + 1],
        queryFn: () => getPopularMovies(popularPage + 1),
      });
    }
  }, [popularPage, queryClient, popularMoviesQuery.data]);

  const applyFiltersAndSort = (movies: Media[]) => {
    let filtered = [...movies];

    if (selectedGenres.length > 0) {
      const genreIds = selectedGenres.map(Number);
      filtered = filtered.filter(movie =>
        movie.genre_ids?.some(id => genreIds.includes(id))
      );
    }

    filtered.sort((a, b) => b.popularity - a.popularity);

    if (filtered.length < ITEMS_PER_PAGE) {
      const extra = movies
        .filter(m => !filtered.includes(m))
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, ITEMS_PER_PAGE - filtered.length);
      filtered = [...filtered, ...extra];
    }

    return filtered.slice(0, ITEMS_PER_PAGE);
  };

  const filteredPopularMovies = applyFiltersAndSort(allPopularMovies);

  const handleShowMorePopular = () => {
    setPopularPage(prev => prev + 1);
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  };

  const handleTabChange = async (value: 'popular' | 'top_rated') => {
    setActiveTab(value);
    await trackMediaPreference('movie', 'select');
  };

  useEffect(() => {
    void trackMediaPreference('movie', 'browse');
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div className="flex items-center gap-3 pt-10">
              <Film className="h-8 w-8 text-accent animate-pulse-slow" />
              <h1 className="text-3xl font-bold text-white">Movies</h1>
            </div>
            <div className="flex items-center gap-4 pt-6">
              <MultiSelect
                options={genreOptions}
                value={selectedGenres}
                onChange={setSelectedGenres}
                placeholder="Filter by Genre"
              />
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/10 group"
                onClick={toggleViewMode}
              >
                {viewMode === 'grid' ? (
                  <>
                    <List className="mr-2 h-4 w-4" /> List View
                  </>
                ) : (
                  <>
                    <Grid3X3 className="mr-2 h-4 w-4" /> Grid View
                  </>
                )}
              </Button>
            </div>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-6">
              <TabsTrigger value="popular">Popular</TabsTrigger>
            </TabsList>
            <TabsContent value="popular" className="animate-fade-in">
              {popularMoviesQuery.isLoading ? (
                <MediaGridSkeleton listView={viewMode === 'list'} />
              ) : popularMoviesQuery.isError ? (
                <div className="py-12 text-center text-white">Error loading movies.</div>
              ) : (
                <>
                  <MediaGrid
                    media={ensureExtendedMediaArray(filteredPopularMovies)}
                    title="Popular Movies"
                    listView={viewMode === 'list'}
                  />
                  {popularMoviesQuery.data?.length === ITEMS_PER_PAGE && (
                    <div className="flex justify-center my-8">
                      <Button onClick={handleShowMorePopular}>
                        Show More <ChevronDown className="ml-2 h-4 w-4 animate-bounce" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Movies;
