import { useState, useEffect, Suspense, lazy } from 'react';
import {
  getTrending,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getTopRatedTVShows,
  getNetflixContent,
  getHuluContent,
  getPrimeContent,
  getParamountContent,
  getDisneyContent,
  getHotstarContent,
  getAppleTVContent,
  getJioCinemaContent,
  getSonyLivContent,
  getHBOMaxContent,
  getPeacockContent,
  getNetflixTVContent,
  getHuluTVContent,
  getPrimeTVContent,
  getParamountTVContent,
  getDisneyTVContent,
  getHotstarTVContent,
  getAppleTVTVContent,
  getJioCinemaTVContent,
  getSonyLivTVContent,
  getHBOMaxTVContent,
  getPeacockTVContent,
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
import { STREAMING_PLATFORMS } from './tv/constants/streamingPlatforms';
import PlatformBar from './tv/components/PlatformBar';
import TrendingToday from '@/components/TrendingToday';
import TrendingTodayTV from '@/components/TrendingTodayTV';

const SecondaryContent = lazy(() => import('./components/SecondaryContent'));

const Index = () => {
  const { user } = useAuth();
  const [sliderMedia, setSliderMedia] = useState<Media[]>([]);
  const [trendingMedia, setTrendingMedia] = useState<Media[]>([]);
  const [popularMovies, setPopularMovies] = useState<Media[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<Media[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Media[]>([]);
  const [topRatedTVShows, setTopRatedTVShows] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [secondaryLoaded, setSecondaryLoaded] = useState(false);
  // Replace single platformFilter with multi-select
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);

  // Platform-specific content state
  const [netflixContent, setNetflixContent] = useState<Media[]>([]);
  const [huluContent, setHuluContent] = useState<Media[]>([]);
  const [primeContent, setPrimeContent] = useState<Media[]>([]);
  const [paramountContent, setParamountContent] = useState<Media[]>([]);
  const [disneyContent, setDisneyContent] = useState<Media[]>([]);
  const [hotstarContent, setHotstarContent] = useState<Media[]>([]);
  const [appleTVContent, setAppleTVContent] = useState<Media[]>([]);
  const [jioCinemaContent, setJioCinemaContent] = useState<Media[]>([]);
  const [sonyLivContent, setSonyLivContent] = useState<Media[]>([]);
  const [hboMaxContent, setHBOMaxContent] = useState<Media[]>([]);
  const [peacockContent, setPeacockContent] = useState<Media[]>([]);

  const applyQuality = (items: Media[]) =>
    items.map(item => {
      let quality = 'HD';
      if (!item.backdrop_path) {
        quality = 'CAM';
      }
      return { ...item, quality };
    });

  useEffect(() => {
    const fetchSliderMedia = async () => {
      try {
        const [popularMoviesData, popularTVData] = await Promise.all([
          getPopularMovies(),
          getPopularTVShows(),
        ]);

        const combined = [...popularMoviesData, ...popularTVData]
          .filter(item => item.backdrop_path)
          .sort((a, b) => {
            const dateA = new Date(a.release_date || a.first_air_date).getTime();
            const dateB = new Date(b.release_date || b.first_air_date).getTime();
            return dateB - dateA;
          });

        setSliderMedia(applyQuality(combined.slice(0, 5)));
      } catch (error) {
        console.error('Failed fetching slider media:', error);
      }
    };

    fetchSliderMedia();
  }, []);

  const [trendingMovies, setTrendingMovies] = useState<Media[]>([]);
  const [trendingTV, setTrendingTV] = useState<Media[]>([]);

  useEffect(() => {
    const fetchPrimaryData = async () => {
      try {
        // Fetch multiple pages of trending for even more content
        const [
          trendingDataPage1,
          trendingDataPage2,
          trendingDataPage3,
          trendingDataPage4,
          trendingDataPage5,
          popularMoviesData,
          popularTVData,
          topMoviesData,
          topTVData,
        ] = await Promise.all([
          getTrending('week', 1),
          getTrending('week', 2),
          getTrending('week', 3),
          getTrending('week', 4),
          getTrending('week', 5),
          getPopularMovies(),
          getPopularTVShows(),
          getTopRatedMovies(),
          getTopRatedTVShows(),
        ]);

        // Combine pages and remove duplicates by id
        const trendingData = [
          ...trendingDataPage1,
          ...trendingDataPage2,
          ...trendingDataPage3,
          ...trendingDataPage4,
          ...trendingDataPage5
        ].filter((item, index, self) =>
          index === self.findIndex((t) => t.id === item.id && t.media_type === item.media_type)
        );

        const filteredTrendingData = trendingData
          .filter(item => item.backdrop_path)
          .sort((a, b) => {
            const dateA = new Date(a.release_date || a.first_air_date).getTime();
            const dateB = new Date(b.release_date || b.first_air_date).getTime();
            return dateB - dateA;
          });

        // Split trending into movies and TV, limit each to the last 40
        const trendingMoviesArr = filteredTrendingData.filter(m => m.media_type === 'movie').slice(-40);
        const trendingTVArr = filteredTrendingData.filter(m => m.media_type === 'tv').slice(-40);
        setTrendingMovies(applyQuality(trendingMoviesArr));
        setTrendingTV(applyQuality(trendingTVArr));
        setTrendingMedia(applyQuality(filteredTrendingData)); // If still needed elsewhere
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

  // Fetch platform-specific content
  useEffect(() => {
    const fetchPlatformContent = async () => {
      try {
        // Fetch both movies and TV for each platform, combine, and set
        const [netflixMovies, netflixTV] = await Promise.all([
          getNetflixContent(), getNetflixTVContent()
        ]);
        setNetflixContent(applyQuality([...netflixMovies, ...netflixTV]));

        const [huluMovies, huluTV] = await Promise.all([
          getHuluContent(), getHuluTVContent()
        ]);
        setHuluContent(applyQuality([...huluMovies, ...huluTV]));

        const [primeMovies, primeTV] = await Promise.all([
          getPrimeContent(), getPrimeTVContent()
        ]);
        setPrimeContent(applyQuality([...primeMovies, ...primeTV]));

        const [paramountMovies, paramountTV] = await Promise.all([
          getParamountContent(), getParamountTVContent()
        ]);
        setParamountContent(applyQuality([...paramountMovies, ...paramountTV]));

        const [disneyMovies, disneyTV] = await Promise.all([
          getDisneyContent(), getDisneyTVContent()
        ]);
        setDisneyContent(applyQuality([...disneyMovies, ...disneyTV]));

        const [hotstarMovies, hotstarTV] = await Promise.all([
          getHotstarContent(), getHotstarTVContent()
        ]);
        setHotstarContent(applyQuality([...hotstarMovies, ...hotstarTV]));

        const [appleMovies, appleTVShows] = await Promise.all([
          getAppleTVContent(), getAppleTVTVContent()
        ]);
        setAppleTVContent(applyQuality([...appleMovies, ...appleTVShows]));

        const [jioMovies, jioTV] = await Promise.all([
          getJioCinemaContent(), getJioCinemaTVContent()
        ]);
        setJioCinemaContent(applyQuality([...jioMovies, ...jioTV]));

        const [sonyMovies, sonyTV] = await Promise.all([
          getSonyLivContent(), getSonyLivTVContent()
        ]);
        setSonyLivContent(applyQuality([...sonyMovies, ...sonyTV]));

        const [hboMovies, hboTV] = await Promise.all([
          getHBOMaxContent(), getHBOMaxTVContent()
        ]);
        setHBOMaxContent(applyQuality([...hboMovies, ...hboTV]));

        const [peacockMovies, peacockTV] = await Promise.all([
          getPeacockContent(), getPeacockTVContent()
        ]);
        setPeacockContent(applyQuality([...peacockMovies, ...peacockTV]));
      } catch (error) {
        console.error('Error fetching platform content:', error);
      }
    };
    fetchPlatformContent();
  }, []);

  // Add RowSkeleton definition
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
    <main className="min-h-screen pb-16">
      <Navbar />
      <PWAInstallPrompt />
      {isLoading ? (
        <div className="flex flex-col gap-8 pt-24 px-6">
          <Skeleton className="w-full h-[60vh] rounded-lg" />
          <RowSkeleton />
          <RowSkeleton />
        </div>
      ) : (
        <div
          className="mx-auto mt-8 md:mt-12 transition-opacity duration-300 px-6"
          style={{
            maxWidth: '1440px',
          }}
        >
          <div
            className={`${contentVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          >
            {/* Always show hero/featured section */}
            <div className="pt-16">
              {sliderMedia.length > 0 && (
                <Hero
                  media={sliderMedia}
                  className="mb-8 md:mb-12 rounded-xl"
                />
              )}
            </div>
            {/* Platform filter UI above Trending Now */}
            <div className="flex flex-col items-center mb-8 mt-8 w-full">
              <span className="text-white text-lg font-semibold mb-3 px-5 py-2 rounded-xl bg-black/40 border border-white/10 shadow-sm backdrop-blur-md" style={{letterSpacing: '.01em'}}>Browse by Platform</span>
              <div className="w-full md:w-auto mt-0">
                <PlatformBar platformFilters={platformFilters} setPlatformFilters={setPlatformFilters} />
              </div>
            </div>
            {/* Show selected platform content row(s) above Trending Now */}
            {platformFilters.length > 0 && (
              <>
                {platformFilters.includes('netflix') && netflixContent.length > 0 && (
                  <ContentRow title="Netflix" media={netflixContent} />
                )}
                {platformFilters.includes('hulu') && huluContent.length > 0 && (
                  <ContentRow title="Hulu" media={huluContent} />
                )}
                {platformFilters.includes('prime') && primeContent.length > 0 && (
                  <ContentRow title="Prime Video" media={primeContent} />
                )}
                {platformFilters.includes('paramount') && paramountContent.length > 0 && (
                  <ContentRow title="Paramount+" media={paramountContent} />
                )}
                {platformFilters.includes('disney') && disneyContent.length > 0 && (
                  <ContentRow title="Disney+" media={disneyContent} />
                )}
                {platformFilters.includes('hotstar') && hotstarContent.length > 0 && (
                  <ContentRow title="Hotstar" media={hotstarContent} />
                )}
                {platformFilters.includes('apple') && appleTVContent.length > 0 && (
                  <ContentRow title="Apple TV+" media={appleTVContent} />
                )}
                {platformFilters.includes('jio') && jioCinemaContent.length > 0 && (
                  <ContentRow title="JioCinema" media={jioCinemaContent} />
                )}
                {platformFilters.includes('sonyliv') && sonyLivContent.length > 0 && (
                  <ContentRow title="SonyLiv" media={sonyLivContent} />
                )}
                {platformFilters.includes('hbo') && hboMaxContent.length > 0 && (
                  <ContentRow title="HBO Max" media={hboMaxContent} />
                )}
                {platformFilters.includes('peacock') && peacockContent.length > 0 && (
                  <ContentRow title="Peacock" media={peacockContent} />
                )}
                {/* Show a message if a selected platform has no content */}
                {platformFilters.some(
                  pf =>
                    (pf === 'hbo' && hboMaxContent.length === 0) ||
                    (pf === 'prime' && primeContent.length === 0) ||
                    (pf === 'peacock' && peacockContent.length === 0)
                ) && (
                  <div className="text-center text-gray-400 py-8">
                    No content available for the selected platform(s) at this time.<br />
                    This is a limitation of the data source (TMDB), not a bug.
                  </div>
                )}
              </>
            )}
            {/* Trending Now section below Platform Bar and selected platform rows */}
            {/* Trending Now Movies and TV Shows */}
            <ContentRow title="Trending Now Movies" media={trendingMovies} featured />
            {/* Trending Today Movies and TV Shows */}
            <TrendingToday />
            {/* Trending Now TV Shows below TrendingToday Movies */}
            <ContentRow title="Trending Now TV Shows" media={trendingTV} featured />
            <TrendingTodayTV />
            {/* Remove big hero-style grid */}
            {/* Show a row for each selected platform that has content. If none selected, show nothing extra. */}
            {platformFilters.length > 0 && (
              <>
                {platformFilters.includes('netflix') && netflixContent.length > 0 && (
                  <ContentRow title="Netflix" media={netflixContent} />
                )}
                {platformFilters.includes('hulu') && huluContent.length > 0 && (
                  <ContentRow title="Hulu" media={huluContent} />
                )}
                {platformFilters.includes('prime') && primeContent.length > 0 && (
                  <ContentRow title="Prime Video" media={primeContent} />
                )}
                {platformFilters.includes('paramount') && paramountContent.length > 0 && (
                  <ContentRow title="Paramount+" media={paramountContent} />
                )}
                {platformFilters.includes('disney') && disneyContent.length > 0 && (
                  <ContentRow title="Disney+" media={disneyContent} />
                )}
                {platformFilters.includes('hotstar') && hotstarContent.length > 0 && (
                  <ContentRow title="Hotstar" media={hotstarContent} />
                )}
                {platformFilters.includes('apple') && appleTVContent.length > 0 && (
                  <ContentRow title="Apple TV+" media={appleTVContent} />
                )}
                {platformFilters.includes('jio') && jioCinemaContent.length > 0 && (
                  <ContentRow title="JioCinema" media={jioCinemaContent} />
                )}
                {platformFilters.includes('sonyliv') && sonyLivContent.length > 0 && (
                  <ContentRow title="SonyLiv" media={sonyLivContent} />
                )}
                {platformFilters.includes('hbo') && hboMaxContent.length > 0 && (
                  <ContentRow title="HBO Max" media={hboMaxContent} />
                )}
                {platformFilters.includes('peacock') && peacockContent.length > 0 && (
                  <ContentRow title="Peacock" media={peacockContent} />
                )}
                {/* Show a message if a selected platform has no content */}
                {platformFilters.some(
                  pf =>
                    (pf === 'hbo' && hboMaxContent.length === 0) ||
                    (pf === 'prime' && primeContent.length === 0) ||
                    (pf === 'peacock' && peacockContent.length === 0)
                ) && (
                  <div className="text-center text-gray-400 py-8">
                    No content available for the selected platform(s) at this time.<br />
                    This is a limitation of the data source (TMDB), not a bug.
                  </div>
                )}
              </>
            )}
            {/* If no content for selected platform, show nothing extra. If multiple platforms are selected, show nothing extra. */}
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
};

export default Index;
