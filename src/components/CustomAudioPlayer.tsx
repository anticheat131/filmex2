import React, { useRef, useState, useEffect } from 'react';

// Lucide icons as React components (or use lucide-react package if installed)
const IconSkipBack = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" x2="5" y1="19" y2="5"></line></svg>
);
const IconRewind = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 19 2 12 11 5 11 19"></polygon><polygon points="22 19 13 12 22 5 22 19"></polygon></svg>
);
const IconPlay = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>
);
const IconPause = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
);
const IconFastForward = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 19 22 12 13 5 13 19"></polygon><polygon points="2 19 11 12 2 5 2 19"></polygon></svg>
);
const IconSkipForward = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" x2="19" y1="5" y2="19"></line></svg>
);
const IconVolume = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>
);
const IconTimer = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="10" x2="14" y1="2" y2="2"></line><line x1="12" x2="15" y1="14" y2="11"></line><circle cx="12" cy="14" r="8"></circle></svg>
);
const IconList = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" x2="21" y1="6" y2="6"></line><line x1="8" x2="21" y1="12" y2="12"></line><line x1="8" x2="21" y1="18" y2="18"></line><line x1="3" x2="3.01" y1="6" y2="6"></line><line x1="3" x2="3.01" y1="12" y2="12"></line><line x1="3" x2="3.01" y1="18" y2="18"></line></svg>
);

