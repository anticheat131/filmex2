import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTransition from '@/components/PageTransition';
import { Stream } from '@/utils/sports-types';
import { getMatchStreams } from '@/utils/sports-api';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Sparkles, Tv, Languages, Check, Info } from 'lucide-react';
import { useUserPreferences } from '@/hooks/user-preferences';
import { useTranslation } from 'react-i18next';

const SportMatch = () => {
  const { t } = useTranslation();
  const { source, id } = useParams<{ source: string; id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userPreferences } = useUserPreferences();
  const accentColor = userPreferences?.accentColor || 'hsl(var(--accent))';
  
  const [selectedStream, setSelectedStream] = useState<string>('');
  const [iframeUrl, setIframeUrl] = useState<string>('');
  
  // Fetch available streams
  const { 
    data: streams = [], 
    isLoading,
    error
  } = useQuery({
    queryKey: ['sport-streams', source, id],
    queryFn: () => source && id ? getMatchStreams(source, id) : Promise.resolve([]),
    enabled: !!source && !!id,
  });
  
  // Set the first stream as default when data loads
  useEffect(() => {
    if (streams.length > 0 && !selectedStream) {
      setSelectedStream(streams[0].id);
    }
  }, [streams, selectedStream]);
  
  // Update iframe when stream changes
  useEffect(() => {
    if (selectedStream) {
      const stream = streams.find(s => s.id === selectedStream);
      if (stream) {
        setIframeUrl(stream.embedUrl);
      }
    }
  }, [selectedStream, streams]);
  
  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: t('Error'),
        description: t('Failed to load streams. Please try again later.'),
        variant: "destructive"
      });
    }
  }, [error, toast, t]);
  
  const handleStreamChange = (streamId: string) => {
    setSelectedStream(streamId);
    const stream = streams.find(s => s.id === streamId);
    if (stream) {
      toast({
        title: t('Stream Changed'),
        description: t(`Switched to Stream #${stream.streamNo} (${stream.language})`),
      });
    }
  };
  
  return (
    <PageTransition>
      <div className="min-h-screen">
        <Navbar />
        
        <div className="pt-16 px-4 md:px-6 pb-12">
          <div className="max-w-6xl mx-auto">
            {/* Back button */}
            <div className="mb-4 flex items-center">
              <button 
                onClick={() => navigate('/sports')}
                className="text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label={t('Go back')}
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="ml-3 text-xl font-medium text-white">{t('Stream Details')}</h1>
            </div>
            
            {isLoading ? (
              <div className="w-full aspect-video flex items-center justify-center bg-black/50 rounded-lg">
                <div className="animate-pulse text-white">{t('Loading stream...')}</div>
              </div>
            ) : streams.length === 0 ? (
              <div className="w-full aspect-video flex flex-col items-center justify-center bg-black/50 rounded-lg text-white">
                <Info className="h-12 w-12 mb-4 text-white/50" />
                <p className="text-lg mb-2">{t('No streams available')}</p>
                <p className="text-white/70 text-sm mb-6">{t("This match doesn't have any available streams at the moment.")}</p>
                <Button 
                  onClick={() => navigate('/sports')}
                  style={{ backgroundColor: accentColor }}
                >
                  {t('Back to Sports')}
                </Button>
              </div>
            ) : (
              <>
                {/* Player */}
                <div className="rounded-lg overflow-hidden shadow-xl bg-black mb-6">
                  <div className="relative w-full aspect-video">
                    <iframe
                      src={iframeUrl}
                      allowFullScreen
                      className="absolute inset-0 w-full h-full"
                      title={t('Sports Stream')}
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>
                
                {/* Stream selector */}
                <div className="glass p-4 rounded-lg mb-8">
                  <h3 className="text-white font-medium mb-3">{t('Available Streams')}</h3>
                  <p className="text-white/70 text-sm mb-4">
                    {t("If the current stream isn't working, try another one below.")}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-64">
                      <Select value={selectedStream} onValueChange={handleStreamChange}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder={t('Select a stream')} />
                        </SelectTrigger>
                        <SelectContent className="border-white/10">
                          {streams.map((stream) => (
                            <SelectItem 
                              key={stream.id} 
                              value={stream.id} 
                              className="text-white focus:text-white focus:bg-white/10"
                            >
                              <div className="flex items-center gap-2">
                                {selectedStream === stream.id && <Check className="h-4 w-4" />}
                                {t(`Stream #${stream.streamNo} (${stream.language})`)}
                                {stream.hd && (
                                  <Badge 
                                    variant="outline" 
                                    className="ml-1 text-xs py-0 h-4"
                                    style={{ borderColor: accentColor, color: accentColor }}
                                  >
                                    HD
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {streams.map((stream) => (
                        <Button
                          key={stream.id}
                          variant={selectedStream === stream.id ? 'default' : 'outline'}
                          size="sm"
                          className={`gap-1.5 ${
                            selectedStream === stream.id 
                              ? 'text-white' 
                              : 'border-white/20 bg-black/50 text-white hover:bg-black/70'
                          }`}
                          style={{ 
                            backgroundColor: selectedStream === stream.id ? accentColor : undefined 
                          }}
                          onClick={() => handleStreamChange(stream.id)}
                        >
                          <span>#{stream.streamNo}</span>
                          <span className="text-xs opacity-70">{stream.language}</span>
                          {stream.hd && (
                            <Badge 
                              variant="outline" 
                              className="ml-1 text-xs py-0 h-4"
                              style={{ 
                                borderColor: selectedStream === stream.id ? 'white' : accentColor,
                                color: selectedStream === stream.id ? 'white' : accentColor
                              }}
                            >
                              HD
                            </Badge>
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Stream info cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="glass p-4 rounded-lg flex items-start">
                    <div className="p-2 rounded-full" style={{ backgroundColor: accentColor }}>
                      <Languages className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-white font-medium">{t('Multiple Languages')}</h3>
                      <p className="text-white/70 text-sm">
                        {t('Streams available in {{languages}}', { languages: Array.from(new Set(streams.map(s => s.language))).join(', ') })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="glass p-4 rounded-lg flex items-start">
                    <div className="p-2 rounded-full" style={{ backgroundColor: accentColor }}>
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-white font-medium">{t('HD Quality')}</h3>
                      <p className="text-white/70 text-sm">
                        {t('{{count}} of {{total}} streams available in HD', { count: streams.filter(s => s.hd).length, total: streams.length })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="glass p-4 rounded-lg flex items-start">
                    <div className="p-2 rounded-full" style={{ backgroundColor: accentColor }}>
                      <Tv className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-white font-medium">{t('Multiple Sources')}</h3>
                      <p className="text-white/70 text-sm">
                        {t('{{count}} streams from {{sources}} sources', { count: streams.length, sources: Array.from(new Set(streams.map(s => s.source))).length })}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        <Footer />
      </div>
    </PageTransition>
  );
};

export default SportMatch;
