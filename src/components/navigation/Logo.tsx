import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link
      to="/"
      className="relative flex items-center gap-1 select-none overflow-hidden"
      aria-label="Filmex Home"
      style={{
        fontFamily: "'Poppins', 'Segoe UI', sans-serif",
        fontWeight: 700,
        textDecoration: 'none',
      }}
    >
      {/* Animated Mist Layer */}
      <div
        className="absolute inset-0 z-0 pointer-events-none mist"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.2) 0%, transparent 80%)',
          opacity: 0.4,
        }}
      />

      {/* Logo Text */}
      <span className="text-3xl tracking-wide text-white relative z-10">
        Filme<span className="text-indigo-500">X</span>
      </span>

      <style>
        {`
          @keyframes mistMove {
            0% {
              transform: translateX(-30%) translateY(-10%);
            }
            50% {
              transform: translateX(10%) translateY(10%);
            }
            100% {
              transform: translateX(-30%) translateY(-10%);
            }
          }
          .mist {
            filter: blur(10px);
            animation: mistMove 15s ease-in-out infinite;
            will-change: transform;
          }
        `}
      </style>
    </Link>
  );
};

export default Logo;
