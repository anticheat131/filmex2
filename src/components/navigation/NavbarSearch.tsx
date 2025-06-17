import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchMedia } from '@/utils/api';
import { Media } from '@/utils/types';
import { Search as SearchIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Animated placeholder logic
const useAnimatedPlaceholder = () => {
  const { t } = useTranslation();
  const staticText = t('Search for', 'Search for ');
  const dynamicPhrases = [t('TV Show...', 'TV Show...'), t('Movie...', 'Movie...')];
  const [displayedText, setDisplayedText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [firstCycle, setFirstCycle] = useState(true);
  const typingSpeed = 120;
  const deletingSpeed = 60;
  const pauseDelay = 1200;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (firstCycle) {
      // First cycle: type full phrase including "Search for "
      const fullPhrase = staticText + dynamicPhrases[phraseIndex];
      if (!isDeleting && charIndex <= fullPhrase.length) {
        setDisplayedText(fullPhrase.substring(0, charIndex));
        if (charIndex === fullPhrase.length) {
          timeout = setTimeout(() => setIsDeleting(true), pauseDelay);
        } else {
          timeout = setTimeout(() => setCharIndex(charIndex + 1), typingSpeed);
        }
      } else if (isDeleting && charIndex >= 0) {
        setDisplayedText(fullPhrase.substring(0, charIndex));
        if (charIndex === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % dynamicPhrases.length);
          setFirstCycle(false);
        }
        timeout = setTimeout(() => setCharIndex(charIndex - 1), deletingSpeed);
      }
    } else {
      // Subsequent cycles: only erase/write dynamic part
      const phrase = dynamicPhrases[phraseIndex];
      if (!isDeleting && charIndex <= phrase.length) {
        setDisplayedText(staticText + phrase.substring(0, charIndex));
        if (charIndex === phrase.length) {
          timeout = setTimeout(() => setIsDeleting(true), pauseDelay);
        } else {
          timeout = setTimeout(() => setCharIndex(charIndex + 1), typingSpeed);
        }
      } else if (isDeleting && charIndex >= 0) {
        setDisplayedText(staticText + phrase.substring(0, charIndex));
        if (charIndex === 0) {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % dynamicPhrases.length);
        }
        timeout = setTimeout(() => setCharIndex(charIndex - 1), deletingSpeed);
      }
    }
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, phraseIndex, firstCycle]);
  return displayedText;
};

const NavbarSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Media[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const animatedPlaceholder = useAnimatedPlaceholder();

  useEffect(() => {
    if (query.trim().length > 0) {
      const timer = setTimeout(async () => {
        try {
          const results = await searchMedia(query);
          setSuggestions(results.slice(0, 5));
          setShowSuggestions(true);
        } catch {
          setSuggestions([]);
        }
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (item: Media) => {
    navigate(`/${item.media_type}/${item.id}`);
    setQuery('');
    setShowSuggestions(false);
  };

  // Helper to get poster image
  const getPoster = (item: Media) => {
    if (!item.poster_path) return null;
    return `https://image.tmdb.org/t/p/w92${item.poster_path}`;
  };

  return (
    <div className="relative w-full">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        className="flex h-10 w-full rounded-md border border-input bg-background py-2 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-800 focus-visible:ring-offset-0 focus:border-zinc-800 hover:border-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 px-10 text-base transition-colors"
        placeholder={animatedPlaceholder}
        name="q"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        onFocus={() => query.length > 0 && setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1 z-50 bg-background border border-zinc-800 rounded-md shadow-lg overflow-hidden">
          {suggestions.map((item) => (
            <button
              key={`${item.media_type}-${item.id}`}
              className="flex items-center w-full px-4 py-2 text-left hover:bg-zinc-900 transition-colors"
              onMouseDown={() => handleSuggestionClick(item)}
            >
              {getPoster(item) ? (
                <img
                  src={getPoster(item) as string}
                  alt={item.title || item.name}
                  className="h-8 w-6 object-cover rounded mr-3 flex-shrink-0 bg-zinc-700"
                  loading="lazy"
                />
              ) : (
                <div className="h-8 w-6 mr-3 rounded bg-zinc-700 flex items-center justify-center text-xs text-zinc-400">
                  {item.media_type === 'movie' ? '🎬' : '📺'}
                </div>
              )}
              <span className="flex-1 truncate">{item.title || item.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NavbarSearch;
