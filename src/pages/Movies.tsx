'use client'

import React, { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Grid3X3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MediaCard from '@/components/MediaCard'
import { getDiscover } from '@/lib/tmdb'
import { useInView } from 'react-intersection-observer'

const Movies = () => {
  const [media, setMedia] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [selectedTab, setSelectedTab] = useState('popular')
  const [sortBy, setSortBy] = useState('default')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [genreFilter, setGenreFilter] = useState('all')
  const { ref, inView } = useInView()

  const fetchData = async () => {
    const fetchedData = await getDiscover('movie', selectedTab, page)
    setMedia(prev => [...prev, ...fetchedData])
  }

  useEffect(() => {
    fetchData()
  }, [selectedTab, page])

  useEffect(() => {
    if (inView) {
      setPage(prev => prev + 1)
    }
  }, [inView])

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'grid' ? 'list' : 'grid'))
  }

  const sortMedia = (media: any[]) => {
    switch (sortBy) {
      case 'title':
        return [...media].sort((a, b) => a.title.localeCompare(b.title))
      case 'release_date':
        return [...media].sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''))
      case 'rating':
        return [...media].sort((a, b) => b.vote_average - a.vote_average)
      default:
        return media
    }
  }

  const filteredMedia = media.filter(item => {
    if (genreFilter === 'all') return true
    return item.genre_ids.includes(Number(genreFilter))
  })

  const sortedAndFilteredMedia = sortMedia(filteredMedia)

  return (
    <div className="px-4 md:px-12 py-6">
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <div className="flex justify-center mb-4">
          <TabsList>
            <TabsTrigger value="popular" className="data-[state=active]:bg-accent/20">Popular</TabsTrigger>
            <TabsTrigger value="top_rated" className="data-[state=active]:bg-accent/20">Top Rated</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div className="flex justify-center mb-6">
        <div className="flex flex-wrap justify-center gap-4">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
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
      </div>

      <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' : 'grid-cols-1'}`}>
        {sortedAndFilteredMedia.map((item, index) => (
          <MediaCard key={`${item.id}-${index}`} media={item} type="movie" viewMode={viewMode} />
        ))}
      </div>

      <div ref={ref} className="h-10" />
    </div>
  )
}

export default Movies
