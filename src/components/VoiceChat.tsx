import React, { useEffect, useRef, useState } from 'react';
import { rtdb } from '../firebase-realtime';
import { ref, set, onDisconnect, remove, onChildAdded, onChildRemoved } from 'firebase/database';

interface VoiceChatProps {
  roomCode: string;
  userId: string;
  displayName: string;
}

const VoiceChat: React.FC<VoiceChatProps> = ({ roomCode, userId, displayName }) => {
  const [joined, setJoined] = useState(false);
  const [peers, setPeers] = useState<{ [id: string]: RTCPeerConnection }>({});
  const [muted, setMuted] = useState(false);
  const [connectedUsers, setConnectedUsers] = useState<{ userId: string, displayName: string }[]>([]);
  const [speakingUsers, setSpeakingUsers] = useState<{ [userId: string]: boolean }>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const audioRefs = useRef<{ [id: string]: HTMLAudioElement }>({});

  // Firebase signaling paths
  const signalRef = ref(rtdb, `watch-together/${roomCode}/voice-signals`);
  const usersRef = ref(rtdb, `watch-together/${roomCode}/voice-users`);

  // Join voice chat
  const joinVoice = async () => {
    if (joined) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;
    // Use set with userId as key for unique presence
    const userRef = ref(rtdb, `watch-together/${roomCode}/voice-users/${userId}`);
    await set(userRef, { userId, displayName });
    onDisconnect(userRef).remove();
    setJoined(true);
  };

  // Leave voice chat
  const leaveVoice = () => {
    setJoined(false);
    Object.values(peers).forEach(pc => pc.close());
    setPeers({});
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    // Remove only this user's entry
    const userRef = ref(rtdb, `watch-together/${roomCode}/voice-users/${userId}`);
    remove(userRef);
  };

  // Mute/unmute
  const toggleMute = () => {
    setMuted(m => {
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(track => (track.enabled = m));
      }
      return !m;
    });
  };

  // Detect local speaking
  useEffect(() => {
    if (!joined || !localStreamRef.current) return;
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(localStreamRef.current);
    source.connect(analyser);
    analyser.fftSize = 512;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let speaking = false;
    let raf: number;
    const checkSpeaking = () => {
      analyser.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      if (avg > 15) {
        if (!speaking) {
          setSpeakingUsers(prev => ({ ...prev, [userId]: true }));
          speaking = true;
        }
      } else {
        if (speaking) {
          setSpeakingUsers(prev => ({ ...prev, [userId]: false }));
          speaking = false;
        }
      }
      raf = requestAnimationFrame(checkSpeaking);
    };
    checkSpeaking();
    return () => {
      cancelAnimationFrame(raf);
      analyser.disconnect();
      source.disconnect();
      audioContext.close();
    };
  }, [joined, userId]);

  // Listen for new users and handle WebRTC connections
  useEffect(() => {
    if (!joined) return;
    // Listen for all users in the room
    const handle = onChildAdded(usersRef, (snap) => {
      const val = snap.val();
      if (!val) return;
      setConnectedUsers((prev) => {
        if (prev.some(u => u.userId === val.userId)) return prev;
        return [...prev, { userId: val.userId, displayName: val.displayName }];
      });
    });
    const handleRemove = onChildRemoved(usersRef, (snap) => {
      const val = snap.val();
      if (!val) return;
      setConnectedUsers((prev) => prev.filter(u => u.userId !== val.userId));
    });
    // Initial load: fetch all current users
    import('firebase/database').then(({ get, child }) => {
      get(child(usersRef, '/')).then(snapshot => {
        if (snapshot.exists()) {
          const users = snapshot.val();
          setConnectedUsers(Object.values(users));
        }
      });
    });
    return () => {
      handle();
      handleRemove();
    };
  }, [joined, userId, displayName]);

  return (
    <div className="bg-gray-900 rounded-lg p-4 mt-4 flex flex-col items-center">
      <div className="mb-2 text-lg font-bold text-primary">Voice Chat (Beta)</div>
      {joined ? (
        <>
          <button className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-1 font-bold mb-2 transition-colors" onClick={leaveVoice}>Leave Voice Chat</button>
          <button className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-1 font-bold mb-2 transition-colors" onClick={toggleMute}>{muted ? 'Unmute' : 'Mute'}</button>
          <div className="text-xs text-gray-400">Connected users will appear here.</div>
          <div className="w-full mb-2 flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-1">Connected users:</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {connectedUsers.map(u => (
                <div key={u.userId} className="bg-gray-800 text-white rounded px-3 py-1 text-xs font-semibold flex items-center gap-1">
                  <svg xmlns='http://www.w3.org/2000/svg' className={`h-3 w-3 ${speakingUsers[u.userId] ? 'text-green-400' : 'text-primary'}`} fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <circle cx='12' cy='12' r='6' fill='currentColor' />
                  </svg>
                  {u.displayName}
                  {u.userId !== userId && (
                    <svg xmlns='http://www.w3.org/2000/svg' className='h-3 w-3 text-blue-400 ml-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 18v-2a4 4 0 014-4h10a4 4 0 014 4v2' />
                      <circle cx='12' cy='7' r='4' />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <button className="bg-gray-800 hover:bg-gray-700 text-white rounded-lg px-4 py-2 font-bold transition-colors" onClick={joinVoice}>Join Voice Chat</button>
      )}
    </div>
  );
};

export default VoiceChat;
