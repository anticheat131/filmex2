import Navbar from '../components/Navbar';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rtdb } from '../firebase-realtime';
import { ref, set, onValue, remove, serverTimestamp } from 'firebase/database';
import WatchTogetherPlayerChoice from '../components/WatchTogetherPlayerChoice';

// Room state type
interface RoomState {
  playerType: string;
  videoId: string;
  currentTime: number;
  isPlaying: boolean;
  lastUpdate: number;
}

const generateRoomCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const WatchTogether = () => {
  const [roomCode, setRoomCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [videoId, setVideoId] = useState('');
  const [playerType, setPlayerType] = useState('youtube');
  const [isHost, setIsHost] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // Create a room
  const createRoom = () => {
    const code = generateRoomCode();
    setRoomCode(code);
    setIsHost(true);
    setJoined(true);
    set(ref(rtdb, `watch-together/${code}`), {
      playerType: 'youtube',
      videoId: '',
      currentTime: 0,
      isPlaying: false,
      lastUpdate: Date.now(),
      createdAt: serverTimestamp(),
    });
  };

  // Join a room
  const joinRoom = () => {
    setRoomCode(inputCode.toUpperCase());
    setIsHost(false);
    setJoined(true);
    setInputCode(''); // Clear input after joining
  };

  // Listen for room state changes
  useEffect(() => {
    if (!roomCode) return;
    const roomRef = ref(rtdb, `watch-together/${roomCode}`);
    const unsub = onValue(roomRef, (snap) => {
      if (snap.exists()) {
        setRoomState(snap.val());
      }
    });
    return () => unsub();
  }, [roomCode]);

  // Host: update room state on video events
  const handlePlayerEvent = (type: 'play' | 'pause' | 'seeked') => {
    if (!isHost) return;
    set(ref(rtdb, `watch-together/${roomCode}`), {
      ...roomState,
      playerType,
      videoId,
      currentTime: videoRef.current ? videoRef.current.currentTime : 0,
      isPlaying: type === 'play',
      lastUpdate: Date.now(),
    });
  };

  // Guest: sync video to room state
  useEffect(() => {
    if (!roomState || isHost || !videoRef.current) return;
    if (Math.abs(videoRef.current.currentTime - roomState.currentTime) > 1) {
      videoRef.current.currentTime = roomState.currentTime;
    }
    if (roomState.isPlaying) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }, [roomState, isHost]);

  // Sync player type on room state change
  useEffect(() => {
    if (!roomState) return;
    setPlayerType(roomState.playerType || 'youtube');
  }, [roomState]);

  // Sync videoId and playerType to room state for host
  useEffect(() => {
    if (!isHost || !roomCode) return;
    set(ref(rtdb, `watch-together/${roomCode}`), {
      ...roomState,
      playerType,
      videoId,
      currentTime: roomState?.currentTime || 0,
      isPlaying: roomState?.isPlaying || false,
      lastUpdate: Date.now(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, playerType]);

  // Leave room
  const leaveRoom = () => {
    if (isHost && roomCode) {
      remove(ref(rtdb, `watch-together/${roomCode}`));
    }
    setRoomCode('');
    setJoined(false);
    setIsHost(false);
    setRoomState(null);
    setVideoId('');
  };

  return (
    <>
      <Navbar />
      <div className="max-w-xl mx-auto mt-32 p-6 bg-black/80 rounded-xl shadow-lg">
        {!joined ? (
          <div className="flex flex-col gap-4">
            <button className="bg-primary text-white rounded-lg px-4 py-2 font-bold" onClick={createRoom}>Create Room</button>
            <div className="flex gap-2">
              <input className="flex-1 rounded px-2 py-1" placeholder="Enter Room Code" value={inputCode} onChange={e => setInputCode(e.target.value)} />
              <button className="bg-primary text-white rounded-lg px-4 py-1 font-bold" onClick={joinRoom}>Join</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-white text-center">Room Code: <span className="font-mono text-lg">{roomCode}</span></div>
            {isHost && (
              <>
                <WatchTogetherPlayerChoice playerType={playerType} setPlayerType={type => {
                  setPlayerType(type);
                  set(ref(rtdb, `watch-together/${roomCode}`), {
                    ...roomState,
                    playerType: type,
                    videoId,
                    currentTime: roomState?.currentTime || 0,
                    isPlaying: roomState?.isPlaying || false,
                    lastUpdate: Date.now(),
                  });
                }} />
                <input
                  className="rounded px-2 py-1 mb-2"
                  placeholder={playerType === 'youtube' ? 'YouTube Video ID' : 'TMDB Movie ID (e.g. 1376434)'}
                  value={videoId}
                  onChange={e => {
                    setVideoId(e.target.value);
                    set(ref(rtdb, `watch-together/${roomCode}`), {
                      ...roomState,
                      playerType,
                      videoId: e.target.value,
                      currentTime: roomState?.currentTime || 0,
                      isPlaying: roomState?.isPlaying || false,
                      lastUpdate: Date.now(),
                    });
                  }}
                />
              </>
            )}
            {(!isHost && roomState?.playerType === 'youtube' && roomState.videoId) ? (
              <video
                ref={videoRef}
                controls
                className="w-full rounded-lg bg-black"
                src={`https://www.youtube.com/embed/${roomState.videoId}`}
              />
            ) : (!isHost && roomState?.playerType === 'filmex' && roomState.videoId) ? (
              <iframe
                src={`https://vidlink.pro/movie/${roomState.videoId}`}
                title="Filmex Player"
                className="w-full aspect-video rounded-lg bg-black"
                allowFullScreen
              />
            ) : null}
            {(isHost && playerType === 'youtube' && videoId) ? (
              <video
                ref={videoRef}
                controls
                className="w-full rounded-lg bg-black"
                src={`https://www.youtube.com/embed/${videoId}`}
              />
            ) : (isHost && playerType === 'filmex' && videoId) ? (
              <iframe
                src={`https://vidlink.pro/movie/${videoId}`}
                title="Filmex Player"
                className="w-full aspect-video rounded-lg bg-black"
                allowFullScreen
              />
            ) : (isHost && !videoId) ? (
              <div className="text-white text-center py-8">No video selected yet.</div>
            ) : (!isHost && (!roomState?.videoId)) ? (
              <div className="text-white text-center py-8">No video selected yet.</div>
            ) : null}
            <button className="bg-red-600 text-white rounded-lg px-4 py-2 font-bold" onClick={leaveRoom}>Leave Room</button>
          </div>
        )}
      </div>
    </>
  );
};

export default WatchTogether;