function formatTime(secs: number) {
  if (isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface CustomAudioPlayerProps {
  src: string;
  title?: string;
  trackNumber?: number;
  duration?: number;
}

const speeds = [0.75, 1, 1.25, 1.5, 2];

const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({ src, title = 'Playing Track', trackNumber = 1 }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeed, setShowSpeed] = useState(false);

  useEffect(() => {
    console.log('CustomAudioPlayer src:', src);
  }, [src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.playbackRate = playbackRate;
  }, [volume, playbackRate]);

  useEffect(() => {
    if (playing) {
      audioRef.current?.play().catch((err) => {
        console.error('Audio play() failed:', err);
      });
    } else {
      audioRef.current?.pause();
    }
  }, [playing]);

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  };
  const handleLoadedMetadata = () => {
    setDuration(audioRef.current?.duration || 0);
  };
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };
  const handleSpeedClick = () => setShowSpeed((s) => !s);
  const handleSpeedSelect = (s: number) => {
    setPlaybackRate(s);
    setShowSpeed(false);
    if (audioRef.current) audioRef.current.playbackRate = s;
  };
  const handlePlayPause = () => setPlaying((p) => !p);
  const handleSkip = (secs: number) => {
    if (audioRef.current) {
      let t = audioRef.current.currentTime + secs;
      t = Math.max(0, Math.min(duration, t));
      audioRef.current.currentTime = t;
      setCurrentTime(t);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-md border bg-background p-4 shadow-lg">
      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setPlaying(false)}
        style={{ display: 'none' }}
        onError={e => {
          console.error('AUDIO ERROR', e);
        }}
      />
      <div className="items-center sm:flex sm:justify-between">
        <h2 className="text-md  mb-2 font-semibold sm:text-lg md:m-0">
          {title} {trackNumber ? trackNumber : ''}
        </h2>
        <div className="flex items-center gap-2 relative">
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md h-10 px-2"
            onClick={handleSpeedClick}
            type="button"
            data-state="closed"
          >
            <IconTimer className="size-5" />
            <span className="ml-1 text-xs">Playback Speed: {playbackRate}x</span>
          </button>
          {showSpeed && (
            <div className="absolute z-10 top-12 right-0 bg-background border rounded shadow p-2 flex flex-col">
              {speeds.map((s) => (
                <button
                  key={s}
                  className={`px-2 py-1 text-sm text-left hover:bg-accent rounded ${s === playbackRate ? 'font-bold' : ''}`}
                  onClick={() => handleSpeedSelect(s)}
                >
                  {s}x
                </button>
              ))}
            </div>
          )}
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10"
            type="button"
            data-state="closed"
          >
            <IconList className="size-5" />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8 size-12 sm:size-16" disabled>
          <IconSkipBack className="!size-8 sm:!size-12" />
        </button>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8 size-12 sm:size-16" onClick={() => handleSkip(-10)}>
          <IconRewind className="!size-8 sm:!size-12" />
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8 size-16 sm:size-20"
          onClick={handlePlayPause}
        >
          {playing ? <IconPause className="!size-10 sm:!size-14" /> : <IconPlay className="!size-10 sm:!size-14" />}
        </button>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8 size-12 sm:size-16" onClick={() => handleSkip(10)}>
          <IconFastForward className="!size-8 sm:!size-12" />
        </button>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8 size-12 sm:size-16" disabled>
          <IconSkipForward className="!size-8 sm:!size-12" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="min-w-[40px] text-sm text-muted-foreground">{formatTime(currentTime)}</span>
        <span dir="ltr" data-orientation="horizontal" aria-disabled="false" className="relative flex w-full touch-none select-none items-center flex-1" style={{ ['--radix-slider-thumb-transform' as any]: 'translateX(-50%)' }}>
          <span data-orientation="horizontal" className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
            <span data-orientation="horizontal" className="absolute h-full bg-primary" style={{ left: `${(currentTime/duration)*100 || 0}%`, right: `${100-(currentTime/duration)*100 || 100}%` }}></span>
          </span>
          <span style={{ transform: 'translateX(-50%)', position: 'absolute', left: `calc(${(currentTime/duration)*100 || 0}% + 8px)` }}>
            <span role="slider" aria-valuemin={0} aria-valuemax={duration} aria-orientation="horizontal" data-orientation="horizontal" className="block size-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" style={{}} data-radix-collection-item="" aria-valuenow={currentTime} tabIndex={0}
              onMouseDown={e => {
                const slider = e.currentTarget.parentElement?.parentElement?.parentElement as HTMLElement;
                const onMove = (moveEvent: MouseEvent) => {
                  if (!slider) return;
                  const rect = slider.getBoundingClientRect();
                  const percent = Math.min(Math.max((moveEvent.clientX - rect.left) / rect.width, 0), 1);
                  const newTime = percent * duration;
                  if (audioRef.current) audioRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                };
                const onUp = () => {
                  window.removeEventListener('mousemove', onMove);
                  window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
              }}
            ></span>
          </span>
        </span>
        <span className="min-w-[40px] text-sm text-muted-foreground">{formatTime(duration)}</span>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
          <IconVolume className="size-5" />
        </button>
        <span dir="ltr" data-orientation="horizontal" aria-disabled="false" className="relative flex touch-none select-none items-center w-24" style={{ ['--radix-slider-thumb-transform' as any]: 'translateX(-50%)' }}>
          <span data-orientation="horizontal" className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
            <span data-orientation="horizontal" className="absolute h-full bg-primary" style={{ left: 0, right: `${100 - volume * 100}%` }}></span>
          </span>
          <span style={{ transform: 'translateX(-50%)', position: 'absolute', left: `calc(${volume * 100}% - 8px)` }}>
            <span role="slider" aria-valuemin={0} aria-valuemax={1} aria-orientation="horizontal" data-orientation="horizontal" className="block size-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" style={{}} data-radix-collection-item="" aria-valuenow={volume} tabIndex={0}
              onMouseDown={e => {
                const slider = e.currentTarget.parentElement?.parentElement?.parentElement as HTMLElement;
                const onMove = (moveEvent: MouseEvent) => {
                  if (!slider) return;
                  const rect = slider.getBoundingClientRect();
                  const percent = Math.min(Math.max((moveEvent.clientX - rect.left) / rect.width, 0), 1);
                  setVolume(percent);
                  if (audioRef.current) audioRef.current.volume = percent;
                };
                const onUp = () => {
                  window.removeEventListener('mousemove', onMove);
                  window.removeEventListener('mouseup', onUp);
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
              }}
            ></span>
          </span>
        </span>
      </div>
    </div>
  );
};

export default CustomAudioPlayer;
