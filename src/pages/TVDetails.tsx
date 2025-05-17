import React from 'react';

interface Season {
  season_number: number;
  name: string;
}

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview?: string;
  // add other episode fields you use
}

interface TVShowEpisodesProps {
  seasons: Season[];
  episodes: Episode[];
  selectedSeason: number;
  onSeasonChange: (seasonNumber: number) => void;
  onPlayEpisode: (episode: Episode) => void;
}

const TVShowEpisodes: React.FC<TVShowEpisodesProps> = ({
  seasons,
  episodes,
  selectedSeason,
  onSeasonChange,
  onPlayEpisode,
}) => {
  return (
    <div>
      <div className="mb-6">
        <label htmlFor="season-select" className="text-white font-medium mb-2 block">
          Select Season:
        </label>
        <select
          id="season-select"
          value={selectedSeason}
          onChange={(e) => onSeasonChange(Number(e.target.value))}
          className="bg-background text-white px-4 py-2 rounded border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent"
        >
          {seasons.map((season) => (
            <option key={season.season_number} value={season.season_number}>
              {season.name}
            </option>
          ))}
        </select>
      </div>

      <ul className="space-y-2">
        {episodes.map((episode) => (
          <li key={episode.id}>
            <button
              onClick={() => onPlayEpisode(episode)}
              className="text-white hover:underline"
            >
              {episode.episode_number}. {episode.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TVShowEpisodes;
