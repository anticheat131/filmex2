import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link
      to="/"
      className="relative inline-block select-none"
      aria-label="Filmex Home"
      style={{
        fontFamily: "'Poppins', 'Segoe UI', sans-serif",
        fontWeight: 700,
        textDecoration: 'none',
      }}
    >
      <span className="relative inline-block">
        {/* Mist overlay sized to the text */}
        <span
          className="absolute inset-0 pointer-events-none mist"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, transparent 80%)',
            opacity: 0.7,
          }}
        />

        {/* Logo Text */}
        <span className="text-3xl tracking-wide text-white relative z-10">
          Filme<span className="text-indigo-500">X</span>
        </span>
      </span>

      <style>
        {`
          @keyframes mistMove {
            0% { transform: translateX(-40%) translateY(-20%); }
            50% { transform: translateX(20%) translateY(10%); }
            100% { transform: translateX(-40%) translateY(-20%); }
          }

          .mist {
            filter: blur(20px);
            animation: mistMove 12s ease-in-out infinite;
            will-change: transform;
          }
        `}
      </style>
    </Link>
  );
};

export default Logo;
