import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { Play } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TVDetailsPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [tvShow, setTVShow] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    const fetchTVShow = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        );
        setTVShow(res.data);
        if (res.data.seasons && res.data.seasons.length > 0) {
          setSelectedSeason(res.data.seasons[res.data.seasons.length - 1]); // Latest season by default
        }
      } catch (error) {
        console.error("Failed to fetch TV show:", error);
      }
    };

    fetchTVShow();
  }, [id]);

  useEffect(() => {
    const fetchEpisodes = async () => {
      if (!selectedSeason) return;
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/tv/${id}/season/${selectedSeason.season_number}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        );
        setEpisodes(res.data.episodes || []);
      } catch (error) {
        console.error("Failed to fetch episodes:", error);
      }
    };

    fetchEpisodes();
  }, [id, selectedSeason]);

  const handlePlayEpisode = (episode: any) => {
    router.push(`/watch/tv/${id}?season=${selectedSeason.season_number}&episode=${episode.episode_number}`);
  };

  if (!tvShow) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="p-4 sm:p-8 text-white">
      <h1 className="text-3xl font-bold mb-6">{tvShow.name}</h1>

      <div className="mb-6">
        <Label className="text-white mb-2 block text-lg font-semibold">Season</Label>
        <Select
          value={selectedSeason?.season_number?.toString()}
          onValueChange={(value) =>
            setSelectedSeason(
              tvShow.seasons?.find(
                (s: any) => s.season_number.toString() === value
              )
            )
          }
        >
          <SelectTrigger className="w-[220px] bg-white/10 text-white border-none focus:ring-0 focus:outline-none">
            <SelectValue placeholder="Select Season" />
          </SelectTrigger>
          <SelectContent>
            {tvShow.seasons?.map((season: any) => (
              <SelectItem
                key={season.id}
                value={season.season_number.toString()}
              >
                {season.name || `Season ${season.season_number}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Episodes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {episodes.map((ep: any) => (
          <div
            key={ep.id}
            className="bg-white/5 rounded-2xl overflow-hidden shadow hover:shadow-lg transition-shadow group"
          >
            <div className="relative aspect-video bg-black">
              <img
                src={
                  ep.still_path
                    ? `https://image.tmdb.org/t/p/w780${ep.still_path}`
                    : "/placeholder.jpg"
                }
                alt={ep.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handlePlayEpisode(ep)}
                className="absolute bottom-3 right-3 bg-white text-black px-3 py-1 rounded-full text-sm font-semibold opacity-90 hover:opacity-100 transition"
              >
                <Play className="w-4 h-4 inline mr-1" /> Play
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-white text-lg font-semibold mb-1">
                Episode {ep.episode_number}: {ep.name}
              </h3>
              {ep.overview ? (
                <p className="text-white/70 text-sm line-clamp-3">
                  {ep.overview}
                </p>
              ) : (
                <p className="text-white/40 italic text-sm">
                  No description available.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TVDetailsPage;
