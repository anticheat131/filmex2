import Navbar from '../components/Navbar';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rtdb } from '../firebase-realtime';
import { ref, set, onValue, remove, serverTimestamp } from 'firebase/database';
import WatchTogetherChat from '../components/WatchTogetherChat';
import VoiceChat from '../components/VoiceChat';
import { AuthContext } from '../contexts/auth';

// Room state type
interface RoomState {
  playerType: string;
  videoId: string;
  currentTime: number;
  isPlaying: boolean;
  lastUpdate: number;
  hasStarted?: boolean;
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
  const { user } = useContext(AuthContext)!;

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
        const data = snap.val();
        console.log('WatchTogether roomState update:', data, 'isHost:', isHost);
        setRoomState(data);
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
      hasStarted: type === 'play' ? true : roomState?.hasStarted || false,
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
    // Always update Firebase with the latest videoId and playerType
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

  // Ensure guests always get the latest videoId
  useEffect(() => {
    if (!joined || isHost) return;
    if (roomState && !roomState.videoId) {
      // Show a message or handle fallback if needed
    }
  }, [roomState, joined, isHost]);

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

  // Periodically sync host's currentTime to Firebase while playing
  useEffect(() => {
    if (!isHost || !roomCode || !videoRef.current) return;
    let interval: NodeJS.Timeout | null = null;
    if (roomState?.isPlaying) {
      interval = setInterval(() => {
        set(ref(rtdb, `watch-together/${roomCode}`), {
          ...roomState,
          playerType,
          videoId,
          currentTime: videoRef.current ? videoRef.current.currentTime : 0,
          isPlaying: true,
          lastUpdate: Date.now(),
        });
      }, 1000); // update every 1s
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHost, roomCode, roomState?.isPlaying, playerType, videoId]);

  React.useEffect(() => {
    // On mount, check for ?room= in URL and auto-join if present
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get('room');
    if (urlRoom && !joined) {
      setRoomCode(urlRoom.toUpperCase());
      setIsHost(false);
      setJoined(true);
    }
    // eslint-disable-next-line
  }, []);

  // Keep ?room= in URL when joined, so refresh stays in room
  React.useEffect(() => {
    if (joined && roomCode) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('room') !== roomCode) {
        params.set('room', roomCode);
        window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
      }
    }
  }, [joined, roomCode]);

  // Helper to get sessionUser fallback
  const sessionUser = user?.uid ? (user.displayName || `User${user.uid.slice(-4)}`) : `User${Math.floor(Math.random() * 9000) + 1000}`;

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-6 mt-8">
        <div className="flex-1 flex flex-col">
          {!joined ? (
            <div className="flex flex-col items-center justify-center min-h-screen w-full">
              <div className="bg-gray-900 rounded-2xl shadow-2xl p-10 w-full max-w-md flex flex-col items-center gap-6">
                <div className="text-3xl font-extrabold text-primary mb-2 tracking-tight">Watch Together</div>
                <div className="text-gray-300 text-center mb-4 text-base">
                  Create or join a room to watch movies and chat in real time.<br/>
                  <span className="text-yellow-400 font-medium">Login required for chat.</span>
                </div>
                <button className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-6 py-2 font-bold w-full transition-colors text-base shadow-md" onClick={createRoom}>Create Room</button>
                <div className="flex gap-2 w-full">
                  <input className="flex-1 rounded px-2 py-2 bg-gray-800 text-white border border-gray-700 placeholder-gray-400 text-sm focus:ring-2 focus:ring-primary focus:outline-none transition-all" placeholder="Enter Room Code" value={inputCode} onChange={e => setInputCode(e.target.value)} />
                  <button className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 font-bold text-sm transition-colors shadow-md" onClick={joinRoom}>Join</button>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-200 w-full mt-2">
                  <div className="text-primary font-bold mb-2">How to use Watch Together</div>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Click <span className='font-bold'>Create Room</span> to start a new session, or enter a code to join a friend's room.</li>
                    <li>As host, enter a <span className='font-bold'>TMDB Movie ID</span> to select a movie after creating a room.</li>
                    <li>Share the room code with friends so they can join.</li>
                    <li>Everyone must be logged in to use the chat.</li>
                    <li>Use the chat to coordinate playback and stay in sync.</li>
                    <li><span className='font-bold'>Note:</span> Playback sync is manual due to third-party player limitations. Pause/play as instructed for best experience.</li>
                  </ul>
                  <div className="mt-2 text-yellow-300">If you experience issues, refresh the page or rejoin the room.</div>
                </div>
                {joined && roomCode && (
                  <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-200 w-full mt-4 flex flex-col items-center">
                    <div className="text-primary font-semibold mb-1">Invite friends with this link:</div>
                    <div className="flex w-full max-w-xs">
                      <input
                        className="flex-1 rounded-l px-2 py-1 bg-gray-700 text-white border border-gray-600 text-xs select-all"
                        value={`${window.location.origin}/watch-together?room=${roomCode}`}
                        readOnly
                      />
                      <button
                        className="bg-primary hover:bg-primary/80 text-white rounded-r px-3 py-1 text-xs font-bold transition-colors"
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/watch-together?room=${roomCode}`);
                        }}
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="text-white text-center">Room Code: <span className="font-mono text-lg">{roomCode}</span></div>
              {isHost && (
                <div className="flex flex-col items-center w-full mb-2 mt-2">
                  <label htmlFor="tmdb-id" className="text-xs text-gray-400 mb-1 self-center">TMDB Movie ID</label>
                  <input
                    id="tmdb-id"
                    className="rounded px-2 py-1 bg-gray-800 text-white border border-gray-700 placeholder-gray-400 text-xs w-full max-w-xs focus:ring-2 focus:ring-primary focus:outline-none transition-all text-center"
                    placeholder={'e.g. 1376434'}
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
                </div>
              )}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 flex flex-col">
                  {(!isHost && roomState && roomState.hasStarted && !roomState.isPlaying) && (
                    <div className="text-yellow-400 text-center py-2">
                      Host paused the video. Please pause your player to stay in sync.
                    </div>
                  )}
                  {(isHost && roomState && roomState.hasStarted && !roomState.isPlaying) && (
                    <div className="text-green-400 text-center py-2">
                      You paused the video. Guests are notified to pause.
                    </div>
                  )}
                  {roomState?.videoId ? (
                    <>
                      <iframe
                        src={`https://vidlink.pro/movie/${roomState.videoId}`}
                        title="Filmex Player"
                        className="w-full aspect-video rounded-xl bg-black shadow-lg border border-gray-800"
                        allowFullScreen
                      />
                      <div className="flex flex-col md:flex-row items-end gap-4 mt-4">
                        <div className="flex-1">
                          <WatchTogetherChat roomCode={roomCode} />
                        </div>
                      </div>
                      <div className="flex justify-end mt-6">
                        <button className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-xl px-6 py-2 font-bold shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 w-full md:w-auto" onClick={leaveRoom}>
                          <span className="inline-flex items-center gap-2">
                            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1' /></svg>
                            Leave Room
                          </span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                      {isHost && (
                        <div className="flex flex-col items-center w-full mb-2 mt-2">
                          <label htmlFor="tmdb-id" className="text-xs text-gray-400 mb-1 self-center">TMDB Movie ID</label>
                          <input
                            id="tmdb-id"
                            className="rounded px-2 py-1 bg-gray-800 text-white border border-gray-700 placeholder-gray-400 text-xs w-full max-w-xs focus:ring-2 focus:ring-primary focus:outline-none transition-all text-center"
                            placeholder={'e.g. 1376434'}
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
                        </div>
                      )}
                      <div className="flex items-center justify-center w-full" style={{ minHeight: '120px' }}>
                        <div className="text-white text-center">No video selected yet.</div>
                      </div>
                    </div>
                  )}
                </div>
                {/* Side panel always visible on the right */}
                <aside className="md:w-96 w-full bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-3xl p-8 mt-4 md:mt-0 text-white text-base shadow-2xl h-fit self-start md:sticky md:top-32 border border-gray-800 flex flex-col gap-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/20 rounded-full p-2 shadow-md">
                      <svg xmlns='http://www.w3.org/2000/svg' className='h-7 w-7 text-primary' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z' /></svg>
                    </div>
                    <span className="text-2xl font-extrabold text-primary tracking-tight drop-shadow">How to use Watch Together</span>
                  </div>
                  <ul className="list-none space-y-4 px-0">
                    <li className="flex items-start gap-3"><span className="mt-1 text-primary text-lg">•</span><span><span className='font-bold'>Create Room</span> to start a new session, or enter a code to join a friend's room.</span></li>
                    <li className="flex items-start gap-3"><span className="mt-1 text-primary text-lg">•</span><span>As host, enter a <span className='font-bold'>TMDB Movie ID</span> to select a movie after creating a room.</span></li>
                    <li className="flex items-start gap-3"><span className="mt-1 text-primary text-lg">•</span><span>Share the room code or invite link with friends so they can join.</span></li>
                    <li className="flex items-start gap-3"><span className="mt-1 text-primary text-lg">•</span><span>Everyone must be logged in to use the chat.</span></li>
                    <li className="flex items-start gap-3"><span className="mt-1 text-primary text-lg">•</span><span>Use the chat to coordinate playback and stay in sync.</span></li>
                    <li className="flex items-start gap-3"><span className="mt-1 text-primary text-lg">•</span><span><span className='font-bold'>Note:</span> Playback sync is manual due to third-party player limitations. Pause/play as instructed for best experience.</span></li>
                  </ul>
                  <div className="text-yellow-300 font-medium text-sm bg-yellow-900/30 rounded-xl px-4 py-3 shadow-inner">If you experience issues, refresh the page or rejoin the room.</div>
                  {roomCode && (
                    <div className="mt-6 flex flex-col items-center w-full">
                      <div className="text-primary font-semibold mb-1">Invite friends with this link:</div>
                      <div className="flex w-full max-w-xs">
                        <input
                          className="flex-1 rounded-l px-2 py-1 bg-gray-800 text-white border border-gray-600 text-xs select-all"
                          value={`${window.location.origin}/watch-together?room=${roomCode}`}
                          readOnly
                        />
                        <button
                          className="bg-primary hover:bg-primary/80 text-white rounded-r px-3 py-1 text-xs font-bold transition-colors"
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/watch-together?room=${roomCode}`);
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </aside>
                {/* Voice Chat below How to guide, inside sidebar column but outside the guide card */}
                {roomState?.videoId && (
                  <div className="w-full md:w-96 mt-6">
                    <VoiceChat roomCode={roomCode} userId={user?.uid || sessionUser} displayName={user?.displayName || sessionUser} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Voice Chat below How to guide, outside sidebar and chat */}
      {roomState?.videoId && (
        <div className="flex w-full justify-center mt-8">
          <div className="w-full md:w-2/3 lg:w-1/2">
            <VoiceChat roomCode={roomCode} userId={user?.uid || sessionUser} displayName={user?.displayName || sessionUser} />
          </div>
        </div>
      )}
    </>
  );
};

export default WatchTogether;
