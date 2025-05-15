// src/pages/Anime.tsx
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getPopularAnime, getTopRatedAnime } from '@/utils/api'; // <-- you need these API functions
import { Media, ensureExtendedMediaArray } from '@/utils/types';
import { trackMediaPreference } from '@/lib/analytics';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { MediaGridSkeleton } from '@/components/MediaSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronDown, Grid3X3, List } from 'lucide-react';
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
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'release_date' | 'rating'>('default');
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
          .filter(anime => !prev.some(p => p.id === (anime.id || anime.media_id)))
          .map(anime => ({
            ...anime,
            id: anime.id || anime.media_id || 0,
            media_id: anime.id || anime.media_id || 0,
            media_type: 'anime' as const,
          }));
        return [...prev, ...newAnime];
      });
    }
  }, [popularAnimeQuery.data]);

  useEffect(() => {
    if (topRatedAnimeQuery.data) {
      setAllTopRatedAnime(prev => {
        const newAnime = topRatedAnimeQuery.data
          .filter(anime => !prev.some(p => p.id === (anime.id || anime.media_id)))
          .map(anime => ({
            ...anime,
            id: anime.id || anime.media_id || 0,
            media_id: anime.id || anime.media_id || 0,
            media_type: 'anime' as const,
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

  // Filtering & sorting code same as Movies page
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

  const handleShowMorePopular = () => setPopularPage(prev => prev + 1);
  const handleShowMoreTopRated = () => setTopRatedPage(prev => prev + 1);

  const toggleViewMode = () => setViewMode(prev => prev === 'grid' ? 'list' : 'grid');

  const handleTabChange = (value: 'popular' | 'top_rated') => setActiveTab(value);

  const hasMorePopular = popularAnimeQuery.data?.length === ITEMS_PER_PAGE;
  const hasMoreTopRated = topRatedAnimeQuery.data?.length === ITEMS_PER_PAGE;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold text-white">Anime</h1>
            <div className="flex items-center gap-4">
              {/* Sorting and filtering controls same as movies page */}
              {/* Add your Select components here */}
            </div>
          </div>

          <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4">
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="top_rated">Top Rated</TabsTrigger>
            </TabsList>

            <TabsContent value="popular">
              {popularAnimeQuery.isLoading ? (
                <MediaGridSkeleton listView={viewMode === 'list'} />
              ) : popularAnimeQuery.isError ? (
                <div className="py-12 text-center text-white">Error loading anime.</div>
              ) : (
                <>
                  <MediaGrid media={ensureExtendedMediaArray(filteredPopularAnime)} title="Popular Anime" listView={viewMode === 'list'} />
                  {hasMorePopular && (
                    <Button onClick={handleShowMorePopular}>Show More</Button>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="top_rated">
              {topRatedAnimeQuery.isLoading ? (
                <MediaGridSkeleton listView={viewMode === 'list'} />
              ) : topRatedAnimeQuery.isError ? (
                <div className="py-12 text-center text-white">Error loading anime.</div>
              ) : (
                <>
                  <MediaGrid media={ensureExtendedMediaArray(filteredTopRatedAnime)} title="Top Rated Anime" listView={viewMode === 'list'} />
                  {hasMoreTopRated && (
                    <Button onClick={handleShowMoreTopRated}>Show More</Button>
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
