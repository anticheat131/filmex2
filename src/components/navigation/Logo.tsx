import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link
      to="/"
      className="relative flex items-center gap-3 font-bold group py-2"
      aria-label="Watch on Filmex"
    >
      {/* Play Icon */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 shadow-inner">
        <div className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white translate-x-[1px]" />
        <div className="absolute inset-0 rounded-full animate-pulse-slow bg-white/10 blur-sm" />
      </div>

      {/* Text Logo */}
      <div className="relative z-10 flex items-baseline gap-2 tracking-tight">
        <span className="text-xl md:text-2xl font-extrabold text-white/90">
          Watch on
        </span>
        <span className="text-xl md:text-2xl font-extrabold text-white relative">
          Filmex
          {/* Sparkle Animation */}
          <span className="absolute -top-1 -right-2 w-2 h-2 bg-white rounded-full animate-sparkle" />
        </span>
      </div>

      {/* Background shimmer on hover */}
      <div className="absolute inset-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 rounded-lg blur-sm rotate-2" />
      </div>
    </Link>
  );
};

export default Logo;
