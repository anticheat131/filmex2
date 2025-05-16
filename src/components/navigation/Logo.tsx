import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center font-semibold relative py-1 select-none"
      aria-label="Filmex Home"
      style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
    >
      <span
        className="text-2xl tracking-wider font-semibold text-gray-400 relative overflow-hidden"
      >
        Filmex
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-shine"
          style={{
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            opacity: 0.6,
          }}
        />
      </span>

      <style>
        {`
          @keyframes shine {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          .animate-shine {
            animation: shine 2.5s infinite;
            will-change: transform;
          }
        `}
      </style>
    </Link>
  );
};

export default Logo;
