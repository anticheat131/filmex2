import { useEffect, useRef } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks';

function WatchPlayer({ media }) {
  // media example props: 
  // { media_id, media_type, title, backdrop_path, duration, season, episode }

  const { user } = useAuth();
  const videoRef = useRef(null);
  const saveIntervalRef = useRef(null);

  // Function to save progress to Firestore
  const saveContinueWatching = async (position) => {
    if (!user) return;

    const item = {
      media_id: media.media_id,
      media_type: media.media_type,
      title: media.title,
      backdrop_path: media.backdrop_path,
      watch_position: position,      // in seconds
      duration: media.duration,       // in seconds
      season: media.season || null,
      episode: media.episode || null,
      created_at: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    };

    try {
      await setDoc(
        doc(db, 'users', user.uid, 'continue_watching', media.media_id.toString()), 
        item,
        { merge: true }
      );
      console.log('Continue watching saved:', position);
    } catch (error) {
      console.error('Error saving continue watching:', error);
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;
    if (!user) return;

    const video = videoRef.current;

    // Save progress every 15 seconds while playing
    saveIntervalRef.current = setInterval(() => {
      if (!video.paused && !video.ended) {
        saveContinueWatching(Math.floor(video.currentTime));
      }
    }, 15000);

    // Also save on pause or seek events immediately
    const onPauseOrSeek = () => {
      saveContinueWatching(Math.floor(video.currentTime));
    };

    video.addEventListener('pause', onPauseOrSeek);
    video.addEventListener('seeked', onPauseOrSeek);

    return () => {
      clearInterval(saveIntervalRef.current);
      video.removeEventListener('pause', onPauseOrSeek);
      video.removeEventListener('seeked', onPauseOrSeek);
    };
  }, [user, media]);

  return (
    <video
      ref={videoRef}
      src={media.videoUrl}
      controls
      autoPlay
      // Optionally start video at last saved position:
      onLoadedMetadata={() => {
        if (videoRef.current && user) {
          // Load last saved position from Firestore, then seek here
          // (you can implement this separately)
        }
      }}
    />
  );
}
