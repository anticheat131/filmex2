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
        className="text-3xl tracking-wide text-white"
        style={{ letterSpacing: '0.05em' }}
      >
        Filme
        <span className="text-indigo-500">X</span>
      </span>
    </Link>
  );
};

export default Logo;
