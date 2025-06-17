import { Routes, Route, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AnalyticsWrapper } from '@/components/AnalyticsWrapper';
import { useTranslation } from 'react-i18next';

// Lazy load pages
const Index = lazy(() => import('./pages/Index'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Profile = lazy(() => import('./pages/Profile'));
const Movies = lazy(() => import('./pages/Movies'));
const TVShowsPage = lazy(() => import('./pages/tv'));
const Sports = lazy(() => import('./pages/Sports'));
const Search = lazy(() => import('./pages/Search'));
const WatchHistory = lazy(() => import('./pages/WatchHistory'));
const MovieDetails = lazy(() => import('./pages/MovieDetails'));
const TVDetails = lazy(() => import('./pages/TVDetails'));
const SportMatch = lazy(() => import('./pages/SportMatch'));
const SportMatchPlayer = lazy(() => import('./pages/SportMatchPlayer'));
const Player = lazy(() => import('./pages/Player'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Trending = lazy(() => import('./pages/Trending'));
const TrendingMovies = lazy(() => import('./pages/TrendingMovies'));
const TrendingTVShows = lazy(() => import('./pages/TrendingTVShows'));
const WatchTogether = lazy(() => import('./pages/WatchTogether'));
const LiveTV = lazy(() => import('./pages/live-tv'));
const ChannelPage = lazy(() => import('./pages/ChannelPage'));
const AudiobooksPage = lazy(() => import('./pages/Audiobooks'));
const ListenAudiobookPage = lazy(() => import('./pages/ListenAudiobook'));
const PersonDetailPage = lazy(() => import('./pages/person/[id]'));

// Legal pages
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const ContentRemoval = lazy(() => import('./pages/ContentRemoval'));
const DMCANotice = lazy(() => import('./pages/DMCANotice'));

// Movies
const MovieDiscover = lazy(() => import('./pages/movie/discover'));
const MoviePopular = lazy(() => import('./pages/movie/popular'));
const MovieNowPlaying = lazy(() => import('./pages/movie/now-playing'));
const MovieUpcoming = lazy(() => import('./pages/movie/upcoming'));
const MovieTopRated = lazy(() => import('./pages/movie/top-rated'));
const MovieGenres = lazy(() => import('./pages/movie/genres'));
const MovieAnime = lazy(() => import('./pages/movie/anime'));
const MovieNetflix = lazy(() => import('./pages/movie/netflix'));
const MovieDisney = lazy(() => import('./pages/movie/disney'));
const MovieApple = lazy(() => import('./pages/movie/apple'));
const MoviePrime = lazy(() => import('./pages/movie/prime'));
// TV
const TVDiscover = lazy(() => import('./pages/tv/discover'));
const TVPopular = lazy(() => import('./pages/tv/popular'));
const TVAiringToday = lazy(() => import('./pages/tv/airing-today'));
const TVOnTheAir = lazy(() => import('./pages/tv/on-the-air'));
const TVTopRated = lazy(() => import('./pages/tv/top-rated'));
const TVAnimeSeries = lazy(() => import('./pages/tv/anime-series'));
const TVNetflix = lazy(() => import('./pages/tv/netflix'));
const TVApple = lazy(() => import('./pages/tv/apple'));
const TVDisney = lazy(() => import('./pages/tv/disney'));
const TVPrime = lazy(() => import('./pages/tv/prime'));
// Trending
const TrendingMovie = lazy(() => import('./pages/trending/movie'));
const TrendingTV = lazy(() => import('./pages/trending/tv'));
// More
const PopularPeople = lazy(() => import('./pages/person/popular'));
const News = lazy(() => import('./pages/news'));
const Development = lazy(() => import('./pages/development'));


export default function AppRoutes() {
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div>{t('Loading...')}</div>}>
      <AnalyticsWrapper>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/watch-history" element={<WatchHistory />} />
            <Route path="/favorites" element={<WatchHistory />} />
            <Route path="/watchlist" element={<WatchHistory />} />
          </Route>

          {/* Content routes */}
          <Route path="/movie" element={<Movies />} />
          <Route path="/movie/:id" element={<MovieDetails />} />
          <Route path="/tv" element={<TVShowsPage />} />
          <Route path="/tv/:id" element={<TVDetails />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/sports/:id" element={<SportMatch />} />
          <Route path="/sports/player/:id" element={<SportMatchPlayer />} />
          <Route path="/watch/:type/:id" element={<Player />} />
          <Route path="/watch/:type/:id/:season/:episode" element={<Player />} />
          <Route path="/search" element={<Search />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/trending/movie" element={<TrendingMovies />} />
          <Route path="/trending/tv" element={<TrendingTVShows />} />
          <Route path="/watch-together" element={<WatchTogether />} />
          <Route path="/live-tv" element={<LiveTV />} />
          <Route path="/watch/channel/:id" element={<ChannelPage />} />
          <Route path="/audiobooks" element={<AudiobooksPage />} />
          <Route path="/listen/:id/:slug" element={<ListenAudiobookPage />} />
          <Route path="/person/:id" element={<PersonDetailPage />} />

          {/* Movies dropdown pages */}
          <Route path="/movie/discover" element={<MovieDiscover />} />
          <Route path="/movie/popular" element={<MoviePopular />} />
          <Route path="/movie/now-playing" element={<MovieNowPlaying />} />
          <Route path="/movie/upcoming" element={<MovieUpcoming />} />
          <Route path="/movie/top-rated" element={<MovieTopRated />} />
          <Route path="/movie/genres" element={<MovieGenres />} />
          <Route path="/movie/anime" element={<MovieAnime />} />
          <Route path="/movie/netflix" element={<MovieNetflix />} />
          <Route path="/movie/disney" element={<MovieDisney />} />
          <Route path="/movie/apple" element={<MovieApple />} />
          <Route path="/movie/prime" element={<MoviePrime />} />
          {/* TV dropdown pages */}
          <Route path="/tv/discover" element={<TVDiscover />} />
          <Route path="/tv/popular" element={<TVPopular />} />
          <Route path="/tv/airing-today" element={<TVAiringToday />} />
          <Route path="/tv/on-the-air" element={<TVOnTheAir />} />
          <Route path="/tv/top-rated" element={<TVTopRated />} />
          <Route path="/tv/anime-series" element={<TVAnimeSeries />} />
          <Route path="/tv/netflix" element={<TVNetflix />} />
          <Route path="/tv/apple" element={<TVApple />} />
          <Route path="/tv/disney" element={<TVDisney />} />
          <Route path="/tv/prime" element={<TVPrime />} />
          {/* Trending dropdown pages */}
          <Route path="/trending/movie" element={<TrendingMovie />} />
          <Route path="/trending/tv" element={<TrendingTV />} />
          {/* More dropdown pages */}
          <Route path="/person/popular" element={<PopularPeople />} />
          <Route path="/news" element={<News />} />
          <Route path="/development" element={<Development />} />

          {/* Legal routes */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/content-removal" element={<ContentRemoval />} />
          <Route path="/dmca" element={<DMCANotice />} />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnalyticsWrapper>
    </Suspense>
  );
}
