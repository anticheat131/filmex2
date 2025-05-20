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
      {/* Soft mist layer behind the text */}
      <span className="absolute inset-0 pointer-events-none opacity-20 blur-[4px] z-0 bg-gradient-to-br from-white/10 via-white/20 to-transparent" />

      {/* Logo text */}
      <span
        className="text-3xl tracking-wide text-white relative z-10"
        style={{ letterSpacing: '0.05em' }}
      >
        Filme
        <span className="text-indigo-500">X</span>
      </span>
    </Link>
  );
};

export default Logo;
