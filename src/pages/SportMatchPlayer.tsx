import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { getMatchStreams } from '@/utils/sports-api';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { saveLocalData, getLocalData } from '@/utils/supabase';

const SportMatchPlayer = () => {
  const { id, source } = useParams();
  const { toast } = useToast();
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [isPlayerLoaded, setIsPlayerLoaded] = useState(false);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const [cachedStreams, setCachedStreams] = useState(null);

  useEffect(() => {
    const loadCachedData = async () => {
      if (!id) return;
      const data = await getLocalData(`sport-streams-${id}`, null);
      setCachedStreams(data);
    };
    loadCachedData();
  }, [id]);

  const { data: streams, isLoading, error } = useQuery({
    queryKey: ['match-streams', id],
    queryFn: () => getMatchStreams(null, id), // fetch all sources
    placeholderData: cachedStreams,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  // Clean and deduplicate streams
  const cleanStreams = useMemo(() => {
    if (!streams) return [];
    const seen = new Set();
    return streams.filter(s => {
      if (!s.source || !s.embedUrl) return false;
      const key = s.source + '|' + s.embedUrl;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [streams]);

  // Unique sources list
  const uniqueSources = useMemo(() => {
    const sourcesSet = new Set(cleanStreams.map(s => s.source));
    return Array.from(sourcesSet);
  }, [cleanStreams]);

  // Set initial selectedSource on streams load or URL param change
  useEffect(() => {
    if (cleanStreams.length === 0) {
      setSelectedSource(null);
      return;
    }
    const preferred = cleanStreams.find(s => s.source === source && s.embedUrl);
    if (preferred) {
      setSelectedSource(preferred.source);
    } else {
      setSelectedSource(uniqueSources[0]);
    }
  }, [cleanStreams, source, uniqueSources]);

  // Streams filtered by selected source
  const currentStreams = useMemo(() => {
    if (!selectedSource) return [];
    return cleanStreams.filter(s => s.source === selectedSource);
  }, [cleanStreams, selectedSource]);

  const embedUrl = currentStreams.length > 0 ? currentStreams[0].embedUrl : '';

  const handleSourceChange = (src: string) => {
    setSelectedSource(src);
    setIsPlayerLoaded(false);
    setLoadAttempts(0);

    toast({
      title: "Source changed",
      description: `Switched to ${src}`,
      duration: 2000,
    });
  };

  const handleIframeLoad = () => {
    setIsPlayerLoaded(true);
    toast({ title: "Stream loaded", description: "Video player ready", duration: 2000 });
  };

  const handleIframeError = () => {
    setLoadAttempts(prev => prev + 1);

    if (loadAttempts < 2) {
      toast({
        title: "Stream loading failed",
        description: "Attempting to reload...",
        variant: "destructive",
        duration: 3000,
      });
      setIsPlayerLoaded(false);
    } else {
      toast({
        title: "Stream unavailable",
        description: "Please try another source",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <p>Invalid match ID. Please check the URL.</p>
      </div>
    );
  }

  if (isLoading && !cachedStreams) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent mx-auto mb-4"></div>
          <p>Loading video player...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4">Error Loading Player</h2>
          <p className="text-white/70 mb-4">We couldn't load the video player for this match.</p>
          <p className="text-sm text-white/50">Technical details: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="pt-20 pb-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Sport Match Player</h1>
              <p className="text-white/70">Watching match ID: {id}</p>
            </div>

            {/* Source Dropdown */}
            {uniqueSources.length > 1 && (
              <div className="mb-4 flex items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger className="bg-white/10 text-white rounded-md px-4 py-2 inline-flex items-center justify-center">
                    {selectedSource ? `Source: ${selectedSource}` : 'Select Source'}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background border border-white/20">
                    {uniqueSources.map((src) => (
                      <DropdownMenuItem key={src} onSelect={() => handleSourceChange(src)}>
                        {src}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="text-sm text-white/50">
                  {isPlayerLoaded ? (
                    <span className="text-green-400">✓ Stream loaded</span>
                  ) : embedUrl ? (
                    <span className="animate-pulse">Loading stream...</span>
                  ) : (
                    <span>No embed URL</span>
                  )}
                </div>
              </div>
            )}

            {/* Video Player */}
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              {embedUrl ? (
                <iframe
                  key={`${selectedSource}-${loadAttempts}`}
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allowFullScreen
                  title="Video Player"
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                ></iframe>
              ) : (
                <div className="flex items-center justify-center h-full text-white">
                  <p>No streams or embed URL available for this match.</p>
                </div>
              )}

              {!isPlayerLoaded && embedUrl && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-accent mx-auto mb-2"></div>
                    <p>Loading stream...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Info */}
            {selectedSource && (
              <div className="mt-4 p-4 bg-white/5 rounded-md">
                <h3 className="text-lg font-medium text-white mb-2">Stream Information</h3>
                <p className="text-sm text-white/70">
                  Source: {selectedSource} • 
                  Quality: {currentStreams[0]?.hd ? 'HD
