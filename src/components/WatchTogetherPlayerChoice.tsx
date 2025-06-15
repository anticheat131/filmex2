import React from 'react';

interface PlayerChoiceProps {
  playerType: string;
  setPlayerType: (type: string) => void;
}

const WatchTogetherPlayerChoice: React.FC<PlayerChoiceProps> = ({ playerType, setPlayerType }) => {
  return (
    <div className="flex gap-2 mb-4">
      <button
        className={`px-4 py-2 rounded-lg font-bold ${playerType === 'youtube' ? 'bg-primary text-white' : 'bg-gray-700 text-white'}`}
        onClick={() => setPlayerType('youtube')}
      >
        YouTube
      </button>
      <button
        className={`px-4 py-2 rounded-lg font-bold ${playerType === 'filmex' ? 'bg-primary text-white' : 'bg-gray-700 text-white'}`}
        onClick={() => setPlayerType('filmex')}
      >
        Filmex Movie/TV
      </button>
    </div>
  );
};

export default WatchTogetherPlayerChoice;
