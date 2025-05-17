// app/tv/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { PlayIcon } from "lucide-react";
import { format } from "date-fns";

type Episode = {
  id: number;
  name: string;
  still_path: string | null;
  overview: string;
  season_number: number;
  episode_number: number;
};

type TVDetails = {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  first_air_date: string;
  genres: { id: number; name: string }[];
  vote_average: number;
  number_of_seasons: number;
};

const TVDetailsPage = () => {
  const { id } = useParams();
  const [tv, setTV] = useState<TVDetails | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchTVDetails = async () => {
      try {
        const tvRes = await axios.get(
          `https://api.themoviedb.org/3/tv/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`
        );
        setTV(tvRes.data);

        const seasonRes = await axios.get(
          `https://api.themoviedb.org/3/tv/${id}/season/1?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}&language=en-US`
        );
        setEpisodes(seasonRes.data.episodes || []);
      } catch (error) {
        console.error("Failed to fetch TV details:", error);
      }
    };

    fetchTVDetails();
  }, [id]);

  if (!tv) return <div className="text-white p-4">Loading...</div>;

  return (
    <div className="p-4 text-white max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <Image
          src={`https://image.tmdb.org/t/p/w500${tv.poster_path}`}
          alt={tv.name}
          width={300}
          height={450}
          className="rounded-xl object-cover w-full md:w-[300px] h-auto"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{tv.name}</h1>
          <div className="flex items-center gap-2 text-sm mb-4 text-gray-300">
            <span>{format(new Date(tv.first_air_date), "MMMM d, yyyy")}</span>
            <span>•</span>
            <span>{tv.vote_average.toFixed(1)} IMDb</span>
            <span>•</span>
            <span>
              {tv.genres.slice(0, 2).map((genre, i, arr) => (
                <span key={genre.id}>
                  {genre.name}
                  {i < arr.length - 1 && ", "}
                </span>
              ))}
            </span>
          </div>
          <p className="text-gray-400 max-w-xl">{tv.overview}</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-4">Episodes</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {episodes.map((ep) => (
          <div
            key={ep.id}
            className="bg-[#1c1c1c] rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-300"
          >
            {ep.still_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${ep.still_path}`}
                alt={ep.name}
                width={500}
                height={281}
                className="w-full h-56 object-cover"
              />
            ) : (
              <div className="w-full h-56 bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
                No Image
              </div>
            )}
            <div className="p-4">
              <h3 className="text-lg font-semibold">{ep.name}</h3>
              <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                {ep.overview || "No description available."}
              </p>
              <Link
                href={`/tv/${id}/season/${ep.season_number}/episode/${ep.episode_number}`}
                className="inline-flex items-center text-blue-400 hover:underline text-sm"
              >
                <PlayIcon className="w-4 h-4 mr-1" /> Watch Episode
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TVDetailsPage;
