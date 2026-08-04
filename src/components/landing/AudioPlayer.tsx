import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Pause, 
  Play, 
  SkipForward, 
  SkipBack, 
  ChevronDown, 
  ChevronUp, 
  Volume2, 
  VolumeX,
  Shuffle,
  Repeat,
  Heart,
  Music,
  Headphones
} from 'lucide-react';
import { CONCERT_EVENTS, formatTime } from './data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AudioPlayerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTrackIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  onSetCurrentTrackIndex: (index: number) => void;
  onSetIsPlaying: (playing: boolean) => void;
  onSetVolume: (volume: number) => void;
  onSetIsMuted: (muted: boolean) => void;
  onSeek: (time: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioRef,
  currentTrackIndex,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  onSetCurrentTrackIndex,
  onSetIsPlaying,
  onSetVolume,
  onSetIsMuted,
  onSeek,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const activeTrack = CONCERT_EVENTS[currentTrackIndex] || CONCERT_EVENTS[0];
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      onSetIsPlaying(false);
    } else {
      audio.play().then(() => onSetIsPlaying(true)).catch(() => onSetIsPlaying(false));
    }
  }, [audioRef, isPlaying, onSetIsPlaying]);

  const playNext = useCallback(() => {
    let nextIndex: number;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * CONCERT_EVENTS.length);
    } else {
      nextIndex = (currentTrackIndex + 1) % CONCERT_EVENTS.length;
    }
    onSetCurrentTrackIndex(nextIndex);
    onSetIsPlaying(true);
  }, [currentTrackIndex, isShuffle, onSetCurrentTrackIndex, onSetIsPlaying]);

  const playPrev = useCallback(() => {
    const prevIndex = (currentTrackIndex - 1 + CONCERT_EVENTS.length) % CONCERT_EVENTS.length;
    onSetCurrentTrackIndex(prevIndex);
    onSetIsPlaying(true);
  }, [currentTrackIndex, onSetCurrentTrackIndex, onSetIsPlaying]);

  const playTrack = useCallback((i: number) => {
    if (currentTrackIndex === i) {
      togglePlay();
    } else {
      onSetCurrentTrackIndex(i);
      onSetIsPlaying(true);
    }
  }, [currentTrackIndex, togglePlay, onSetCurrentTrackIndex, onSetIsPlaying]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    onSetVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  }, [audioRef, onSetVolume]);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      onSetIsMuted(!isMuted);
    }
  }, [audioRef, isMuted, onSetIsMuted]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-2 sm:px-4 sm:pb-3">
      {/* Main Glassmorphism Player Card */}
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#171717]/80 p-3 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-all duration-300">
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-white/[0.04] via-transparent to-white/[0.02] pointer-events-none" />

        <div className="flex flex-col gap-3">
          {/* Main Controls Row */}
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            
            {/* Left: Track Info & Thumbnail */}
            <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-initial">
              <div className="relative h-11 w-11 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/20 via-white/5 to-transparent shadow-inner">
                {activeTrack.image ? (
                  <img 
                    src={activeTrack.image} 
                    alt={activeTrack.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/60">
                    <Music className="h-5 w-5" />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-0.5">
                    <span className="w-1 h-3 bg-white animate-pulse rounded-full" />
                    <span className="w-1 h-4 bg-white animate-pulse delay-75 rounded-full" />
                    <span className="w-1 h-2 bg-white animate-pulse delay-150 rounded-full" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="hidden sm:inline-flex border-white/20 bg-white/5 px-2 py-0 text-[10px] uppercase tracking-wider text-white/70">
                    {activeTrack.category || 'Orchestra'}
                  </Badge>
                  <span className="text-[10px] text-white/40 uppercase tracking-widest sm:hidden">Now Playing</span>
                </div>
                <h4 className="truncate text-xs sm:text-sm font-semibold tracking-tight text-white mt-0.5">
                  {activeTrack.title}
                </h4>
                <p className="truncate text-[11px] sm:text-xs text-white/60">
                  {activeTrack.artist}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLiked(!isLiked)}
                className={`hidden md:inline-flex h-8 w-8 rounded-full border border-white/10 bg-white/5 transition-colors ${
                  isLiked ? 'text-rose-400 border-rose-500/30 bg-rose-500/10' : 'text-white/60 hover:text-white'
                }`}
                title="Favorit"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Center: Playback Controls & Progress (Desktop & Tablet) */}
            <div className="hidden md:flex flex-col items-center gap-1.5 flex-1 max-w-md mx-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={`h-8 w-8 rounded-full transition-colors ${
                    isShuffle ? 'text-white bg-white/20' : 'text-white/50 hover:text-white'
                  }`}
                  title="Acak Lagu"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={playPrev}
                  className="h-8 w-8 rounded-full text-white/70 hover:text-white transition-colors"
                  title="Lagu Sebelumnya"
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  onClick={togglePlay}
                  className="h-10 w-10 rounded-full bg-white text-black hover:bg-white/90 shadow-md transition-transform hover:scale-105 active:scale-95"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={playNext}
                  className="h-8 w-8 rounded-full text-white/70 hover:text-white transition-colors"
                  title="Lagu Berikutnya"
                >
                  <SkipForward className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsRepeat(!isRepeat)}
                  className={`h-8 w-8 rounded-full transition-colors ${
                    isRepeat ? 'text-white bg-white/20' : 'text-white/50 hover:text-white'
                  }`}
                  title="Ulangi Lagu"
                >
                  <Repeat className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="w-full flex items-center gap-2 text-[11px] font-mono text-white/50">
                <span className="w-8 text-right">{formatTime(currentTime)}</span>
                <div 
                  className="relative flex-1 h-1.5 rounded-full bg-white/10 cursor-pointer overflow-hidden group"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const newPercent = clickX / rect.width;
                    onSeek(newPercent * (duration || 1));
                  }}
                >
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-white to-white/70 transition-[width] duration-150 group-hover:bg-white"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="w-8">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Mobile Play Controls */}
            <div className="flex md:hidden items-center gap-2">
              <Button
                onClick={togglePlay}
                size="icon"
                className="h-9 w-9 rounded-full bg-white text-black hover:bg-white/90 shadow-md"
              >
                {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={playNext}
                className="h-9 w-9 rounded-full border border-white/10 text-white/80"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Right: Volume & Playlist Drawer Toggle */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 border-r border-white/10 pr-4 mr-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleMute}
                  className="h-8 w-8 rounded-full text-white/60 hover:text-white"
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 cursor-pointer h-1 appearance-none rounded-full bg-white/20 accent-white"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded((prev) => !prev)}
                className={`h-9 rounded-full border-white/20 bg-white/5 px-3 text-xs text-white/80 backdrop-blur hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5 ${
                  isExpanded ? 'border-white/40 bg-white/15' : ''
                }`}
              >
                <Headphones className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Daftar Putar</span>
                {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Progress Bar */}
          <div className="md:hidden flex items-center gap-2 text-[10px] font-mono text-white/50 pt-1">
            <span>{formatTime(currentTime)}</span>
            <div 
              className="relative flex-1 h-1.5 rounded-full bg-white/10 cursor-pointer overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const newPercent = clickX / rect.width;
                onSeek(newPercent * (duration || 1));
              }}
            >
              <div 
                className="h-full rounded-full bg-white transition-[width] duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Expanded Glassmorphism Playlist Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-white/10 mt-3 pt-3"
            >
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-xs uppercase tracking-[0.2em] font-semibold text-white/60">
                  Daftar Audio Simfoni ({CONCERT_EVENTS.length})
                </span>
                <span className="text-xs text-white/40">
                  Pilih audio untuk mendengarkan pratinjau
                </span>
              </div>

              <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                {CONCERT_EVENTS.map((evt, idx) => {
                  const isActive = currentTrackIndex === idx;

                  return (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => playTrack(idx)}
                      className={`group flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left backdrop-blur-xl transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "border-white/30 bg-white/15 text-white shadow-lg"
                          : "border-white/5 bg-white/[0.03] text-white/70 hover:bg-white/[0.08] hover:border-white/20"
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-xs font-semibold transition-colors ${
                          isActive
                            ? "border-white/40 bg-white text-black"
                            : "border-white/10 bg-white/5 text-white/70 group-hover:border-white/20"
                        }`}
                      >
                        {isActive && isPlaying ? (
                          <Pause className="h-4 w-4 fill-current" />
                        ) : (
                          `${idx + 1}`
                        )}
                      </div>

                      <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold truncate text-white">
                            {evt.title}
                          </p>
                          <p className="text-[11px] truncate text-white/60">
                            {evt.artist} · {evt.venue}
                          </p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className="shrink-0 border-white/20 bg-white/5 text-[10px] text-white/70"
                        >
                          {evt.category || 'Simfoni'}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
