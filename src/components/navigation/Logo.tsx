import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center font-semibold relative py-1 select-none"
      aria-label="Filmex Home"
    >
      <span className="text-2xl font-semibold text-gray-400 tracking-wider" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        Filmex
      </span>
    </Link>
  );
};

export default Logo;
