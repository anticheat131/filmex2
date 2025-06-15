import React, { useEffect, useRef, useState } from 'react';
import { rtdb } from '../firebase-realtime';
import { ref, push, onDisconnect, remove, onChildAdded, onChildRemoved } from 'firebase/database';

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
    push(usersRef, { userId, displayName });
    setJoined(true);
    onDisconnect(usersRef).remove();
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
    remove(usersRef);
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

  // Listen for new users and handle WebRTC connections
  useEffect(() => {
    if (!joined) return;
    // Add self to connected users list
    setConnectedUsers([{ userId, displayName }]);
    // Listen for other users joining
    const handle = onChildAdded(usersRef, (snap) => {
      const val = snap.val();
      if (!val) return;
      setConnectedUsers((prev) => {
        if (prev.some(u => u.userId === val.userId)) return prev;
        return [...prev, { userId: val.userId, displayName: val.displayName }];
      });
    });
    // Listen for users leaving
    const handleRemove = onChildRemoved(usersRef, (snap) => {
      const val = snap.val();
      if (!val) return;
      setConnectedUsers((prev) => prev.filter(u => u.userId !== val.userId));
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
          <button className="bg-red-600 text-white rounded-lg px-4 py-1 font-bold mb-2" onClick={leaveVoice}>Leave Voice Chat</button>
          <button className="bg-gray-700 text-white rounded-lg px-4 py-1 font-bold mb-2" onClick={toggleMute}>{muted ? 'Unmute' : 'Mute'}</button>
          <div className="text-xs text-gray-400">Connected users will appear here.</div>
          <div className="w-full mb-2 flex flex-col items-center">
            <div className="text-xs text-gray-400 mb-1">Connected users:</div>
            <div className="flex flex-wrap gap-2 justify-center">
              {connectedUsers.map(u => (
                <div key={u.userId} className="bg-gray-800 text-white rounded px-3 py-1 text-xs font-semibold flex items-center gap-1">
                  <svg xmlns='http://www.w3.org/2000/svg' className='h-3 w-3 text-primary' fill='none' viewBox='0 0 24 24' stroke='currentColor'><circle cx='12' cy='12' r='6' fill='currentColor' /></svg>
                  {u.displayName}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <button className="bg-primary text-white rounded-lg px-4 py-2 font-bold" onClick={joinVoice}>Join Voice Chat</button>
      )}
    </div>
  );
};

export default VoiceChat;
