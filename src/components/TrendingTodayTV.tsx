import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const fetchTrendingTodayTV = async () => {
  const res = await fetch(`https://api.themoviedb.org/3/trending/tv/day?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  return (data.results || []).slice(0, 4);
};

const fetchLogo = async (tvId) => {
  const res = await fetch(`https://api.themoviedb.org/3/tv/${tvId}/images?api_key=${TMDB_API_KEY}`);
  const data = await res.json();
  let logo = null;
  if (data.logos && data.logos.length > 0) {
    const enLogo = data.logos.find(l => l.iso_639_1 === 'en');
    logo = enLogo ? enLogo.file_path : data.logos[0].file_path;
  }
  return logo;
};

const TrendingTodayTV = () => {
  const [shows, setShows] = useState([]);
  const [logos, setLogos] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrendingTodayTV().then(async (shows) => {
      setShows(shows);
      const logoMap = {};
      await Promise.all(shows.map(async (s) => {
        const logo = await fetchLogo(s.id);
        if (logo) logoMap[s.id] = logo;
      }));
      setLogos(logoMap);
    });
  }, []);

  return (
    <section className="w-full mt-8 p-0 m-0">
      <div className="grid grid-cols-1 grid-rows-4 md:grid-cols-2 md:grid-rows-2 gap-y-10 gap-x-[2vw] md:gap-[2vw] w-full max-h-[140vh] mb-16">
        {shows.map((show, idx) => (
          <div key={show.id} className="relative bg-black/80 overflow-hidden shadow-2xl flex flex-col justify-center items-center w-full h-full min-h-[90vw] min-w-0 group flex-1 rounded-xl pb-10">
            <img
              src={show.backdrop_path ? `https://image.tmdb.org/t/p/w780${show.backdrop_path}` : '/placeholder.svg'}
              alt={show.name}
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              draggable={false}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-black/90 z-10" />
            <button className="absolute top-5 right-5 z-20 bg-black/40 hover:bg-black/70 rounded-full p-3 text-white shadow transition" tabIndex={-1} aria-label="Add to favorites">
              <svg xmlns='http://www.w3.org/2000/svg' fill='currentColor' viewBox='0 0 24 24' className='w-7 h-7'><path d='M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z'/></svg>
            </button>
            <div className="relative z-20 flex flex-col items-center justify-end px-2 md:px-4 pt-2 md:pt-4 pb-6 md:pb-10 w-full h-full">
              <span className="mb-2 md:mb-3 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-white/90 text-black text-xs md:text-sm font-semibold shadow">Trending Today TV Shows</span>
              {logos[show.id] && !logos[show.id].includes('/images') ? (
                <img src={`https://image.tmdb.org/t/p/w780${logos[show.id]}`} alt={show.name} className="max-h-16 mb-2 md:mb-3 object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]" style={{filter:'drop-shadow(0 2px 8px #000)'}} />
              ) : (
                <h3 className="text-base md:text-lg font-extrabold text-white mb-2 md:mb-3 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] text-center tracking-tight uppercase">{show.name}</h3>
              )}
              <p className="text-white/90 text-xs md:text-base text-center mb-3 md:mb-5 line-clamp-3 max-w-xs md:max-w-lg drop-shadow-[0_2px_8px_rgba(0,0,0,0.7)]">{show.overview}</p>
              <div className="flex gap-2 md:gap-4 w-full justify-center mt-1 md:mt-2">
                <button
                  className="flex items-center gap-1 md:gap-2 bg-white text-black font-semibold rounded-lg px-3 md:px-5 py-1.5 md:py-2.5 shadow-lg hover:bg-red-200 transition-all text-xs md:text-base min-w-[72px] md:min-w-[110px] justify-center"
                  onClick={() => navigate(`/tv/${show.id}`)}
                >
                  Details <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button
                  className="flex items-center gap-1 md:gap-2 bg-black/90 text-white font-semibold rounded-lg px-3 md:px-5 py-1.5 md:py-2.5 shadow-lg hover:bg-red-200 hover:text-black transition-all text-xs md:text-base min-w-[72px] md:min-w-[110px] justify-center"
                  onClick={() => navigate(`/tv/${show.id}?play=1`)}
                >
                  Watch <Play className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TrendingTodayTV;
