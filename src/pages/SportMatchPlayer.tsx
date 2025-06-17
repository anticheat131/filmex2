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
import { useTranslation } from 'react-i18next';

const ALL_SOURCES = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot'];

const SportMatchPlayer = () => {
  const { t } = useTranslation();
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
    queryFn: () => getMatchStreams(null, id),
    placeholderData: cachedStreams,
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const cleanStreams = useMemo(() => {
    if (!streams) return [];
    return streams.filter(s => s.source && s.embedUrl);
  }, [streams]);

  const availableSourcesMap = useMemo(() => {
    const map = new Map();
    for (const s of cleanStreams) {
      if (!map.has(s.source)) {
        map.set(s.source, s);
      }
    }
    return map;
  }, [cleanStreams]);

  useEffect(() => {
    if (selectedSource) return;
    if (source && availableSourcesMap.has(source)) {
      setSelectedSource(source);
    } else {
      const firstAvailable = ALL_SOURCES.find(src => availableSourcesMap.has(src));
      if (firstAvailable) setSelectedSource(firstAvailable);
    }
  }, [source, availableSourcesMap, selectedSource]);

  const currentStream = selectedSource ? availableSourcesMap.get(selectedSource) : null;
  const embedUrl = currentStream?.embedUrl || '';

  const handleSourceChange = (src) => {
    setSelectedSource(src);
    setIsPlayerLoaded(false);
    setLoadAttempts(0);
    toast({
      title: t("Source changed"),
      description: t(`Switched to ${src}`),
      duration: 2000,
    });
  };

  const handleIframeLoad = () => {
    setIsPlayerLoaded(true);
    toast({ title: t("Stream loaded"), description: t("Video player ready"), duration: 2000 });
  };

  const handleIframeError = () => {
    setLoadAttempts(prev => prev + 1);
    if (loadAttempts < 2) {
      toast({
        title: t("Stream loading failed"),
        description: t("Attempting to reload..."),
        variant: "destructive",
        duration: 3000,
      });
      setIsPlayerLoaded(false);
    } else {
      toast({
        title: t("Stream unavailable"),
        description: t("Please try another source"),
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  if (!id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <p>{t("Invalid match ID. Please check the URL.")}</p>
      </div>
    );
  }

  if (isLoading && !cachedStreams) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent mx-auto mb-4"></div>
          <p>{t("Loading video player...")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4">{t("Error Loading Player")}</h2>
          <p className="text-white/70 mb-4">{t("We couldn't load the video player for this match.")}</p>
          <p className="text-sm text-white/50">{t("Technical details:")} {error.message}</p>
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
              <h1 className="text-3xl font-bold text-white mb-2">{t("Sport Match Player")}</h1>
              <p className="text-white/70">{t("Watching match ID:")} {id}</p>
            </div>

            {/* Source Dropdown */}
            <div className="mb-4 flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger className="bg-white/10 text-white rounded-md px-4 py-2 inline-flex items-center justify-center">
                  {selectedSource ? `${t("Source")}: ${selectedSource}` : t('Select Source')}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border border-white/20">
                  {ALL_SOURCES.map((src) => {
                    const isAvailable = availableSourcesMap.has(src);
                    return (
                      <DropdownMenuItem
                        key={src}
                        onSelect={() => {
                          if (isAvailable) handleSourceChange(src);
                        }}
                        className={isAvailable ? '' : 'text-white/30 pointer-events-none'}
                      >
                        {src} {isAvailable ? '' : ` (${t('Unavailable')})`}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="text-sm text-white/50">
                {isPlayerLoaded ? (
                  <span className="text-green-400">✓ {t("Stream loaded")}</span>
                ) : embedUrl ? (
                  <span className="animate-pulse">{t("Loading stream...")}</span>
                ) : (
                  <span>{t("No embed URL")}</span>
                )}
              </div>
            </div>

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
                  <p>{t("No streams or embed URL available for this match.")}</p>
                </div>
              )}

              {!isPlayerLoaded && embedUrl && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-accent mx-auto mb-2"></div>
                    <p>{t("Loading stream...")}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Stream Info */}
            {selectedSource && currentStream && (
              <div className="mt-4 p-4 bg-white/5 rounded-md">
                <h3 className="text-lg font-medium text-white mb-2">{t("Stream Information")}</h3>
                <p className="text-sm text-white/70">
                  {t("Source")}: {selectedSource} • 
                  {t("Quality")}: {currentStream.hd ? t('HD') : t('SD')} •
                  {t("Status")}: {isPlayerLoaded ? t('Ready') : t('Loading')}
                </p>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default SportMatchPlayer;
