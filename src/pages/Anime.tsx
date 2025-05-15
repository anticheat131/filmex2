import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getPopularAnime, getTopRatedAnime } from '@/utils/api';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ITEMS_PER_PAGE = 20;

const Anime = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'popular' | 'top_rated'>('popular');
  const [popularPage, setPopularPage] = useState(1);
  const [topRatedPage, setTopRatedPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [allPopularAnime, setAllPopularAnime] = useState<Media[]>([]);
  const [allTopRatedAnime, setAllTopRatedAnime] = useState<Media[]>([]);
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'first_air_date' | 'rating'>('default');
  const [genreFilter, setGenreFilter] = useState<string>('all');

  const popularAnimeQuery = useQuery({
    queryKey: ['popularAnime', popularPage],
    queryFn: () => getPopularAnime(popularPage),
    placeholderData: keepPreviousData,
  });

  const topRatedAnimeQuery = useQuery({
    queryKey: ['topRatedAnime', topRatedPage],
    queryFn: () => getTopRatedAnime(topRatedPage),
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (popularAnimeQuery.data) {
      setAllPopularAnime(prev => {
        const newAnime = popularAnimeQuery.data
          .filter(item => !prev.some(p => p.id === (item.id || item.media_id)))
          .map(item => ({
            ...item,
            id: item.id || item.media_id || 0,
            media_id: item.id || item.media_id || 0,
            media_type: 'tv' as const,
          }));
        return [...prev, ...newAnime];
      });
    }
  }, [popularAnimeQuery.data]);

  useEffect(() => {
    if (topRatedAnimeQuery.data) {
      setAllTopRatedAnime(prev => {
        const newAnime = topRatedAnimeQuery.data
          .filter(item => !prev.some(p => p.id === (item.id || item.media_id)))
          .map(item => ({
            ...item,
            id: item.id || item.media_id || 0,
            media_id: item.id || item.media_id || 0,
            media_type: 'tv' as const,
          }));
        return [...prev, ...newAnime];
      });
    }
  }, [topRatedAnimeQuery.data]);

  useEffect(() => {
    if (popularAnimeQuery.data?.length === ITEMS_PER_PAGE) {
      queryClient.prefetchQuery({
        queryKey: ['popularAnime', popularPage + 1],
        queryFn: () => getPopularAnime(popularPage + 1),
      });
    }
  }, [popularPage, queryClient, popularAnimeQuery.data]);

  useEffect(() => {
    if (topRatedAnimeQuery.data?.length === ITEMS_PER_PAGE) {
      queryClient.prefetchQuery({
        queryKey: ['topRatedAnime', topRatedPage + 1],
        queryFn: () => getTopRatedAnime(topRatedPage + 1),
      });
    }
  }, [topRatedPage, queryClient, topRatedAnimeQuery.data]);

  const applyFiltersAndSort = (anime: Media[]) => {
    let filteredAnime = [...anime];

    if (genreFilter !== 'all') {
      filteredAnime = filteredAnime.filter(item =>
        item.genre_ids?.includes(parseInt(genreFilter))
      );
    }

    switch (sortBy) {
      case 'title':
        filteredAnime.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'first_air_date':
        filteredAnime.sort((a, b) =>
          new Date(b.first_air_date).getTime() - new Date(a.first_air_date).getTime()
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
    await trackMediaPreference('tv', 'select'); // since anime is TV type
  };

  const hasMorePopular = popularAnimeQuery.data?.length === ITEMS_PER_PAGE;
  const hasMoreTopRated = topRatedAnimeQuery.data?.length === ITEMS_PER_PAGE;

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
                onValueChange={(value: 'default' | 'title' | 'first_air_date' | 'rating') =>
                  setSortBy(value)
                }
              >
                <SelectTrigger className="w-[180px] border-white/10 text-white bg-transparent">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10 text-white">
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="first_air_date">First Air Date</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>

              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className="w-[180px] border-white/10 text-white bg-transparent">
                  <SelectValue placeholder="Filter by Genre" />
                </SelectTrigger>
                <SelectContent className="bg-background border-white/10 text-white">
                  <SelectItem value="all">All Genres</SelectItem>
                  {/* Add anime-specific genres here if needed */}
                  <SelectItem value="16">Animation</SelectItem>
                  <SelectItem value="10759">Action & Adventure</SelectItem>
                  <SelectItem value="35">Comedy</SelectItem>
                  <SelectItem value="80">Crime</SelectItem>
                  <SelectItem value="99">Documentary</SelectItem>
                  <SelectItem value="18">Drama</SelectItem>
                  <SelectItem value="10762">Kids</SelectItem>
                  <SelectItem value="9648">Mystery</SelectItem>
                  <SelectItem value="10763">News</SelectItem>
                  <SelectItem value="10764">Reality</SelectItem>
                  <SelectItem value="10765">Sci-Fi & Fantasy</SelectItem>
                  <SelectItem value="10766">Soap</SelectItem>
                  <SelectItem value="10767">Talk</SelectItem>
                  <SelectItem value="10768">War & Politics</SelectItem>
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
