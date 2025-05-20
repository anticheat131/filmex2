import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center gap-1 select-none"
      aria-label="Filmex Home"
      style={{
        fontFamily: "'Poppins', 'Segoe UI', sans-serif",
        fontWeight: 700,
        textDecoration: 'none',
      }}
    >
      <span
        className="text-3xl text-white tracking-wide relative"
        style={{ letterSpacing: '0.05em' }}
      >
        Filme
        <span className="text-indigo-500">X</span>
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-glow"
          style={{
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            opacity: 0.5,
          }}
        />
      </span>

      <style>
        {`
          @keyframes glow {
            0% {
              transform: translateX(-120%);
            }
            100% {
              transform: translateX(120%);
            }
          }
          .animate-glow {
            animation: glow 3s infinite;
            background-size: 200% auto;
            will-change: transform;
          }
        `}
      </style>
    </Link>
  );
};

export default Logo;
