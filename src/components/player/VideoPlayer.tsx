import { motion } from 'framer-motion';
import PlyrPlayer from '@/components/PlyrPlayer';
import { useEffect, useRef, useState } from 'react';
import { registerIframeOrigin, setProxyHeaders, resetServiceWorkerData } from '@/utils/iframe-proxy-sw';
import { createProxyStreamUrl, proxyAndRewriteM3u8 } from '@/utils/cors-proxy-api';
import { setContinueWatching } from '@/api/continue-watching';

import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';

interface VideoPlayerProps {
  isLoading: boolean;
  isCustomSource: boolean;
  streamUrl: string | null;
  iframeUrl: string;
  title: string;
  poster?: string;
  headers?: Record<string, string>;
  onLoaded: () => void;
  onError: (error: string) => void;

  mediaType: 'movie' | 'tv';
  mediaId: string | number;
  duration: number;
  season?: number;
  episode?: number;
  backdropPath?: string;
}

const saveContinueWatching = async (userId: string, item: any) => {
  if (!userId) return;
  const docRef = doc(db, 'continueWatching', userId);
  const docSnap = await getDoc(docRef);

  let items = [];
  if (docSnap.exists()) {
    items = docSnap.data().items || [];
  }

  const index = items.findIndex((i: any) => i.id === item.id);
  if (index !== -1) {
    items[index] = item;
  } else {
    items.push(item);
  }

  // Keep max 50 items
  if (items.length > 50) items = items.slice(items.length - 50);

  await setDoc(docRef, { items });
};

