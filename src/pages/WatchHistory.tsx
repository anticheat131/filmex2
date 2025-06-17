import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History, Clock, Trash2, Bookmark, Heart, Loader2 } from 'lucide-react';
import { useWatchHistory } from '@/hooks/watch-history';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/hooks';
import { useTranslation } from 'react-i18next';

const WatchHistory = () => {
  const { t } = useTranslation();
  const { 
    watchHistory, 
    clearWatchHistory, 
    favorites, 
    watchlist, 
    deleteWatchHistoryItem, 
    deleteSelectedWatchHistory,
    deleteFavoriteItem,
    deleteSelectedFavorites,
    deleteWatchlistItem,
    deleteSelectedWatchlist,
    removeFromFavorites,
    removeFromWatchlist,
    hasMore,
    isLoading,
    loadMore 
  } = useWatchHistory();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [activeTab, setActiveTab] = useState<'history' | 'favorites' | 'watchlist'>('history');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loader = useRef(null);

  const handleLoadMore = useCallback(async () => {
    setIsLoadingMore(true);
    await loadMore();
    setIsLoadingMore(false);
  }, [loadMore]);

  useEffect(() => {
    const currentLoader = loader.current;
    const currentObserver = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !isLoadingMore && activeTab === 'history') {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (currentLoader) {
      currentObserver.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        currentObserver.unobserve(currentLoader);
      }
    };
  }, [hasMore, isLoadingMore, activeTab, handleLoadMore]);

  useEffect(() => {
    // Set active tab based on path
    if (location.pathname === '/favorites') setActiveTab('favorites');
    else if (location.pathname === '/watchlist') setActiveTab('watchlist');
    else setActiveTab('history');
  }, [location.pathname]);

  const handleClearHistory = () => {
    clearWatchHistory();
    toast({
      title: t("Watch history cleared"),
      description: t("Your watch history has been cleared."),
    });
  };

  const handleDeleteWatchHistoryItem = (id: string) => {
    deleteWatchHistoryItem(id);
  };

  const handleDeleteSelectedWatchHistory = (ids: string[]) => {
    deleteSelectedWatchHistory(ids);
  };

  const handleDeleteFavoriteItem = (id: string) => {
    deleteFavoriteItem(id);
  };

  const handleDeleteSelectedFavorites = (ids: string[]) => {
    deleteSelectedFavorites(ids);
  };

  const handleDeleteWatchlistItem = (id: string) => {
    deleteWatchlistItem(id);
  };

  const handleDeleteSelectedWatchlist = (ids: string[]) => {
    deleteSelectedWatchlist(ids);
  };

  // Sort watch history based on selected option (only for current page)
  const sortedWatchHistory = [...watchHistory].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
  });

  // Convert watch history items to Media format for the MediaGrid
  const watchHistoryMedia = sortedWatchHistory.map(item => ({
    id: item.media_id, // Use media_id for navigation
    media_id: item.media_id,
    title: item.title,
    name: item.title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: item.overview || '',
    vote_average: item.rating || 0,
    media_type: item.media_type,
    genre_ids: [],
    // Additional watch info to display
    watch_position: item.watch_position,
    duration: item.duration,
    created_at: item.created_at,
    docId: item.id // Store document ID separately for deletion
  }));

  // Convert favorites to Media format
  const favoritesMedia = favorites.map(item => ({
    id: item.media_id,  // Use media_id for navigation
    media_id: item.media_id,
    title: item.title,
    name: item.title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: item.overview || '',
    vote_average: item.rating || 0,
    media_type: item.media_type,
    genre_ids: [],
    added_at: item.added_at,
    docId: item.id  // Store document ID separately for deletion
  }));

  // Convert watchlist to Media format
  const watchlistMedia = watchlist.map(item => ({
    id: item.media_id,  // Use media_id for navigation
    media_id: item.media_id,
    title: item.title,
    name: item.title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: item.overview || '',
    vote_average: item.rating || 0,
    media_type: item.media_type,
    genre_ids: [],
    added_at: item.added_at,
    docId: item.id  // Store document ID separately for deletion
  }));

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'history' | 'favorites' | 'watchlist');
  };

  const handleItemRemove = (mediaId: number, mediaType: 'movie' | 'tv') => {
    if (activeTab === 'favorites') {
      removeFromFavorites(mediaId, mediaType);
      toast({
        title: t("Removed from favorites"),
        description: t("The item has been removed from your favorites.")
      });
    } else if (activeTab === 'watchlist') {
      removeFromWatchlist(mediaId, mediaType);
      toast({
        title: t("Removed from watchlist"),
        description: t("The item has been removed from your watchlist.")
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="relative flex-1 py-4">
        <div className="container space-y-8">
          <div className="md:mb-24 md:mt-12">
            <h1 className="mb-2 text-2xl font-medium">{t('Watch History')}</h1>
            <p className="max-w-3xl text-muted-foreground">{t('View and manage your watch history, favorites, and watchlist in one place.')}</p>
          </div>
          
          <motion.div 
            className="glass p-6 rounded-lg mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center">
                {activeTab === 'history' && <History className="h-6 w-6 mr-3 text-accent" />}
                {activeTab === 'favorites' && <Heart className="h-6 w-6 mr-3 text-accent" />}
                {activeTab === 'watchlist' && <Bookmark className="h-6 w-6 mr-3 text-accent" />}
                <h1 className="text-2xl font-bold text-white">
                  {activeTab === 'history' && t('Your Watch History')}
                  {activeTab === 'favorites' && t('Your Favorites')}
                  {activeTab === 'watchlist' && t('Your Watchlist')}
                </h1>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {activeTab === 'history' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                    className="border-white/20 bg-black/50 text-white hover:bg-black/70"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {sortOrder === 'newest' ? t('Newest First') : t('Oldest First')}
                  </Button>
                )}
                
                {activeTab === 'history' && watchHistory.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearHistory}
                    className="border-white/20 bg-black/50 text-white hover:bg-black/70"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('Clear History')}
                  </Button>
                )}
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4 bg-black/20 border border-white/10">
                <TabsTrigger value="history" className="data-[state=active]:bg-accent">
                  <History className="h-4 w-4 mr-2" />
                  {t('History')}
                </TabsTrigger>
                <TabsTrigger value="favorites" className="data-[state=active]:bg-accent">
                  <Heart className="h-4 w-4 mr-2" />
                  {t('Favorites')}
                </TabsTrigger>
                <TabsTrigger value="watchlist" className="data-[state=active]:bg-accent">
                  <Bookmark className="h-4 w-4 mr-2" />
                  {t('Watchlist')}
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="history" className="mt-0">
                {watchHistory.length > 0 ? (
                  <>
                    <MediaGrid 
                      media={watchHistoryMedia} 
                      listView
                      selectable
                      onDelete={handleDeleteWatchHistoryItem}
                      onDeleteSelected={handleDeleteSelectedWatchHistory}
                    />
                    {(hasMore || isLoadingMore) && (
                      <div 
                        ref={loader}
                        className="w-full flex justify-center py-4"
                      >
                        <Loader2 className="h-6 w-6 animate-spin text-accent" />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="glass p-8 rounded-lg text-center">
                    <History className="h-12 w-12 mx-auto mb-4 text-white/50" />
                    <h3 className="text-lg font-medium text-white mb-2">{t('No watch history yet')}</h3>
                    <p className="text-white/70 mb-4">
                      {t('Start watching movies and shows to build your history.')}
                    </p>
                    <Button onClick={() => navigate('/')}>
                      {t('Browse Content')}
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="favorites" className="mt-0">
                {favorites.length > 0 ? (
                  <MediaGrid 
                    media={favoritesMedia} 
                    listView
                    selectable
                    onDelete={handleDeleteFavoriteItem}
                    onDeleteSelected={handleDeleteSelectedFavorites}
                  />
                ) : (
                  <div className="glass p-8 rounded-lg text-center">
                    <Heart className="h-12 w-12 mx-auto mb-4 text-white/50" />
                    <h3 className="text-lg font-medium text-white mb-2">{t('No favorites yet')}</h3>
                    <p className="text-white/70 mb-4">
                      {t('Add movies and shows to your favorites for quick access.')}
                    </p>
                    <Button onClick={() => navigate('/')}>
                      {t('Browse Content')}
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="watchlist" className="mt-0">
                {watchlist.length > 0 ? (
                  <MediaGrid 
                    media={watchlistMedia} 
                    listView
                    selectable
                    onDelete={handleDeleteWatchlistItem}
                    onDeleteSelected={handleDeleteSelectedWatchlist}
                  />
                ) : (
                  <div className="glass p-8 rounded-lg text-center">
                    <Bookmark className="h-12 w-12 mx-auto mb-4 text-white/50" />
                    <h3 className="text-lg font-medium text-white mb-2">{t('Your watchlist is empty')}</h3>
                    <p className="text-white/70 mb-4">
                      {t('Add movies and shows to your watchlist to watch later.')}
                    </p>
                    <Button onClick={() => navigate('/')}>
                      {t('Browse Content')}
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WatchHistory;
