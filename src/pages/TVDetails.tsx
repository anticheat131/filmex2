import React from 'react';

interface Season {
  id: number;
  season_number: number;
  name: string;
  air_date: string | null;
  episode_count: number;
  poster_path: string | null;
}

interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string | null;
  vote_average: number;
}

interface TVShowEpisodesProps {
  seasons: Season[];
  episodes: Episode[];
  selectedSeason: number;
  onSeasonChange: (seasonNumber: number) => void;
  onPlayEpisode: (episodeId: number, episodeNumber: number, seasonNumber: number) => void;
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
      {/* Dropdown for Seasons */}
      <div className="mb-4 max-w-xs">
        <label htmlFor="season-select" className="block text-white font-semibold mb-2">
          Select Season
        </label>
        <select
          id="season-select"
          value={selectedSeason}
          onChange={(e) => onSeasonChange(Number(e.target.value))}
          className="w-full bg-gray-800 text-white rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent transition"
        >
          {seasons.map((season) => (
            <option key={season.id} value={season.season_number}>
              {season.name || `Season ${season.season_number}`}
            </option>
          ))}
        </select>
      </div>

      {/* Episodes List */}
      <div className="space-y-4">
        {episodes.length === 0 && (
          <p className="text-gray-400">No episodes available for this season.</p>
        )}

        {episodes.map((episode) => (
          <div
            key={episode.id}
            className="flex items-center space-x-4 p-4 bg-gray-900 rounded-md hover:bg-gray-800 cursor-pointer transition"
            onClick={() => onPlayEpisode(episode.id, episode.episode_number, selectedSeason)}
          >
            {episode.still_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w185${episode.still_path}`}
                alt={episode.name}
                className="w-28 rounded-md"
              />
            ) : (
              <div className="w-28 h-16 bg-gray-700 rounded-md flex items-center justify-center text-gray-500">
                No Image
              </div>
            )}

            <div>
              <h3 className="text-white font-semibold">
                Episode {episode.episode_number}: {episode.name}
              </h3>
              <p className="text-gray-400 text-sm line-clamp-2">{episode.overview}</p>
              <p className="text-gray-500 text-xs mt-1">
                Air Date: {episode.air_date || 'Unknown'} | Rating: {episode.vote_average}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TVShowEpisodes;
