import React, { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../contexts/auth';
import { rtdb } from '../firebase-realtime';
import { ref, push, onChildAdded } from 'firebase/database';

interface ChatMessage {
  user: string;
  text: string;
  timestamp: number;
  _key?: string;
  system?: boolean;
}

interface WatchTogetherChatProps {
  roomCode: string;
}

const WatchTogetherChat: React.FC<WatchTogetherChatProps> = ({ roomCode }) => {
  const { user } = useContext(AuthContext)!;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sessionUser, setSessionUser] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Add a session flag for join message
  const joinedPartySentRef = useRef(false);

  useEffect(() => {
    if (!roomCode) return;
    const chatRef = ref(rtdb, `watch-together/${roomCode}/chat`);
    setMessages([]);
    let messageKeys = new Set<string>();
    const handle = onChildAdded(chatRef, (snap) => {
      const val = snap.val();
      const key = snap.key;
      if (!key || messageKeys.has(key)) return;
      messageKeys.add(key);
      setMessages((prev) => {
        // Only add if not already present by key
        if (prev.some((m: any) => m._key === key)) return prev;
        return [...prev, { ...val, _key: key }];
      });
    });
    return () => {
      messageKeys.clear();
      handle();
    };
  }, [roomCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!sessionUser) {
      const n = Math.floor(Math.random() * 9000) + 1000;
      setSessionUser('User' + n);
    }
  }, [sessionUser]);

  // Only send join message if not already present in chat
  useEffect(() => {
    if (!roomCode || !sessionUser) return;
    const chatRef = ref(rtdb, `watch-together/${roomCode}/chat`);
    // Check if a join message for this user already exists
    let alreadyJoined = false;
    const checkAndSend = async () => {
      const res = await fetch(`https://$YOUR_FIREBASE_PROJECT.firebaseio.com/watch-together/${roomCode}/chat.json`);
      const data = await res.json();
      if (data) {
        for (const key in data) {
          if (data[key].user === sessionUser && data[key].system) {
            alreadyJoined = true;
            break;
          }
        }
      }
      if (!alreadyJoined) {
        push(chatRef, {
          user: sessionUser,
          text: 'joined the party!',
          timestamp: Date.now(),
          system: true
        });
      }
    };
    checkAndSend();
    // No cleanup needed
  }, [roomCode, sessionUser]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;
    const chatRef = ref(rtdb, `watch-together/${roomCode}/chat`);
    push(chatRef, {
      user: sessionUser,
      text: input,
      timestamp: Date.now(),
    });
    setInput('');
  };

  // Add voice-to-text logic
  const startVoice = async () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.onerror = (event: any) => {
      alert('Voice recognition error: ' + event.error);
    };
    recognition.start();
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 mt-4 max-h-[32rem] min-h-[18rem] flex flex-col shadow-lg border border-gray-800">
      <div className="flex-1 overflow-y-auto mb-2 text-left">
        <div className="mb-2 text-lg font-bold text-primary text-center">Room Chat</div>
        {!user && (
          <div className="text-center text-xs text-red-400 mb-2">You must be logged in to send messages.</div>
        )}
        {messages.map((msg, idx) => (
          <div key={msg._key || idx} className={msg.system ? 'mb-2 flex items-center justify-center' : 'mb-2 flex items-start'}>
            {msg.system ? (
              <div className="text-xs text-gray-400 italic w-full text-center">{msg.user} {msg.text}</div>
            ) : (
              <>
                <div className="rounded-full bg-primary text-white w-8 h-8 flex items-center justify-center font-bold mr-2 flex-shrink-0">
                  {msg.user[0]?.toUpperCase() || 'U'}
                </div>
                <div className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 shadow text-white max-w-full w-full break-words whitespace-pre-line text-left">
                  <span className="font-semibold text-primary">{msg.user}:</span>
                  <span className="ml-1">{msg.text}</span>
                </div>
              </>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 mt-2 items-center">
        <input
          className="flex-1 rounded px-2 py-1 border border-gray-700 bg-gray-800 text-white"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={!user}
        />
        <button className="bg-accent text-white border-none rounded-lg px-4 py-1 font-bold shadow hover:bg-accent/80 transition-colors" type="submit" disabled={!user}>Send</button>
        <button
          type="button"
          className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-3 py-1 font-bold shadow ml-1 flex items-center"
          onClick={startVoice}
          disabled={!user}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18v2m0 0a4 4 0 004-4h-8a4 4 0 004 4zm0-14a4 4 0 00-4 4v4a4 4 0 008 0V8a4 4 0 00-4-4z" /></svg>
        </button>
      </form>
      {/* Voice Chat integration removed from chat */}
      {!user && (
        <div className="text-center text-xs text-red-400 mt-2">
          If you wish to chat, please <a href="/signup" className="underline text-primary">Signup</a> or <a href="/login" className="underline text-primary">Login</a>.
        </div>
      )}
    </div>
  );
};

export default WatchTogetherChat;
