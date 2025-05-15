import { useState, useEffect, Suspense, lazy } from 'react';
import {
  getTrending,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
} from '@/utils/api';
import { Media } from '@/utils/types';
import { useAuth } from '@/hooks';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ContentRow from '@/components/ContentRow';
import ContinueWatching from '@/components/ContinueWatching';
import Footer from '@/components/Footer';
import Spinner from '@/components/ui/spinner';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy-loaded secondary content
const SecondaryContent = lazy(() => import('./components/SecondaryContent'));

const Index = () => {
  const { user } = useAuth();
  const [trendingMedia, setTrendingMedia] = useState<Media[]>([]);
  const [popularMovies, setPopularMovies] = useState<Media[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<Media[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Media[]>([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [secondaryLoaded, setSecondaryLoaded] = useState(false);

  // Robust quality assignment ensuring all items have a badge
  const applyQuality = (items: Media[]) =>
    items.map(item => {
      console.log('Assigning quality for:', item.title || item.name, {
        hd: item.hd,
        video_source: item.video_source,
        backdrop_path: item.backdrop_path,
      });

      let quality = 'HD'; // default to HD

      if (typeof item.hd === 'boolean') {
        quality = item.hd ? 'HD' : 'CAM';
      } else if (item.video_source && typeof item.video_source === 'string') {
        quality = item.video_source.toLowerCase().includes('cam') ? 'CAM' : 'HD';
      } else if (item.backdrop_path) {
        quality = 'HD';
      } else {
        quality = 'CAM'; // fallback
      }

      return {
        ...item,
        quality,
      };
    });

  useEffect(() => {
    const fetchPrimaryData = async () => {
      try {
        const [
          trendingData,
          popularMoviesData,
          popularTVData,
          topMoviesData,
          topTVData,
        ] = await Promise.all([
          getTrending(),
          getPopularMovies(),
          getPopularTVShows(),
          getTopRatedMovies(),
          getTopRatedTVShows(),
        ]);

        const filteredTrendingData = trendingData.filter(item => item.backdrop_path);

        setTrendingMedia(applyQuality(filteredTrendingData));
        setPopularMovies(applyQuality(popularMoviesData));
        setPopularTVShows(applyQuality(popularTVData));
        setTopRatedMovies(applyQuality(topMoviesData));
        setTopRatedTVShows(applyQuality(topTVData));
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setIsLoading(false);
        setTimeout(() => setContentVisible(true), 100);
        setTimeout(() => setSecondaryLoaded(true), 1000);
      }
    };

    fetchPrimaryData();
  }, []);

  const RowSkeleton = () => (
    <div className="mb-8">
      <Skeleton className="h-8 w-48 mb-4" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="w-64 h-36 rounded-lg flex-shrink-0" />
        ))}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-background pb-16">
      <Navbar />
      <PWAInstallPrompt />

      {isLoading ? (
        <div className="flex flex-col gap-8 pt-24 px-6">
          <Skeleton className="w-full h-[60vh] rounded-lg" />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      ) : (
        <>
          <div className="pt-16">
            {trendingMedia.length > 0 && (
              <Hero media={trendingMedia.slice(0, 5)} className="hero" />
            )}
          </div>

          <div
            className={`mt-8 md:mt-12 transition-opacity duration-300 ${
              contentVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {user && <ContinueWatching />}
            <ContentRow title="Trending Now" media={trendingMedia} featured />
            <ContentRow title="Popular Movies" media={popularMovies} />
            <ContentRow title="Popular TV Shows" media={popularTVShows} />
            <ContentRow title="Top Rated Movies" media={topRatedMovies} />
            <ContentRow title="Top Rated TV Shows" media={topRatedTVShows} />

            {secondaryLoaded && (
              <Suspense
                fallback={
                  <div className="py-8">
                    <Spinner size="lg" className="mx-auto" />
                  </div>
                }
              >
                <SecondaryContent />
              </Suspense>
            )}
          </div>
        </>
      )}

      <Footer />
    </main>
  );
};

export default Index;
