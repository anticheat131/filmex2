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
        fontWeight: 500, // Less bold than before
        textDecoration: 'none',
      }}
    >
      <span className="text-3xl tracking-wide relative z-10">
        <span className="text-indigo-500">F</span>
        <span className="text-white">ilmex</span>
      </span>
    </Link>
  );
};

export default Logo;
