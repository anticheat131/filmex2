import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getPopularTVShows, getTopRatedTVShows, getTrendingTVShows } from '@/utils/api';
import { Media, ensureExtendedMediaArray } from '@/utils/types';
import MediaGrid from '@/components/MediaGrid';
import { MediaGridSkeleton } from '@/components/MediaSkeleton';
import ShowMoreButton from './ShowMoreButton';
import useFilteredShows from '../hooks/useFilteredShows';
import { useTranslation } from 'react-i18next';

const ITEMS_PER_PAGE = 20;
const MAX_PAGES = 20;

interface TabContentProps {
  type: 'popular' | 'top_rated' | 'trending';
  viewMode: 'grid' | 'list';
  sortBy: 'default' | 'name' | 'first_air_date' | 'rating';
  genreFilters: string[];
  yearFilter: string;
  platformFilters: string[];
}

const TabContent = ({ type, viewMode, sortBy, genreFilters, yearFilter, platformFilters }: TabContentProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [allShows, setAllShows] = useState<Media[]>([]);
  const [filteredShows, setFilteredShows] = useState<Media[]>([]);
  const fetchingMoreRef = useRef(false);

  // Determine which query to use based on type
  const getQueryFn = () => {
    switch (type) {
      case 'popular':
        return () => getPopularTVShows(page);
      case 'top_rated':
        return () => getTopRatedTVShows(page);
      case 'trending':
        return () => getTrendingTVShows('week'); // Change from number to 'week' string literal
      default:
        return () => getPopularTVShows(page);
    }
  };

  const showsQuery = useQuery({
    queryKey: [type === 'popular' ? 'popularTV' : type === 'top_rated' ? 'topRatedTV' : 'trendingTV', page],
    queryFn: getQueryFn(),
  });

  // Effect to update the collection of all shows when new data is fetched
  useEffect(() => {
    if (showsQuery.data) {
      console.log(`Raw ${type} TV Data:`, showsQuery.data);
      setAllShows(prev => {
        const newShows = showsQuery.data
          .filter(show => !prev.some(p => p.id === (show.id || show.media_id)))
          .map(show => {
            return {
              ...show,
              id: show.id || show.media_id || 0,
              media_id: show.id || show.media_id || 0,
              media_type: 'tv' as 'tv',
            };
          });
        return [...prev, ...newShows];
      });
    }
  }, [showsQuery.data, type]);

  // Helper to ensure at least 20 filtered shows
  const getAtLeastNFilteredShows = async (
    allShows: Media[],
    queryFn: (page: number) => Promise<Media[]>,
    page: number,
    filterFn: (shows: Media[]) => Media[],
    n: number
  ) => {
    let filtered = filterFn(allShows);
    let currentPage = page;
    let shows = [...allShows];
    let pagesWithoutNewShows = 0;
    while (filtered.length < n && pagesWithoutNewShows < MAX_PAGES) {
      currentPage += 1;
      const nextPageShows = await queryFn(currentPage);
      if (!nextPageShows.length) break;
      const newShows = nextPageShows.filter(show => !shows.some(s => s.id === (show.id || show.media_id)));
      if (newShows.length === 0) {
        pagesWithoutNewShows++;
        continue;
      }
      shows = [...shows, ...newShows];
      filtered = filterFn(shows);
    }
    return filtered.slice(0, n);
  };

  // Remove old useEffect for allShows/filter changes
  // Add new effect to force-fetch from page 1 on filter change
  useEffect(() => {
    let isActive = true;
    async function fetchFiltered() {
      let shows: Media[] = [];
      let filtered: Media[] = [];
      let currentPage = 1;
      let pagesWithoutNewShows = 0;
      while (filtered.length < 20 && pagesWithoutNewShows < MAX_PAGES) {
        let pageData: Media[] = [];
        switch (type) {
          case 'popular':
            pageData = await getPopularTVShows(currentPage);
            break;
          case 'top_rated':
            pageData = await getTopRatedTVShows(currentPage);
            break;
          case 'trending':
            pageData = await getTrendingTVShows('week', currentPage);
            break;
          default:
            pageData = await getPopularTVShows(currentPage);
        }
        const newShows = pageData.filter(show => !shows.some(s => s.id === (show.id || show.media_id)));
        if (newShows.length === 0) {
          pagesWithoutNewShows++;
          currentPage++;
          continue;
        }
        shows = [...shows, ...newShows];
        // Filtering logic (same as before)
        let temp = [...shows];
        if (genreFilters && genreFilters.length > 0) {
          if (genreFilters.length === 1) {
            temp = temp.filter(show => show.genre_ids?.includes(Number(genreFilters[0])));
          } else {
            temp = temp.filter(show => genreFilters.every(g => show.genre_ids?.includes(Number(g))));
          }
        }
        if (yearFilter && yearFilter !== 'all') {
          temp = temp.filter(show => show.first_air_date && show.first_air_date.startsWith(yearFilter));
        }
        if (platformFilters.length > 0) {
          temp = temp.filter(show =>
            platformFilters.some(platformId => {
              const platformIndex = platformId.length > 0 ? platformId.charCodeAt(0) % 8 : 0;
              return (show.id % 8) === platformIndex;
            })
          );
        }
        switch (sortBy) {
          case 'name':
            temp.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
          case 'first_air_date':
            temp.sort((a, b) => new Date(b.first_air_date || '').getTime() - new Date(a.first_air_date || '').getTime());
            break;
          case 'rating':
            temp.sort((a, b) => b.vote_average - a.vote_average);
            break;
          default:
            break;
        }
        filtered = temp;
        currentPage++;
      }
      if (isActive) {
        setFilteredShows(filtered.slice(0, 20));
        setAllShows(shows);
        setPage(currentPage - 1);
      }
    }
    fetchFiltered();
    return () => { isActive = false; };
    // Only run on filter/sort/type changes
  }, [genreFilters, yearFilter, platformFilters, sortBy, type]);

  // Prefetch next page
  useEffect(() => {
    if (showsQuery.data?.length === ITEMS_PER_PAGE) {
      queryClient.prefetchQuery({
        queryKey: [type === 'popular' ? 'popularTV' : type === 'top_rated' ? 'topRatedTV' : 'trendingTV', page + 1],
        queryFn: () => {
          switch (type) {
            case 'popular':
              return getPopularTVShows(page + 1);
            case 'top_rated':
              return getTopRatedTVShows(page + 1);
            case 'trending':
              return getTrendingTVShows('week'); // Change from number to 'week' string literal
            default:
              return getPopularTVShows(page + 1);
          }
        },
      });
    }
  }, [page, queryClient, showsQuery.data, type]);

  // Loading state handler
  if (showsQuery.isLoading) {
    return <MediaGridSkeleton listView={viewMode === 'list'} />;
  }

  // Error state handler
  if (showsQuery.isError) {
    return <div className="py-12 text-center text-white">{t('Error loading TV shows. Please try again.')}</div>;
  }

  // Determine if there are more shows to fetch
  const hasMoreShows = showsQuery.data?.length === ITEMS_PER_PAGE;

  // Determine the title based on the type
  const title = type === 'popular' 
    ? t('Popular TV Shows')
    : type === 'top_rated' 
      ? t('Top Rated TV Shows')
      : t('Trending TV Shows');

  return (
    <>
      <MediaGrid 
        media={ensureExtendedMediaArray(filteredShows)} 
        title={title} 
        listView={viewMode === 'list'} 
      />
      {hasMoreShows && (
        <ShowMoreButton 
          onClick={() => setPage(prev => prev + 1)}
          isLoading={showsQuery.isFetching}
        />
      )}
    </>
  );
};

export default TabContent;
