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
const ANIME_GENRE_ID = 16; // TMDB genre ID for Animation/Anime

const Anime = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'popular' | 'top_rated'>('popular');
  const [popularPage, setPopularPage] = useState(1);
  const [topRatedPage, setTopRatedPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [allPopularAnime, setAllPopularAnime] = useState<Media[]>([]);
  const [allTopRatedAnime, setAllTopRatedAnime] = useState<Media[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'release_date' | 'rating'>('default');
  const [genreFilter, setGenreFilter] = useState<string>('all');

  const popularAnimeQuery = useQuery({
    queryKey: ['popularMovies', popularPage], // Reusing movie query key since we fetch from same API
    queryFn: () => getPopularMovies(popularPage),
    placeholderData: keepPreviousData,
  });

  const topRatedAnimeQuery = useQuery({
    queryKey: ['topRatedMovies', topRatedPage],
    queryFn: () => getTopRatedMovies(topRatedPage),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (popularAnimeQuery.data) {
      setAllPopularAnime(prev => {
        const filtered = popularAnimeQuery.data.filter(movie =>
          movie.genre_ids?.includes(ANIME_GENRE_ID)
        );
        const newAnime = filtered
          .filter(movie => !prev.some(p => p.id === (movie.id || movie.media_id)))
          .map(movie => ({
            ...movie,
            id: movie.id || movie.media_id || 0,
            media_id: movie.id || movie.media_id || 0,
            media_type: 'movie' as const,
          }));
        return [...prev, ...newAnime];
      });
    }
  }, [popularAnimeQuery.data]);

  useEffect(() => {
    if (topRatedAnimeQuery.data) {
      setAllTopRatedAnime(prev => {
        const filtered = topRatedAnimeQuery.data.filter(movie =>
          movie.genre_ids?.includes(ANIME_GENRE_ID)
        );
        const newAnime = filtered
          .filter(movie => !prev.some(p => p.id === (movie.id || movie.media_id)))
          .map(movie => ({
            ...movie,
            id: movie.id || movie.media_id || 0,
            media_id: movie.id || movie.media_id || 0,
            media_type: 'movie' as const,
          }));
        return [...prev, ...newAnime];
      });
    }
  }, [topRatedAnimeQuery.data]);

  useEffect(() => {
    if (popularAnimeQuery.data?.length === ITEMS_PER_PAGE) {
      queryClient.prefetchQuery({
        queryKey: ['popularMovies', popularPage + 1],
        queryFn: () => getPopularMovies(popularPage + 1),
      });
    }
  }, [popularPage, queryClient, popularAnimeQuery.data]);

  useEffect(() => {
    if (topRatedAnimeQuery.data?.length === ITEMS_PER_PAGE) {
      queryClient.prefetchQuery({
        queryKey: ['topRatedMovies', topRatedPage + 1],
        queryFn: () => getTopRatedMovies(topRatedPage + 1),
      });
    }
  }, [topRatedPage, queryClient, topRatedAnimeQuery.data]);

  const applyFiltersAndSort = (anime: Media[]) => {
    let filteredAnime = [...anime];

    if (genreFilter !== 'all') {
      filteredAnime = filteredAnime.filter(a =>
        a.genre_ids?.includes(parseInt(genreFilter))
      );
    }

    switch (sortBy) {
      case 'title':
        filteredAnime.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'release_date':
        filteredAnime.sort((a, b) =>
          new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
        );
        break;
      case 'rating':
        filteredAnime.sort((a, b) => b.vote_average - a.vote_average);
        break;
      default:
        break;
    }

    return filteredAnime;
  };

  const filteredPopularAnime = applyFiltersAndSort(allPopularAnime);
  const filteredTopRatedAnime = applyFiltersAndSort(allTopRatedAnime);

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
    await trackMediaPreference('movie', 'select'); // tracking as 'movie' since same API source
  };

  const hasMorePopular = popularAnimeQuery.data?.length === ITEMS_PER_PAGE;
  const hasMoreTopRated = topRatedAnimeQuery.data?.length === ITEMS_PER_PAGE;

  // Track initial page visit
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
              <h1 className="text-3xl font-bold text-white">Anime</h1>
            </div>

            <div className="flex items-center gap-4 pt-6">
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

              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-[180px] border-white/10 text-white bg-transparent">
                  <SelectValue placeholder="Filter by Genre" />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10 text-white">
                  <SelectItem value="all">All Genres</SelectItem>
                  {/* You can extend anime genre list here */}
                  <SelectItem value="16">Animation</SelectItem>
                  {/* Add more if you have specific anime-related genres */}
                </SelectContent>
              </Select>

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
            <TabsTrigger value="popular" className="data-[state=active]:bg-accent/20">Popular</TabsTrigger>
            <TabsTrigger value="top_rated" className="data-[state=active]:bg-accent/20">Top Rated</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="popular" className="focus-visible:outline-none animate-fade-in">
          {popularAnimeQuery.isLoading ? (
            <MediaGridSkeleton listView={viewMode === 'list'} />
          ) : popularAnimeQuery.isError ? (
            <div className="py-12 text-center text-white">Error loading anime. Please try again.</div>
          ) : (
            <>
              <MediaGrid media={ensureExtendedMediaArray(filteredPopularAnime)} title="Popular Anime" listView={viewMode === 'list'} />

              {hasMorePopular && (
                <div className="flex justify-center my-8">
                  <Button
                    onClick={handleShowMorePopular}
                    variant="outline"
                    className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
                  >
                    {popularAnimeQuery.isFetching ? (
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
          {topRatedAnimeQuery.isLoading ? (
            <MediaGridSkeleton listView={viewMode === 'list'} />
          ) : topRatedAnimeQuery.isError ? (
            <div className="py-12 text-center text-white">Error loading anime. Please try again.</div>
          ) : (
            <>
              <MediaGrid media={ensureExtendedMediaArray(filteredTopRatedAnime)} title="Top Rated Anime" listView={viewMode === 'list'} />

              {hasMoreTopRated && (
                <div className="flex justify-center my-8">
                  <Button
                    onClick={handleShowMoreTopRated}
                    variant="outline"
                    className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
                  >
                    {topRatedAnimeQuery.isFetching ? (
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

export default Anime;
