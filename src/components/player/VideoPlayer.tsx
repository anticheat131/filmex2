import { motion } from 'framer-motion';
import PlyrPlayer from '@/components/PlyrPlayer';
import { useEffect, useRef, useState } from 'react';
import { registerIframeOrigin, setProxyHeaders, resetServiceWorkerData } from '@/utils/iframe-proxy-sw';
import { createProxyStreamUrl, proxyAndRewriteM3u8 } from '@/utils/cors-proxy-api';

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
      const item = {
        id: mediaId.toString(),
        media_id: mediaId,
        media_type: mediaType,
        title,
        backdrop_path: backdropPath || '',
        created_at: new Date(),
        watch_position: watchPosition,
        duration,
        season: season || null,
        episode: episode || null,
      };
      saveContinueWatching(user.uid, item).catch(console.error);
    }, 15000);

    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [user, mediaId, mediaType, title, backdropPath, watchPosition, duration, season, episode, isCustomSource]);

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
