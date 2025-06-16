import React from "react";

const TEST_MP3 = "https://ia800201.us.archive.org/23/items/theraven_2007_librivox/raven_poe_apc_64kb.mp3";

const AudioTest: React.FC = () => (
  <div style={{ padding: 32 }}>
    <h2>Minimal Audio Test</h2>
    <audio controls src={TEST_MP3} style={{ width: 400 }}>
      Your browser does not support the audio element.
    </audio>
    <p>
      If you see the player and can play audio, the issue is with the custom player. If not, it is environmental (CORS, service worker, browser, etc).
    </p>
    <p>
      <a href={TEST_MP3} target="_blank" rel="noopener noreferrer">Open MP3 directly</a>
    </p>
  </div>
);

export default AudioTest;
