import React from 'react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link
      to="/"
      className="flex items-center font-bold relative py-2 select-none"
      aria-label="Filmex Home"
    >
      <span className="text-3xl font-extrabold text-white tracking-wide">
        Filmex
      </span>
    </Link>
  );
};

export default Logo;
