import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTrending } from '@/utils/api';
import { Media, ensureExtendedMediaArray } from '@/utils/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { MediaGridSkeleton } from '@/components/MediaSkeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { TrendingUp, ChevronDown } from 'lucide-react';

const ITEMS_PER_PAGE = 20;

const Trending = () => {
  const [timeWindow, setTimeWindow] = useState<'day' | 'week'>('week');
  const [page, setPage] = useState(1);
  const [scoredTrending, setScoredTrending] = useState<Media[]>([]);

  const trendingQuery = useQuery({
    queryKey: ['trending', timeWindow, page],
    queryFn: () => getTrending(timeWindow, page),
    keepPreviousData: true,
  });

  useEffect(() => {
    if (trendingQuery.data) {
      const validItems = trendingQuery.data.filter(
        (item) => item.poster_path && (item.release_date || item.first_air_date)
      );

      const now = Date.now();

      const scored = validItems
        .map(item => {
          const dateStr = item.release_date || item.first_air_date;
          const releaseDate = dateStr ? new Date(dateStr).getTime() : 0;
          const daysAgo = (now - releaseDate) / (1000 * 60 * 60 * 24);
          const recencyScore = Math.max(0, 100 - daysAgo); // newer is better
          const popularityScore = item.popularity || 0;
          const score = recencyScore * 1.5 + popularityScore;

          return {
            ...item,
            media_type: item.media_type as 'movie' | 'tv',
            _score: score,
          };
        })
        .sort((a, b) => b._score - a._score)
        .slice(0, page * ITEMS_PER_PAGE);

      setScoredTrending(scored);
    }
  }, [trendingQuery.data, page]);

  const handleShowMore = () => setPage(prev => prev + 1);
  const hasMore = trendingQuery.data?.length === ITEMS_PER_PAGE;

  const handleTimeWindowChange = (value: 'day' | 'week') => {
    setTimeWindow(value);
    setPage(1);
    setScoredTrending([]);
  };

  const extendedMedia = ensureExtendedMediaArray(scoredTrending);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="container px-4 py-8">
          <div className="flex items-center gap-3 mb-8 pt-10">
            <TrendingUp className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-bold text-white">Trending</h1>
          </div>

          <Tabs defaultValue="week" onValueChange={(value) => handleTimeWindowChange(value as 'day' | 'week')}>
            <TabsList className="mb-8">
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
            </TabsList>

            <TabsContent value="day">
              {trendingQuery.isLoading ? (
                <MediaGridSkeleton />
              ) : trendingQuery.isError ? (
                <div className="py-12 text-center text-white">Error loading trending content. Please try again.</div>
              ) : (
                <>
                  <MediaGrid media={extendedMedia} title="Trending Today" />
                  {hasMore && (
                    <div className="flex justify-center my-8">
                      <Button
                        onClick={handleShowMore}
                        variant="outline"
                        className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
                      >
                        {trendingQuery.isFetching ? (
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

            <TabsContent value="week">
              {trendingQuery.isLoading ? (
                <MediaGridSkeleton />
              ) : trendingQuery.isError ? (
                <div className="py-12 text-center text-white">Error loading trending content. Please try again.</div>
              ) : (
                <>
                  <MediaGrid media={extendedMedia} title="Trending This Week" />
                  {hasMore && (
                    <div className="flex justify-center my-8">
                      <Button
                        onClick={handleShowMore}
                        variant="outline"
                        className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
                      >
                        {trendingQuery.isFetching ? (
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Trending;
