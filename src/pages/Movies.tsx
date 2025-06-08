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
import MultiSelect from '@/components/MultiSelect'; // Assume a MultiSelect component

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
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string[]>([]); // supports multi-select

  const platformOptions = [
    { label: 'Netflix', value: 'netflix', icon: '/icons/netflix.svg' },
    { label: 'Disney+', value: 'disney', icon: '/icons/disney.svg' },
    { label: 'Hulu', value: 'hulu', icon: '/icons/hulu.svg' },
    { label: 'Amazon Prime', value: 'amazon', icon: '/icons/prime.svg' },
    { label: 'HBO Max', value: 'hbo', icon: '/icons/hbo.svg' },
  ];

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
          .filter(m => !prev.some(p => p.id === (m.id || m.media_id)))
          .map(m => ({
            ...m,
            id: m.id || m.media_id || 0,
            media_id: m.id || m.media_id || 0,
            media_type: 'movie',
          }));
        return [...prev, ...newMovies];
      });
    }
  }, [popularMoviesQuery.data]);

  useEffect(() => {
    if (topRatedMoviesQuery.data) {
      setAllTopRatedMovies(prev => {
        const newMovies = topRatedMoviesQuery.data
          .filter(m => !prev.some(p => p.id === (m.id || m.media_id)))
          .map(m => ({
            ...m,
            id: m.id || m.media_id || 0,
            media_id: m.id || m.media_id || 0,
            media_type: 'movie',
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
    let filtered = [...movies];

    if (genreFilter !== 'all') {
      filtered = filtered.filter(m => m.genre_ids?.includes(+genreFilter));
    }

    if (platformFilter.length) {
      filtered = filtered.filter(m => m.platforms?.some(p => platformFilter.includes(p)));
    }

    switch (sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'release_date':
        filtered.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
        break;
      case 'rating':
        filtered.sort((a, b) => b.vote_average - a.vote_average);
        break;
    }
    return filtered;
  };

  const filteredPopular = applyFiltersAndSort(allPopularMovies);
  const filteredTopRated = applyFiltersAndSort(allTopRatedMovies);

  const handleShowMorePopular = () => setPopularPage(p => p + 1);
  const handleShowMoreTopRated = () => setTopRatedPage(p => p + 1);
  const toggleViewMode = () => setViewMode(v => (v === 'grid' ? 'list' : 'grid'));
  const handleTabChange = async v => {
    setActiveTab(v);
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
          <div className="flex justify-center items-center gap-3 mb-6">
            <Film className="h-8 w-8 text-accent animate-pulse-slow" />
            <h1 className="text-3xl font-bold text-white">Movies</h1>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
            <div className="flex justify-center mb-4">
              <TabsList>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="top_rated">Top Rated</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="release_date">Release Date</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>

              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Genre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genres</SelectItem>
                  <SelectItem value="28">Action</SelectItem>
                  <SelectItem value="35">Comedy</SelectItem>
                  {/* Add more genres */}
                </SelectContent>
              </Select>

              <MultiSelect
                options={platformOptions}
                selected={platformFilter}
                onChange={setPlatformFilter}
                placeholder="Platforms"
                showIcons
              />

              <Button variant="outline" size="sm" onClick={toggleViewMode}>
                {viewMode === 'grid' ? (
                  <><List /> List</>
                ) : (
                  <><Grid3X3 /> Grid</>
                )}
              </Button>
            </div>

            <TabsContent value="popular">
              {popularMoviesQuery.isLoading ? (
                <MediaGridSkeleton listView={viewMode === 'list'} />
              ) : (
                <>
                  <MediaGrid
                    media={ensureExtendedMediaArray(filteredPopular)}
                    title="Popular Movies"
                    listView={viewMode === 'list'}
                  />
                  {hasMorePopular && (
                    <div className="flex justify-center my-8">
                      <Button onClick={handleShowMorePopular} variant="outline">
                        {popularMoviesQuery.isFetching ? 'Loading...' : <><ChevronDown /> Show More</>}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="top_rated">
              {topRatedMoviesQuery.isLoading ? (
                <MediaGridSkeleton listView={viewMode === 'list'} />
              ) : (
                <>
                  <MediaGrid
                    media={ensureExtendedMediaArray(filteredTopRated)}
                    title="Top Rated Movies"
                    listView={viewMode === 'list'}
                  />
                  {hasMoreTopRated && (
                    <div className="flex justify-center my-8">
                      <Button onClick={handleShowMoreTopRated} variant="outline">
                        {topRatedMoviesQuery.isFetching ? 'Loading...' : <><ChevronDown /> Show More</>}
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
