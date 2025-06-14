import { useState, useEffect, useRef } from 'react';
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
import MultiSelect from '@/components/MultiSelect';
import PlatformFilter from './movies/components/PlatformFilter';
import PlatformBar from './movies/components/PlatformBar';

const ITEMS_PER_PAGE = 20;

const genreMap: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};
const genreOptions = Object.entries(genreMap).map(([id, label]) => ({ value: id, label }));
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 50 }, (_, i) => {
  const year = currentYear - i;
  return { value: String(year), label: String(year) };
});

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
  const [genreFilters, setGenreFilters] = useState<string[]>([]);
  const [yearFilter, setYearFilter] = useState<string>('');
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);
  const [showPlatformBar, setShowPlatformBar] = useState(false);
  const fetchingMoreRef = useRef(false);

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

  const clearPlatformFilters = () => setPlatformFilters([]);
  const togglePlatformFilter = (platformId: string) => {
    setPlatformFilters((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    );
  };
  const togglePlatformBar = () => setShowPlatformBar((prev) => !prev);

  const applyFiltersAndSort = (movies: Media[]) => {
    let filteredMovies = [...movies];

    // Multi-genre filter
    if (genreFilters.length > 0) {
      filteredMovies = filteredMovies.filter(movie =>
        genreFilters.every(g => movie.genre_ids?.includes(Number(g)))
      );
    }

    // Year filter
    if (yearFilter && yearFilter !== 'all') {
      filteredMovies = filteredMovies.filter(movie =>
        movie.release_date && movie.release_date.startsWith(yearFilter)
      );
    }

    // Platform filter (demo logic, adapt to real provider data if available)
    if (platformFilters.length > 0) {
      filteredMovies = filteredMovies.filter(movie =>
        platformFilters.some(platformId => {
          // Demo: assign movies to platforms by id hash
          const platformIndex = platformId.length > 0 ? platformId.charCodeAt(0) % 8 : 0;
          return (movie.id % 8) === platformIndex;
        })
      );
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

  // Helper to ensure at least 20 filtered movies
  const getAtLeastNFilteredMovies = async (
    allMovies: Media[],
    queryFn: (page: number) => Promise<Media[]>,
    page: number,
    filterFn: (movies: Media[]) => Media[],
    n: number
  ) => {
    let filtered = filterFn(allMovies);
    let currentPage = page;
    let movies = [...allMovies];
    let pagesWithoutNewMovies = 0;
    const MAX_PAGES = 20; // Prevent infinite loop
    while (filtered.length < n && pagesWithoutNewMovies < MAX_PAGES) {
      currentPage += 1;
      const nextPageMovies = await queryFn(currentPage);
      if (!nextPageMovies.length) break;
      // Only add movies that are not already present
      const newMovies = nextPageMovies.filter(movie => !movies.some(m => m.id === (movie.id || movie.media_id)));
      if (newMovies.length === 0) {
        pagesWithoutNewMovies++;
        continue;
      }
      movies = [...movies, ...newMovies];
      filtered = filterFn(movies);
    }
    return filtered.slice(0, n);
  };

  const [filteredPopularMovies, setFilteredPopularMovies] = useState<Media[]>([]);
  const [filteredTopRatedMovies, setFilteredTopRatedMovies] = useState<Media[]>([]);

  useEffect(() => {
    const filterFn = (movies: Media[]) => applyFiltersAndSort(movies);
    // Always use getAtLeastNFilteredMovies to ensure at least 20 movies for any filter combination (including genre/category)
    getAtLeastNFilteredMovies(
      allPopularMovies,
      getPopularMovies,
      popularPage,
      filterFn,
      20
    ).then(setFilteredPopularMovies);
    getAtLeastNFilteredMovies(
      allTopRatedMovies,
      getTopRatedMovies,
      topRatedPage,
      filterFn,
      20
    ).then(setFilteredTopRatedMovies);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPopularMovies, allTopRatedMovies, platformFilters, genreFilters, yearFilter, sortBy]);

  const handleShowMorePopular = () => setPopularPage(prev => prev + 1);
  const handleShowMoreTopRated = () => setTopRatedPage(prev => prev + 1);
  const toggleViewMode = () => setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  const handleTabChange = async (value: 'popular' | 'top_rated') => {
    setActiveTab(value);
    await trackMediaPreference('movie', 'select');
  };

  const hasMorePopular = popularMoviesQuery.data?.length === ITEMS_PER_PAGE;
  const hasMoreTopRated = topRatedMoviesQuery.data?.length === ITEMS_PER_PAGE;

  useEffect(() => {
    void trackMediaPreference('movie', 'browse');
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 pt-10 mb-6">
            <Film className="h-8 w-8 text-accent animate-pulse-slow" />
            <h1 className="text-3xl font-bold text-white">Movies</h1>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <TabsList className="mb-4 md:mb-0">
                <TabsTrigger value="popular" className="data-[state=active]:bg-accent/20">Popular</TabsTrigger>
                <TabsTrigger value="top_rated" className="data-[state=active]:bg-accent/20">Top Rated</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              {/* Sort By Filter */}
              <Select 
                value={sortBy} 
                onValueChange={(value: 'default' | 'title' | 'release_date' | 'rating') => setSortBy(value)}
              >
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

              {/* Genre Filter */}
              <MultiSelect
                options={genreOptions}
                selected={genreFilters}
                onChange={setGenreFilters}
                placeholder="Filter by Genre(s)"
                className="min-w-[180px]"
              />

              {/* Year Filter */}
              <div className="flex flex-col">
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-[120px] border-white/10 text-white bg-transparent">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border-white/10 text-white max-h-60 overflow-y-auto">
                    <SelectItem value="all">All Years</SelectItem>
                    {yearOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Platform filter button for switching streaming platforms */}
              <PlatformFilter
                platformFilters={platformFilters}
                togglePlatformFilter={togglePlatformFilter}
                clearPlatformFilters={clearPlatformFilters}
                togglePlatformBar={togglePlatformBar}
                showPlatformBar={showPlatformBar}
              />

              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-white hover:bg-white/10 group"
                onClick={toggleViewMode}
              >
                {viewMode === 'grid' ? (
                  <>
                    <List className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    List View
                  </>
                ) : (
                  <>
                    <Grid3X3 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                    Grid View
                  </>
                )}
              </Button>
            </div>
            
            {showPlatformBar && (
              <PlatformBar platformFilters={platformFilters} setPlatformFilters={setPlatformFilters} />
            )}

            <TabsContent value="popular" className="focus-visible:outline-none animate-fade-in">
              {popularMoviesQuery.isLoading ? (
                <MediaGridSkeleton listView={viewMode === 'list'} />
              ) : popularMoviesQuery.isError ? (
                <div className="py-12 text-center text-white">Error loading movies. Please try again.</div>
              ) : (
                <>
                  <MediaGrid media={ensureExtendedMediaArray(filteredPopularMovies)} title="Popular Movies" listView={viewMode === 'list'} />
                  
                  {hasMorePopular && (
                    <div className="flex justify-center my-8">
                      <Button 
                        onClick={handleShowMorePopular}
                        variant="outline"
                        className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
                      >
                        {popularMoviesQuery.isFetching ? (
                          <>Loading...</>
                        ) : (
                          <>Show More <ChevronDown className="ml-2 h-4 w-4 animate-bounce" /></>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
            
            <TabsContent value="top_rated" className="focus-visible:outline-none animate-fade-in">
              {topRatedMoviesQuery.isLoading ? (
                <MediaGridSkeleton listView={viewMode === 'list'} />
              ) : topRatedMoviesQuery.isError ? (
                <div className="py-12 text-center text-white">Error loading movies. Please try again.</div>
              ) : (
                <>
                  <MediaGrid media={ensureExtendedMediaArray(filteredTopRatedMovies)} title="Top Rated Movies" listView={viewMode === 'list'} />
                  
                  {hasMoreTopRated && (
                    <div className="flex justify-center my-8">
                      <Button 
                        onClick={handleShowMoreTopRated}
                        variant="outline"
                        className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
                      >
                        {topRatedMoviesQuery.isFetching ? (
                          <>Loading...</>
                        ) : (
                          <>Show More <ChevronDown className="ml-2 h-4 w-4 animate-bounce" /></>
                        )}
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
