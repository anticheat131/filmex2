import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Film, Tv, TrendingUp, History, UserCircle, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks';

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface NavLinksProps {
  mobile?: boolean;
  onClick?: () => void;
  withDropdowns?: boolean;
}

const NavLinks = ({ mobile = false, onClick, withDropdowns = false }: NavLinksProps) => {
  const location = useLocation();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    { title: 'Home', path: '/', icon: <Home size={18} /> },
    { title: 'Movies', path: '/movie', icon: <Film size={18} /> },
    { title: 'TV Shows', path: '/tv', icon: <Tv size={18} /> },
    { title: 'Trending', path: '/trending', icon: <TrendingUp size={18} /> },
    { title: 'Watch History', path: '/watch-history', icon: <History size={18} /> },
  ];

  const dropdowns: Record<string, React.ReactNode> = {
    'Movies': (
      <div className="navbar-dropdown">
        <div className="dropdown-section">
          <div className="dropdown-section-title">Movies</div>
          <Link to="/movie/popular" className="dropdown-link">Popular Movies</Link>
          <Link to="/movie/top-rated" className="dropdown-link">Top Rated</Link>
          <Link to="/movie/upcoming" className="dropdown-link">Upcoming</Link>
        </div>
      </div>
    ),
    'TV Shows': (
      <div className="navbar-dropdown">
        <div className="dropdown-section">
          <div className="dropdown-section-title">TV Shows</div>
          <Link to="/tv/popular" className="dropdown-link">Popular Shows</Link>
          <Link to="/tv/top-rated" className="dropdown-link">Top Rated</Link>
          <Link to="/tv/airing-today" className="dropdown-link">Airing Today</Link>
        </div>
      </div>
    ),
    'Trending': (
      <div className="navbar-dropdown">
        <div className="dropdown-section">
          <div className="dropdown-section-title">Trending</div>
          <Link to="/trending/movie" className="dropdown-link">Trending Movies</Link>
          <Link to="/trending/tv" className="dropdown-link">Trending Shows</Link>
        </div>
      </div>
    ),
  };

  return (
    <>
      {mobile ? (
        <div className="space-y-1 px-2 py-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              } transition-all duration-200`}
              onClick={onClick}
            >
              <span>{item.icon}</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <div key={item.path} className={`navbar-dropdown-group`}>
              <Link
                to={item.path}
                className={`navbar-link${location.pathname === item.path ? ' navbar-link-active' : ''}`}
              >
                {item.icon}
                <span style={{marginLeft: 6}}>{item.title}</span>
              </Link>
              {withDropdowns && dropdowns[item.title]}
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default NavLinks;