const VideoPlayer = ({
  isLoading,
  isCustomSource,
  streamUrl,
  iframeUrl,
  title,
  poster,
  headers,
  onLoaded,
  onError,
  mediaType,
  mediaId,
  duration,
  season,
  episode,
  backdropPath,
}: VideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { user } = useAuth();

  const [processedStreamUrl, setProcessedStreamUrl] = useState<string | null>(null);
  const [iframeAttempts, setIframeAttempts] = useState(0);
  const [watchPosition, setWatchPosition] = useState(0);

  const saveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const buildContinueWatchingItem = (params: any) => {
    const base: any = {
      id: params.mediaType === 'tv' ? `${params.mediaId}-s${params.season}-e${params.episode}` : params.mediaId.toString(),
      user_id: params.user.uid,
      media_id: typeof params.mediaId === 'string' ? parseInt(params.mediaId) : params.mediaId,
      media_type: params.mediaType,
      title: params.title || '',
      poster_path: params.poster || '',
      backdrop_path: params.backdropPath || '',
      overview: '',
      rating: 0,
      watch_position: params.watchPosition ?? 0,
      duration: params.duration || 0,
      created_at: new Date().toISOString(),
      preferred_source: '',
    };
    if (typeof params.season === 'number') (base as any).season = params.season;
    if (typeof params.episode === 'number') (base as any).episode = params.episode;
    return base;
  };

  // Save Continue Watching immediately on page open
  useEffect(() => {
    console.log('[ContinueWatching][DEBUG] user:', user, 'mediaId:', mediaId);
    if (!user || !mediaId) return;

    const initialItem = buildContinueWatchingItem({
      user,
      mediaId,
      mediaType,
      title,
      poster,
      backdropPath,
      duration,
      season,
      episode,
      watchPosition: 0,
    });
    console.log('[ContinueWatching][WRITE initial]', initialItem);
    setContinueWatching(user.uid, initialItem).then(() => {
      console.log('[ContinueWatching][WRITE initial] success');
    }).catch((err) => {
      console.error('[ContinueWatching][WRITE initial] error', err);
    });
  }, [user, mediaId, mediaType, title, poster, backdropPath, duration, season, episode]);

  useEffect(() => {
    return () => {
      resetServiceWorkerData();
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isCustomSource && iframeUrl) {
      registerIframeOrigin(iframeUrl);
      setIframeAttempts(0);
    }
  }, [isCustomSource, iframeUrl]);

  useEffect(() => {
    if (isCustomSource && streamUrl) {
      if (headers && Object.keys(headers).length > 0) {
        try {
          const domain = new URL(streamUrl).hostname;
          setProxyHeaders(domain, headers);
        } catch (e) {
          console.error('Failed to set proxy headers:', e);
        }
      }

      if (streamUrl.endsWith('.m3u8')) {
        if (headers && Object.keys(headers).length > 0) {
          proxyAndRewriteM3u8(streamUrl, headers)
            .then((processedM3u8) => {
              const blob = new Blob([processedM3u8], { type: 'application/vnd.apple.mpegurl' });
              const blobUrl = URL.createObjectURL(blob);
              setProcessedStreamUrl(blobUrl);
            })
            .catch((err) => {
              console.error('Failed to process M3U8:', err);
              setProcessedStreamUrl(createProxyStreamUrl(streamUrl, headers));
            });
        } else {
          setProcessedStreamUrl(createProxyStreamUrl(streamUrl));
        }
      } else {
        setProcessedStreamUrl(createProxyStreamUrl(streamUrl, headers));
      }
    } else {
      setProcessedStreamUrl(null);
    }
  }, [isCustomSource, streamUrl, headers]);

  // Save progress every 15 seconds for PlyrPlayer
  useEffect(() => {
    if (!user || !mediaId || !isCustomSource) return;

    saveIntervalRef.current = setInterval(() => {
      const item = buildContinueWatchingItem({
        user,
        mediaId,
        mediaType,
        title,
        poster,
        backdropPath,
        duration,
        season,
        episode,
        watchPosition,
      });
      console.log('[ContinueWatching][WRITE interval]', item);
      setContinueWatching(user.uid, item).then(() => {
        console.log('[ContinueWatching][WRITE interval] success');
      }).catch((err) => {
        console.error('[ContinueWatching][WRITE interval] error', err);
      });
    }, 15000);

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [user, mediaId, mediaType, title, poster, backdropPath, watchPosition, duration, season, episode, isCustomSource]);

  // Listen for PLAYER_EVENT messages from vidlink.pro iframe and save progress
  useEffect(() => {
    function handlePlayerEvent(e: MessageEvent) {
      // Debug log to confirm message receipt and data
      console.log('[ContinueWatching][IFRAME MESSAGE]', e.data, 'mediaId:', mediaId, 'user:', user);
      // Only accept messages from the vidlink.pro iframe
      if (
        typeof e.data === 'object' &&
        e.data?.type === 'PLAYER_EVENT' &&
        iframeRef.current &&
        e.source === iframeRef.current.contentWindow
      ) {
        const eventData = e.data.data;
        // Example: { event: 'timeupdate', currentTime: 123, duration: 3600, ... }
        if (eventData && typeof eventData.currentTime === 'number' && typeof eventData.duration === 'number') {
          // Save progress to Firestore
          if (user && mediaId) {
            const item = buildContinueWatchingItem({
              user,
              mediaId,
              mediaType,
              title,
              poster,
              backdropPath,
              duration: eventData.duration,
              season,
              episode,
              watchPosition: eventData.currentTime,
            });
            setContinueWatching(user.uid, item);
          }
        }
      }
    }
    window.addEventListener('message', handlePlayerEvent);
    return () => window.removeEventListener('message', handlePlayerEvent);
  }, [user, mediaId, mediaType, title, poster, backdropPath, season, episode, iframeRef]);

  const handleTimeUpdate = (currentTime: number) => {
    setWatchPosition(currentTime);
  };

  const handleIframeError = () => {
    console.error('Iframe failed to load:', iframeUrl);
    setIframeAttempts((prev) => prev + 1);
    if (iframeAttempts >= 2) {
      onError('Failed to load iframe content after multiple attempts');
    }
  };

  const handleIframeLoad = () => {
    console.log('Iframe loaded successfully');
    onLoaded();

    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const style = document.createElement('style');
        style.textContent = `
          div[class*="popup"], div[class*="ad"], div[id*="popup"], div[id*="ad"],
          iframe:not([src*="${new URL(iframeUrl).host}"]) {
            display: none !important;
            pointer-events: none !important;
          }
        `;
        iframeRef.current.contentDocument?.head.appendChild(style);
      } catch (e) {
        console.log('Could not inject CSS into iframe (expected due to CORS)');
      }
    }
  };

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 flex items-center justify-center"
        >
          <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
      >
        {isCustomSource && (processedStreamUrl || streamUrl) ? (
          <PlyrPlayer
            src={processedStreamUrl || streamUrl}
            title={title}
            poster={poster}
            mediaType={mediaType}
            mediaId={mediaId.toString()}
            onLoaded={onLoaded}
            onError={onError}
            onTimeUpdate={handleTimeUpdate}
          />
        ) : (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            key={`iframe-${iframeUrl}-${iframeAttempts}`}
          />
        )}
      </motion.div>
    </div>
  );
};

export default VideoPlayer;
