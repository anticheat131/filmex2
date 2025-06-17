import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks';
import { useWatchHistory } from '@/hooks/watch-history';
import { useUserPreferences } from '@/hooks/user-preferences';
import { User, Settings, Check, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGrid from '@/components/MediaGrid';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import AccentColorPicker from '@/components/AccentColorPicker';
import { videoSources } from '@/utils/video-sources';
import { auth } from '@/lib/firebase';
import { updateProfile, deleteUser } from 'firebase/auth';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { watchHistory, favorites, watchlist, clearWatchHistory, hasMore, isLoading, loadMore, deleteFavoriteItem, deleteWatchlistItem } = useWatchHistory();
  const { userPreferences, toggleWatchHistory, toggleContinueWatching, toggleNotifications, updatePreferences } = useUserPreferences();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user.displayName || '');
  const [hasEditedName, setHasEditedName] = useState(!!user.displayName);
  // Statistics
  const moviesWatched = watchHistory.filter(item => item.media_type === 'movie').length;
  const showsWatched = watchHistory.filter(item => item.media_type === 'tv').length;
  const favoritesCount = favorites.length;
  const watchlistCount = watchlist.length;
  const loader = useRef(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLoadMore = useCallback(async () => {
    setIsLoadingMore(true);
    await loadMore();
    setIsLoadingMore(false);
  }, [loadMore]);

  useEffect(() => {
    // Redirect to home if not logged in
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

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

  const handleClearHistory = () => {
    clearWatchHistory();
    toast({
      title: t("Watch history cleared"),
      description: t("Your watch history has been successfully cleared.")
    });
  };

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      // Error is handled in auth context
    }
  };

  const handleNameSave = async () => {
    if (!hasEditedName && editedName.trim()) {
      try {
        await updateProfile(auth.currentUser, { displayName: editedName });
        setIsEditingName(false);
        setHasEditedName(true);
        // Optionally, show a toast or reload user info
      } catch (error) {
        // Optionally, show error toast
        console.error('Failed to update display name', error);
      }
    }
  };

  // Remove account handler
  const handleRemoveAccount = async () => {
    if (!window.confirm(t('Are you sure you want to permanently remove your account? This action cannot be undone.'))) return;
    try {
      if (user) {
        await deleteUser(user);
        toast({ title: t('Account removed'), description: t('Your account has been deleted.') });
        logout();
      }
    } catch (error) {
      toast({ title: t('Error'), description: t('Failed to remove account. Please re-authenticate and try again.'), variant: 'destructive' });
    }
  };

  // Example: account status (replace with real logic if you have a backend flag)
  const accountStatus = user.disabled ? 'Banned' : 'Active';
  // Premade profile images
  const premadeAvatars = [
    '/avatars/avatar1.svg',
    '/avatars/avatar2.svg',
    '/avatars/avatar3.svg',
    '/avatars/avatar4.svg',
    '/avatars/avatar5.svg',
  ];
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(user.photoURL || premadeAvatars[0]);

  const handleAvatarChange = async (avatarUrl: string) => {
    try {
      await updateProfile(auth.currentUser, { photoURL: avatarUrl });
      setSelectedAvatar(avatarUrl);
      setAvatarPickerOpen(false);
    } catch (error) {
      // Optionally show error toast
      console.error('Failed to update avatar', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-slow text-white font-medium">{t('Loading...')}</div>
      </div>
    );
  }

  // Convert watch history items to Media format for the MediaGrid
  const watchHistoryMedia = watchHistory.map(item => ({
    id: item.media_id,
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
    created_at: item.created_at
  }));
  // Convert favorites and watchlist to ExtendedMedia format for MediaGrid
  const favoritesMedia = favorites.map(item => ({
    id: item.media_id,
    media_id: item.media_id,
    title: item.title,
    name: item.title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: item.overview || '',
    vote_average: item.rating || 0,
    media_type: item.media_type,
    genre_ids: [],
    created_at: item.added_at,
    docId: item.id // <-- needed for selection
  }));
  const watchlistMedia = watchlist.map(item => ({
    id: item.media_id,
    media_id: item.media_id,
    title: item.title,
    name: item.title,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    overview: item.overview || '',
    vote_average: item.rating || 0,
    media_type: item.media_type,
    genre_ids: [],
    created_at: item.added_at,
    docId: item.id // <-- needed for selection
  }));

  // Handler to delete selected favorites
  const handleDeleteSelectedFavorites = async (ids: string[]) => {
    for (const id of ids) {
      await deleteFavoriteItem(id);
    }
    toast({ title: t('Favorites updated'), description: t('Selected favorites have been removed.') });
  };
  // Handler to delete selected watchlist items
  const handleDeleteSelectedWatchlist = async (ids: string[]) => {
    for (const id of ids) {
      await deleteWatchlistItem(id);
    }
    toast({ title: t('Watchlist updated'), description: t('Selected watchlist items have been removed.') });
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <Navbar />
      <motion.div 
        className="container mx-auto pt-24 px-4 pb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass p-6 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24 bg-accent text-white text-2xl">
              <AvatarImage src={user.photoURL || ""} alt={user.email || 'User'} />
              <AvatarFallback>
                {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-1">
                {isEditingName ? (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleNameSave();
                    }}
                  >
                    <input
                      className="rounded bg-black/40 border border-white/10 p-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                      value={editedName}
                      onChange={e => setEditedName(e.target.value)}
                      disabled={hasEditedName}
                      maxLength={32}
                      required
                      autoFocus
                    />
                    <Button type="submit" size="sm" className="ml-2" disabled={hasEditedName}>{t('Save')}</Button>
                  </form>
                ) : (
                  <span>{user.displayName || user.email || 'User Profile'}</span>
                )}
                {!hasEditedName && !isEditingName && (
                  <Button size="xs" variant="outline" className="ml-2" onClick={() => setIsEditingName(true)}>
                    {t('Edit')}
                  </Button>
                )}
              </h1>
              <p className="text-white/70">{user.email}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${accountStatus === 'Active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{accountStatus}</span>
                <Button size="xs" variant="outline" onClick={() => setAvatarPickerOpen(true)}>
                  {t('Change Profile Picture')}
                </Button>
              </div>
              {/* Avatar Picker Modal */}
              {avatarPickerOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                  <div className="bg-background p-6 rounded-lg shadow-lg flex flex-col items-center">
                    <h2 className="text-lg font-bold mb-4 text-white">{t('Choose a Profile Picture')}</h2>
                    <div className="flex gap-4 mb-4">
                      {premadeAvatars.map((avatar) => (
                        <button
                          key={avatar}
                          className={`rounded-full border-4 ${selectedAvatar === avatar ? 'border-accent' : 'border-transparent'}`}
                          onClick={() => handleAvatarChange(avatar)}
                        >
                          <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setAvatarPickerOpen(false)}>
                      {t('Cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          {/* Mobile scrollable tab bar wrapper */}
          <div className="w-full overflow-x-auto pb-2 -mx-2 md:mx-0 md:overflow-visible md:pb-0">
            <TabsList className="min-w-max px-2 md:px-0">
              <TabsTrigger value="profile" className="data-[state=active]:bg-accent">
                <User className="h-4 w-4 mr-2" />
                {t('Profile')}
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-accent">
                <span className="h-4 w-4 mr-2">📜</span>
                {t('Watch History')}
              </TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-accent">
                <span className="h-4 w-4 mr-2">❤️</span>
                {t('Favorites')}
              </TabsTrigger>
              <TabsTrigger value="watchlist" className="data-[state=active]:bg-accent">
                <span className="h-4 w-4 mr-2">🔖</span>
                {t('Watchlist')}
              </TabsTrigger>
              <TabsTrigger value="preferences" className="data-[state=active]:bg-accent">
                <Settings className="h-4 w-4 mr-2" />
                {t('Preferences')}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="profile" className="pt-4">
            {/* Profile Statistics */}
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              <div className="bg-black/40 rounded-lg p-4">
                <div className="text-3xl font-bold text-accent">{moviesWatched}</div>
                <div className="text-white/80 mt-1">{t('Movies Watched')}</div>
              </div>
              <div className="bg-black/40 rounded-lg p-4">
                <div className="text-3xl font-bold text-accent">{showsWatched}</div>
                <div className="text-white/80 mt-1">{t('TV Shows Watched')}</div>
              </div>
              <div className="bg-black/40 rounded-lg p-4 flex flex-col gap-2">
                <div>
                  <span className="text-2xl font-bold text-accent">{favoritesCount}</span>
                  <span className="text-white/80 ml-2">{t('Favorites')}</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-accent">{watchlistCount}</span>
                  <span className="text-white/80 ml-2">{t('Watchlist')}</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="pt-4">
            <MediaGrid media={watchHistoryMedia} title={t('Watch History')} />
          </TabsContent>
          <TabsContent value="favorites" className="pt-4">
            <MediaGrid media={favoritesMedia} title={t('Favorites')} selectable onDeleteSelected={handleDeleteSelectedFavorites} />
          </TabsContent>
          <TabsContent value="watchlist" className="pt-4">
            <MediaGrid media={watchlistMedia} title={t('Watchlist')} selectable onDeleteSelected={handleDeleteSelectedWatchlist} />
          </TabsContent>
          
          <TabsContent value="preferences" className="pt-4">
            <div className="glass p-6 rounded-lg flex flex-col items-center justify-center text-center">
              <h2 className="text-xl font-semibold text-white mb-4">{t('Your Preferences')}</h2>
              <div className="space-y-6 w-full max-w-md">
                <div className="flex flex-col items-center">
                  <div className="space-y-0.5 mb-2">
                    <h3 className="text-lg font-medium text-white">{t('Watch History')}</h3>
                    <p className="text-sm text-white/70">
                      {userPreferences?.isWatchHistoryEnabled
                        ? t("Your watch history is being recorded")
                        : t("Your watch history is not being recorded")}
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences?.isWatchHistoryEnabled}
                    onCheckedChange={toggleWatchHistory}
                    aria-label={t('Toggle watch history')}
                  />
                </div>
                <div className="flex flex-col items-center">
                  <div className="space-y-0.5 mb-2">
                    <h3 className="text-lg font-medium text-white">{t('Continue Watching')}</h3>
                    <p className="text-sm text-white/70">
                      {userPreferences?.isContinueWatchingEnabled !== false
                        ? t("Continue Watching tracking is enabled")
                        : t("Continue Watching tracking is disabled")}
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences?.isContinueWatchingEnabled !== false}
                    onCheckedChange={toggleContinueWatching}
                    aria-label={t('Toggle continue watching')}
                  />
                </div>
                <AccentColorPicker />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-white">{t('Preferred Video Source')}</h3>
                  <p className="text-sm text-white/70">
                    {t('Select your default video source for movies and TV shows')}
                  </p>
                  <Select 
                    value={userPreferences?.preferred_source || ''} 
                    onValueChange={(value) => updatePreferences({ preferred_source: value })}
                  >
                    <SelectTrigger className="w-full sm:w-[200px] bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder={t('Select source')} />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-white/10">
                      {videoSources.map(source => (
                        <SelectItem 
                          key={source.key} 
                          value={source.key}
                          className="text-white focus:text-white focus:bg-white/10"
                        >
                          <div className="flex items-center gap-2">
                            {userPreferences?.preferred_source === source.key && (
                              <Check className="h-4 w-4" />
                            )}
                            {source.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col items-center">
                  <div className="space-y-0.5 mb-2">
                    <h3 className="text-lg font-medium">{t('Feature Notifications')}</h3>
                    <p className="text-sm text-white/70">
                      {t('Get notified about new features and updates')}
                    </p>
                  </div>
                  <Switch
                    checked={userPreferences?.isNotificationsEnabled}
                    onCheckedChange={toggleNotifications}
                    aria-label={t('Toggle feature notifications')}
                  />
                </div>
                <Button variant="destructive" onClick={handleRemoveAccount} className="mt-6 w-full">
                  {t('Remove Account')}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
      
      <Footer />
      <div className="h-12" />
    </div>
  );
};

export default Profile;
