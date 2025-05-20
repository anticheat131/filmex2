import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link
      to="/"
      className="relative flex items-center gap-1 select-none"
      aria-label="Filmex Home"
      style={{
        fontFamily: "'Poppins', 'Segoe UI', sans-serif",
        fontWeight: 700,
        textDecoration: 'none',
      }}
    >
      {/* Fog effect overlay (semi-transparent with blur) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, transparent 70%)',
          filter: 'blur(8px)',
          opacity: 0.4,
        }}
      />

      {/* Main Logo Text */}
      <span className="text-3xl tracking-wide text-white relative z-10">
        Filme
        <span className="text-indigo-500">X</span>
      </span>
    </Link>
  );
};

export default Logo;
