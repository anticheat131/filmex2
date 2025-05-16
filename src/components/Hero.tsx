import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Movie } from "@/types";

interface HeroProps {
  items: Movie[];
}

const Hero: React.FC<HeroProps> = ({ items }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % items.length);
      }, 6000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  const goTo = (index: number) => setCurrent(index);
  const goNext = () => setCurrent((prev) => (prev + 1) % items.length);
  const goPrev = () => setCurrent((prev) => (prev - 1 + items.length) % items.length);

  return (
    <div className="relative w-full h-[30vh] overflow-hidden rounded-xl mb-6">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100 z-20" : "opacity-0 z-10"
          }`}
        >
          <Link href={`/movie/${item.id}`}>
            <Image
              src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
              alt={item.title || item.name}
              fill
              className="object-cover"
              priority={index === current}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/10" />
            <div className="absolute bottom-4 left-6 text-white">
              <h2 className="text-xl md:text-2xl font-bold">
                {item.title || item.name}
              </h2>
              <p className="text-sm max-w-md line-clamp-2">
                {item.overview}
              </p>
            </div>
          </Link>
        </div>
      ))}

      <button
        onClick={goPrev}
        className="absolute top-0 left-0 h-full w-12 flex items-center justify-center bg-black/20 hover:bg-black/30 transition"
      >
        <ChevronLeft className="text-white" size={28} />
      </button>
      <button
        onClick={goNext}
        className="absolute top-0 right-0 h-full w-12 flex items-center justify-center bg-black/20 hover:bg-black/30 transition"
      >
        <ChevronRight className="text-white" size={28} />
      </button>

      <button
        onClick={() => setIsPaused(!isPaused)}
        className="absolute bottom-3 right-4 bg-black/50 hover:bg-black/70 p-2 rounded-full transition"
      >
        {isPaused ? (
          <Play className="text-white" size={16} />
        ) : (
          <Pause className="text-white" size={16} />
        )}
      </button>
    </div>
  );
};

export default Hero;
