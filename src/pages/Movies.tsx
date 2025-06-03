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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import MultiSelect from '@/components/MultiSelect'; // custom multiselect component

const ITEMS_PER_PAGE = 20;

const Movies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'popular' | 'top_rated'>('popular');
  const [popularPage, setPopularPage] = useState(1);
  const [topRatedPage, setTopRatedPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [allPopularMovies, setAllPopularMovies] = useState<Media[]>([]);
  const [allTopRatedMovies, setAllTopRatedMovies] = useState<Media[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'release_date' | 'rating'>('default');
  const [genreFilter, setGenreFilter] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState<string[]>([]);

  const popularMoviesQuery = useQuery({
    queryKey: ['popularMovies', popularPage],
    queryFn: () => getPopularMovies(popularPage),
    placeholderData: keepPreviousData,
  });

  const topRatedMoviesQuery = useQuery({
    queryKey: ['topRatedMovies', topRatedPage],
    queryFn: () => getTopRatedMovies(topRatedPage),
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
    if (topRatedMoviesQuery.data) {
      setAllTopRatedMovies(prev => {
        const newMovies = topRatedMoviesQuery.data
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
  }, [topRatedMoviesQuery.data]);

  useEffect(() => {
    if (popularMoviesQuery.data?.length === ITEMS_PER_PAGE) {
      queryClient.prefetchQuery({
        queryKey: ['popularMovies', popularPage + 1],
        queryFn: () => getPopularMovies(popularPage + 1),
      });
    }
  }, [popularPage, queryClient, popularMoviesQuery.data]);

  useEffect(() => {
    if (topRatedMoviesQuery.data?.length === ITEMS_PER_PAGE) {
      queryClient.prefetchQuery({
        queryKey: ['topRatedMovies', topRatedPage + 1],
        queryFn: () => getTopRatedMovies(topRatedPage + 1),
      });
    }
  }, [topRatedPage, queryClient, topRatedMoviesQuery.data]);

  const applyFiltersAndSort = (movies: Media[]) => {
    let filteredMovies = [...movies];

    if (genreFilter.length > 0) {
      filteredMovies = filteredMovies.filter(movie =>
        movie.genre_ids?.some(id => genreFilter.includes(id.toString()))
      );
    }

    if (yearFilter.length > 0) {
      filteredMovies = filteredMovies.filter(movie => {
        const year = new Date(movie.release_date).getFullYear().toString();
        return yearFilter.includes(year);
      });
    }

    switch (sortBy) {
      case 'title':
        filteredMovies.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'release_date':
        filteredMovies.sort((a, b) =>
          new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        );
        break;
      case 'rating':
        filteredMovies.sort((a, b) => b.vote_average - a.vote_average);
        break;
      default:
        break;
    }

    return filteredMovies;
  };

  const filteredPopularMovies = applyFiltersAndSort(allPopularMovies);
  const filteredTopRatedMovies = applyFiltersAndSort(allTopRatedMovies);

  const handleShowMorePopular = () => setPopularPage(prev => prev + 1);
  const handleShowMoreTopRated = () => setTopRatedPage(prev => prev + 1);
  const toggleViewMode = () => setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  const handleTabChange = async (value: 'popular' | 'top_rated') => {
    setActiveTab(value);
    await trackMediaPreference('movie', 'select');
  };

  const hasMorePopular = popularMoviesQuery.data?.length === ITEMS_PER_PAGE;
  const hasMoreTopRated = topRatedMoviesQuery.data?.length === ITEMS_PER_PAGE;

  useEffect(() => void trackMediaPreference('movie', 'browse'), []);

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
              <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
                <SelectTrigger className="w-[180px] border-white/10 text-white bg-transparent">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10 text-white">
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="release_date">Release Date</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
              <MultiSelect
                options={[{ value: '28', label: 'Action' }, { value: '12', label: 'Adventure' }, { value: '35', label: 'Comedy' }, { value: '18', label: 'Drama' }, { value: '27', label: 'Horror' }, { value: '10749', label: 'Romance' }, { value: '878', label: 'Sci-Fi' }]}
                value={genreFilter}
                onChange={setGenreFilter}
                placeholder="Filter by Genre"
              />
              <MultiSelect
                options={Array.from({ length: 25 }, (_, i) => (new Date().getFullYear() - i).toString()).map(y => ({ value: y, label: y }))}
                value={yearFilter}
                onChange={setYearFilter}
                placeholder="Filter by Year"
              />
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/10 group"
                onClick={toggleViewMode}
              >
                {viewMode === 'grid' ? (<><List className="mr-2 h-4 w-4" /> List View</>) : (<><Grid3X3 className="mr-2 h-4 w-4" /> Grid View</>)}
              </Button>
            </div>
          </div>
          <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <TabsList className="mb-4 md:mb-0">
                <TabsTrigger value="popular" className="data-[state=active]:bg-accent/20">Popular</TabsTrigger>
                <TabsTrigger value="top_rated" className="data-[state=active]:bg-accent/20">Top Rated</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="popular" className="animate-fade-in">
              {popularMoviesQuery.isLoading ? <MediaGridSkeleton listView={viewMode === 'list'} /> : popularMoviesQuery.isError ? (<div className="py-12 text-center text-white">Error loading movies. Please try again.</div>) : (<>
                <MediaGrid media={ensureExtendedMediaArray(filteredPopularMovies)} title="Popular Movies" listView={viewMode === 'list'} />
                {hasMorePopular && (
                  <div className="flex justify-center my-8">
                    <Button onClick={handleShowMorePopular} variant="outline" className="border-white/10 text-white hover:bg-accent/20">
                      {popularMoviesQuery.isFetching ? 'Loading...' : <>Show More <ChevronDown className="ml-2 h-4 w-4 animate-bounce" /></>}
                    </Button>
                  </div>
                )}
              </>)}
            </TabsContent>
            <TabsContent value="top_rated" className="animate-fade-in">
              {topRatedMoviesQuery.isLoading ? <MediaGridSkeleton listView={viewMode === 'list'} /> : topRatedMoviesQuery.isError ? (<div className="py-12 text-center text-white">Error loading movies. Please try again.</div>) : (<>
                <MediaGrid media={ensureExtendedMediaArray(filteredTopRatedMovies)} title="Top Rated Movies" listView={viewMode === 'list'} />
                {hasMoreTopRated && (
                  <div className="flex justify-center my-8">
                    <Button onClick={handleShowMoreTopRated} variant="outline" className="border-white/10 text-white hover:bg-accent/20">
                      {topRatedMoviesQuery.isFetching ? 'Loading...' : <>Show More <ChevronDown className="ml-2 h-4 w-4 animate-bounce" /></>}
                    </Button>
                  </div>
                )}
              </>)}
            </TabsContent>
          </Tabs>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Movies;
