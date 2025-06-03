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

  // For filtering selections
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'release_date' | 'rating'>('default');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  // Applied filters used for filtering/sorting movies (only updated when Apply clicked)
  const [appliedSortBy, setAppliedSortBy] = useState(sortBy);
  const [appliedGenres, setAppliedGenres] = useState<string[]>([]);
  const [appliedYears, setAppliedYears] = useState<string[]>([]);

  // Fetch popular movies
  const popularMoviesQuery = useQuery({
    queryKey: ['popularMovies', popularPage],
    queryFn: () => getPopularMovies(popularPage),
    placeholderData: keepPreviousData,
  });

  // Fetch top rated movies
  const topRatedMoviesQuery = useQuery({
    queryKey: ['topRatedMovies', topRatedPage],
    queryFn: () => getTopRatedMovies(topRatedPage),
    placeholderData: keepPreviousData,
  });

  // Append new popular movies avoiding duplicates
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

  // Append new top rated movies avoiding duplicates
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

  // Prefetch next popular page if exists
  useEffect(() => {
    if (popularMoviesQuery.data?.length === ITEMS_PER_PAGE) {
      queryClient.prefetchQuery({
        queryKey: ['popularMovies', popularPage + 1],
        queryFn: () => getPopularMovies(popularPage + 1),
      });
    }
  }, [popularPage, queryClient, popularMoviesQuery.data]);

  // Prefetch next top rated page if exists
  useEffect(() => {
    if (topRatedMoviesQuery.data?.length === ITEMS_PER_PAGE) {
      queryClient.prefetchQuery({
        queryKey: ['topRatedMovies', topRatedPage + 1],
        queryFn: () => getTopRatedMovies(topRatedPage + 1),
      });
    }
  }, [topRatedPage, queryClient, topRatedMoviesQuery.data]);

  // Apply filtering and sorting based on applied filters
  const applyFiltersAndSort = (movies: Media[]) => {
    let filteredMovies = [...movies];

    if (appliedGenres.length > 0) {
      filteredMovies = filteredMovies.filter(movie =>
        movie.genre_ids?.some(id => appliedGenres.includes(id.toString()))
      );
    }

    if (appliedYears.length > 0) {
      filteredMovies = filteredMovies.filter(movie => {
        const year = movie.release_date ? new Date(movie.release_date).getFullYear().toString() : '';
        return appliedYears.includes(year);
      });
    }

    switch (appliedSortBy) {
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

  const handleShowMorePopular = () => {
    setPopularPage(prev => prev + 1);
  };

  const handleShowMoreTopRated = () => {
    setTopRatedPage(prev => prev + 1);
  };

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'));
  };

  const handleTabChange = async (value: 'popular' | 'top_rated') => {
    setActiveTab(value);
    await trackMediaPreference('movie', 'select');
  };

  // Define hasMore flags before render (fixes your error)
  const hasMorePopular = popularMoviesQuery.data?.length === ITEMS_PER_PAGE;
  const hasMoreTopRated = topRatedMoviesQuery.data?.length === ITEMS_PER_PAGE;

  // Track initial page visit
  useEffect(() => {
    void trackMediaPreference('movie', 'browse');
  }, []);

  // Confirm / Apply filters button handler
  const handleApplyFilters = () => {
    setAppliedGenres(selectedGenres);
    setAppliedYears(selectedYears);
    setAppliedSortBy(sortBy);
  };

  // Helper: years from 2025 to 1980 for example
  const yearsOptions = Array.from({ length: 46 }, (_, i) => (2025 - i).toString());

  // Handle multi-select genre changes
  const handleGenreChange = (value: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(value)) {
        return prev.filter(g => g !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // Handle multi-select year changes
  const handleYearChange = (value: string) => {
    setSelectedYears(prev => {
      if (prev.includes(value)) {
        return prev.filter(y => y !== value);
      } else {
        return [...prev, value];
      }
    });
  };

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

            <div className="flex flex-wrap items-center gap-4 pt-6 max-w-full">
              {/* Sort Select */}
              <Select
                value={sortBy}
                onValueChange={value => setSortBy(value as any)}
              >
                <SelectTrigger className="w-[180px] border-white/10 text-white bg-transparent">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10 text-white max-h-60 overflow-auto">
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="release_date">Release Date</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>

              {/* Genre Multi-select */}
              <Select
                multiple
                value={selectedGenres}
                onValueChange={value => setSelectedGenres(Array.isArray(value) ? value : [value])}
              >
                <SelectTrigger className="w-[180px] border-white/10 text-white bg-transparent">
                  <SelectValue
                    placeholder="Filter by Genre"
                    // Show count or first selected
                    value={
                      selectedGenres.length === 0
                        ? undefined
                        : selectedGenres.length === 1
                        ? genreName(selectedGenres[0])
                        : `${selectedGenres.length} genres selected`
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10 text-white max-h-60 overflow-auto">
                  <SelectItem value="28">Action</SelectItem>
                  <SelectItem value="12">Adventure</SelectItem>
                  <SelectItem value="35">Comedy</SelectItem>
                  <SelectItem value="18">Drama</SelectItem>
                  <SelectItem value="27">Horror</SelectItem>
                  <SelectItem value="10749">Romance</SelectItem>
                  <SelectItem value="878">Sci-Fi</SelectItem>
                </SelectContent>
              </Select>

              {/* Year Multi-select */}
              <Select
                multiple
                value={selectedYears}
                onValueChange={value => setSelectedYears(Array.isArray(value) ? value : [value])}
              >
                <SelectTrigger className="w-[140px] border-white/10 text-white bg-transparent">
                  <SelectValue
                    placeholder="Filter by Year"
                    value={
                      selectedYears.length === 0
                        ? undefined
                        : selectedYears.length === 1
                        ? selectedYears[0]
                        : `${selectedYears.length} years selected`
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10 text-white max-h-60 overflow-auto">
                  {yearsOptions.map(year => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Apply Filters Button */}
              <Button onClick={handleApplyFilters} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
                Apply Filters
              </Button>

              {/* View Mode toggle */}
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
          </div>

          <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <TabsList className="mb-4 md:mb-0">
                <TabsTrigger value="popular" className="data-[state=active]:bg-accent/20">
                  Popular
                </TabsTrigger>
                <TabsTrigger value="top_rated" className="data-[state=active]:bg-accent/20">
                  Top Rated
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="popular" className="focus-visible:outline-none animate-fade-in">
              {popularMoviesQuery.isLoading ? (
                <MediaGridSkeleton listView={viewMode === 'list'} />
              ) : popularMoviesQuery.isError ? (
                <div className="py-12 text-center text-white">Error loading movies. Please try again.</div>
              ) : (
                <>
                  <MediaGrid media={ensureExtendedMediaArray(filteredPopularMovies)} title="Popular Movies" listView={viewMode === 'list'} />

                  {hasMorePopular && (
                    <div className="flex justify-center mt-8">
                      <Button onClick={handleShowMorePopular} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
                        Show More
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
                    <div className="flex justify-center mt-8">
                      <Button onClick={handleShowMoreTopRated} variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
                        Show More
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

// Helper function to get genre name from id string
function genreName(id: string) {
  switch (id) {
    case '28':
      return 'Action';
    case '12':
      return 'Adventure';
    case '35':
      return 'Comedy';
    case '18':
      return 'Drama';
    case '27':
      return 'Horror';
    case '10749':
      return 'Romance';
    case '878':
      return 'Sci-Fi';
    default:
      return id;
  }
}

export default Movies;
