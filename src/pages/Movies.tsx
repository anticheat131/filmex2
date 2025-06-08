// File: Movies.tsx import { useState, useEffect } from 'react'; import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query'; import { getPopularMovies, getTopRatedMovies } from '@/utils/api'; import { Media, ensureExtendedMediaArray } from '@/utils/types'; import { trackMediaPreference } from '@/lib/analytics'; import Navbar from '@/components/Navbar'; import Footer from '@/components/Footer'; import MediaGrid from '@/components/MediaGrid'; import { MediaGridSkeleton } from '@/components/MediaGridSkeleton'; import PageTransition from '@/components/PageTransition'; import { Film, ChevronDown, List, Grid3X3 } from 'lucide-react'; import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; import { Button } from '@/components/ui/button';

const Movies = () => { const [activeTab, setActiveTab] = useState<'popular' | 'top_rated'>('popular'); const [sortBy, setSortBy] = useState<'default' | 'title' | 'release_date' | 'rating'>('default'); const [genreFilter, setGenreFilter] = useState('all'); const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid'); const [popularPage, setPopularPage] = useState(1); const [topRatedPage, setTopRatedPage] = useState(1);

const queryClient = useQueryClient();

const toggleViewMode = () => { setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid')); };

const handleTabChange = (tab: 'popular' | 'top_rated') => { setActiveTab(tab); trackMediaPreference('Movies Tab', tab); };

const { data: popularMovies, isLoading: isLoadingPopular, isError: isErrorPopular, isFetching: isFetchingPopular } = useQuery({ queryKey: ['popularMovies', popularPage], queryFn: () => getPopularMovies(popularPage), placeholderData: keepPreviousData });

const { data: topRatedMovies, isLoading: isLoadingTopRated, isError: isErrorTopRated, isFetching: isFetchingTopRated } = useQuery({ queryKey: ['topRatedMovies', topRatedPage], queryFn: () => getTopRatedMovies(topRatedPage), placeholderData: keepPreviousData });

const handleShowMorePopular = () => setPopularPage((prev) => prev + 1); const handleShowMoreTopRated = () => setTopRatedPage((prev) => prev + 1);

const sortMovies = (movies: Media[] = []) => { return [...movies].sort((a, b) => { switch (sortBy) { case 'title': return a.title.localeCompare(b.title); case 'release_date': return (b.release_date || '').localeCompare(a.release_date || ''); case 'rating': return (b.vote_average || 0) - (a.vote_average || 0); default: return 0; } }); };

const filterByGenre = (movies: Media[] = []) => { if (genreFilter === 'all') return movies; return movies.filter((movie) => movie.genre_ids.includes(Number(genreFilter))); };

const filteredPopularMovies = sortMovies(filterByGenre(popularMovies?.results)); const filteredTopRatedMovies = sortMovies(filterByGenre(topRatedMovies?.results));

const hasMorePopular = popularMovies && popularPage < popularMovies.total_pages; const hasMoreTopRated = topRatedMovies && topRatedPage < topRatedMovies.total_pages;

return ( <PageTransition> <div className="min-h-screen bg-background"> <Navbar /> <main className="container mx-auto px-4 py-8"> <div className="flex items-center gap-3 pt-10 mb-6"> <Film className="h-8 w-8 text-accent animate-pulse-slow" /> <h1 className="text-3xl font-bold text-white">Movies</h1> </div>

<Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <TabsList className="mb-4 md:mb-0">
            <TabsTrigger value="popular" className="data-[state=active]:bg-accent/20">Popular</TabsTrigger>
            <TabsTrigger value="top_rated" className="data-[state=active]:bg-accent/20">Top Rated</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px] border-white/10 text-white bg-transparent">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-background border-white/10 text-white">
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="release_date">Release Date</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>

          <Select value={genreFilter} onValueChange={setGenreFilter}>
            <SelectTrigger className="w-[180px] border-white/10 text-white bg-transparent">
              <SelectValue placeholder="Filter by Genre" />
            </SelectTrigger>
            <SelectContent className="bg-background border-white/10 text-white">
              <SelectItem value="all">All Genres</SelectItem>
              <SelectItem value="28">Action</SelectItem>
              <SelectItem value="12">Adventure</SelectItem>
              <SelectItem value="35">Comedy</SelectItem>
              <SelectItem value="18">Drama</SelectItem>
              <SelectItem value="27">Horror</SelectItem>
              <SelectItem value="10749">Romance</SelectItem>
              <SelectItem value="878">Sci-Fi</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="border-white/10 text-white hover:bg-white/10 group"
            onClick={toggleViewMode}
          >
            {viewMode === 'grid' ? (
              <>
                <List className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                List View
              </>
            ) : (
              <>
                <Grid3X3 className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                Grid View
              </>
            )}
          </Button>
        </div>

        <TabsContent value="popular" className="focus-visible:outline-none animate-fade-in">
          {isLoadingPopular ? (
            <MediaGridSkeleton listView={viewMode === 'list'} />
          ) : isErrorPopular ? (
            <div className="py-12 text-center text-white">Error loading movies. Please try again.</div>
          ) : (
            <>
              <MediaGrid media={ensureExtendedMediaArray(filteredPopularMovies)} title="Popular Movies" listView={viewMode === 'list'} />
              {hasMorePopular && (
                <div className="flex justify-center my-8">
                  <Button 
                    onClick={handleShowMorePopular}
                    variant="outline"
                    className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
                  >
                    {isFetchingPopular ? (
                      <>Loading...</>
                    ) : (
                      <>Show More <ChevronDown className="ml-2 h-4 w-4 animate-bounce" /></>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="top_rated" className="focus-visible:outline-none animate-fade-in">
          {isLoadingTopRated ? (
            <MediaGridSkeleton listView={viewMode === 'list'} />
          ) : isErrorTopRated ? (
            <div className="py-12 text-center text-white">Error loading movies. Please try again.</div>
          ) : (
            <>
              <MediaGrid media={ensureExtendedMediaArray(filteredTopRatedMovies)} title="Top Rated Movies" listView={viewMode === 'list'} />
              {hasMoreTopRated && (
                <div className="flex justify-center my-8">
                  <Button 
                    onClick={handleShowMoreTopRated}
                    variant="outline"
                    className="border-white/10 text-white hover:bg-accent/20 hover:border-accent/50 hover:text-white transition-all duration-300"
                  >
                    {isFetchingTopRated ? (
                      <>Loading...</>
                    ) : (
                      <>Show More <ChevronDown className="ml-2 h-4 w-4 animate-bounce" /></>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </main>
    <Footer />
  </div>
</PageTransition>

); };

export default Movies;

