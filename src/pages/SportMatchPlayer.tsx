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

const ALL_SOURCES = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot'];

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
