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
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-none border border-white/25 bg-[#141413] p-3 sm:p-4 text-[#F4F3EF]">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3 sm:gap-6">
            <div className="flex items-center gap-3 min-w-0 flex-1 md:flex-initial">
              <div className="relative h-11 w-11 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-none border border-white/20 bg-[#1C1C1A]">
                {activeTrack.image ? (
                  <img
                    src={activeTrack.image}
                    alt={activeTrack.title}
                    width={56}
                    height={56}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#B8B6AE]">
                    <Music className="h-5 w-5" aria-hidden="true" />
                  </div>
                )}
                {isPlaying && (
                  <div className="absolute inset-0 bg-[#141413]/55 flex items-center justify-center gap-0.5" aria-hidden="true">
                    <span className="w-1 h-3 bg-[#D4FF2A]" />
                    <span className="w-1 h-4 bg-[#D4FF2A]" />
                    <span className="w-1 h-2 bg-[#D4FF2A]" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="hidden sm:inline-flex rounded-none border-white/25 bg-[#1C1C1A] px-2 py-0 text-[10px] uppercase tracking-wider text-[#D8D6CE]">
                    {activeTrack.category || 'Orchestra'}
                  </Badge>
                  <span className="text-[10px] text-[#B8B6AE] uppercase tracking-widest sm:hidden">Sedang Diputar</span>
                </div>
                <h4 className="truncate text-xs sm:text-sm font-semibold tracking-tight text-[#F4F3EF] mt-0.5 m-0">
                  {activeTrack.title}
                </h4>
                <p className="truncate text-[11px] sm:text-xs text-[#B8B6AE] m-0">
                  {activeTrack.artist}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsLiked(!isLiked)}
                aria-label={isLiked ? 'Hapus dari favorit' : 'Tandai favorit'}
                aria-pressed={isLiked}
                className={`hidden md:inline-flex h-11 w-11 rounded-none border transition-colors focus-visible:ring-2 focus-visible:ring-[#D4FF2A] ${
                  isLiked
                    ? 'text-[#141413] border-[#D4FF2A] bg-[#D4FF2A] hover:bg-[#C2EE1A]'
                    : 'text-[#D8D6CE] border-white/20 bg-[#1C1C1A] hover:border-[#D4FF2A] hover:text-[#D4FF2A]'
                }`}
                title="Favorit"
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} aria-hidden="true" />
              </Button>
            </div>

            <div className="hidden md:flex flex-col items-center gap-1.5 flex-1 max-w-md mx-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsShuffle(!isShuffle)}
                  aria-label="Acak daftar putar"
                  aria-pressed={isShuffle}
                  className={`h-11 w-11 rounded-none border transition-colors focus-visible:ring-2 focus-visible:ring-[#D4FF2A] ${
                    isShuffle
                      ? 'text-[#141413] bg-[#D4FF2A] border-[#D4FF2A] hover:bg-[#C2EE1A]'
                      : 'text-[#B8B6AE] border-transparent hover:text-[#F4F3EF] hover:border-white/20'
                  }`}
                  title="Acak Lagu"
                >
                  <Shuffle className="h-4 w-4" aria-hidden="true" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={playPrev}
                  aria-label="Lagu sebelumnya"
                  className="h-11 w-11 rounded-none text-[#D8D6CE] hover:text-[#D4FF2A] hover:bg-[#1C1C1A] transition-colors focus-visible:ring-2 focus-visible:ring-[#D4FF2A]"
                  title="Lagu Sebelumnya"
                >
                  <SkipBack className="h-4 w-4" aria-hidden="true" />
                </Button>

                <Button
                  type="button"
                  onClick={togglePlay}
                  aria-label={isPlaying ? 'Jeda audio' : 'Putar audio'}
                  className="h-11 w-11 rounded-none bg-[#D4FF2A] text-[#141413] hover:bg-[#C2EE1A] transition-colors focus-visible:ring-2 focus-visible:ring-[#D4FF2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141413]"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
                  ) : (
                    <Play className="h-4 w-4 fill-current ml-0.5" aria-hidden="true" />
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={playNext}
                  aria-label="Lagu berikutnya"
                  className="h-11 w-11 rounded-none text-[#D8D6CE] hover:text-[#D4FF2A] hover:bg-[#1C1C1A] transition-colors focus-visible:ring-2 focus-visible:ring-[#D4FF2A]"
                  title="Lagu Berikutnya"
                >
                  <SkipForward className="h-4 w-4" aria-hidden="true" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsRepeat(!isRepeat)}
                  aria-label="Ulangi lagu"
                  aria-pressed={isRepeat}
                  className={`h-11 w-11 rounded-none border transition-colors focus-visible:ring-2 focus-visible:ring-[#D4FF2A] ${
                    isRepeat
                      ? 'text-[#141413] bg-[#D4FF2A] border-[#D4FF2A] hover:bg-[#C2EE1A]'
                      : 'text-[#B8B6AE] border-transparent hover:text-[#F4F3EF] hover:border-white/20'
                  }`}
                  title="Ulangi Lagu"
                >
                  <Repeat className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>

              <div className="w-full flex items-center gap-2 text-[11px] font-mono text-[#B8B6AE] tabular-nums">
                <span className="w-10 text-right">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min={0}
                  max={duration || 1}
                  step={0.5}
                  value={Math.min(currentTime, duration || 1)}
                  onChange={(e) => onSeek(parseFloat(e.target.value))}
                  aria-label="Posisi pemutaran audio"
                  className="flex-1 cursor-pointer !bg-white/30 accent-[#D4FF2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141413]"
                />
                <span className="w-10">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex md:hidden items-center gap-2">
              <Button
                type="button"
                onClick={togglePlay}
                size="icon"
                aria-label={isPlaying ? 'Jeda audio' : 'Putar audio'}
                className="h-11 w-11 rounded-none bg-[#D4FF2A] text-[#141413] hover:bg-[#C2EE1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141413]"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
                ) : (
                  <Play className="h-4 w-4 fill-current ml-0.5" aria-hidden="true" />
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={playNext}
                aria-label="Lagu berikutnya"
                className="h-11 w-11 rounded-none border border-white/20 text-[#F4F3EF] hover:border-[#D4FF2A] hover:text-[#D4FF2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141413]"
              >
                <SkipForward className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 border-r border-white/15 pr-4 mr-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  aria-label={isMuted ? 'Aktifkan suara' : 'Bisukan suara'}
                  className="h-11 w-11 rounded-none text-[#D8D6CE] hover:text-[#D4FF2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141413]"
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-[#C81E1E]" aria-hidden="true" />
                  ) : (
                    <Volume2 className="h-4 w-4" aria-hidden="true" />
                  )}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  aria-label="Kontrol volume"
                  className="w-16 cursor-pointer !bg-white/30 accent-[#D4FF2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141413]"
                />
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded((prev) => !prev)}
                aria-expanded={isExpanded}
                className={`min-h-[44px] rounded-none border px-3 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141413] ${
                  isExpanded
                    ? 'border-[#D4FF2A] bg-[#D4FF2A] text-[#141413]'
                    : 'border-white/25 bg-[#1C1C1A] text-[#F4F3EF] hover:border-[#D4FF2A] hover:text-[#D4FF2A]'
                }`}
              >
                <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Daftar Putar</span>
                {isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>

          <div className="md:hidden min-h-[44px] flex items-center gap-2 text-[10px] font-mono text-[#B8B6AE] tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.5}
              value={Math.min(currentTime, duration || 1)}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              aria-label="Posisi pemutaran audio"
              className="flex-1 py-4 !h-11 !bg-transparent cursor-pointer accent-[#D4FF2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A]"
              style={{
                background: 'linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0.3)) center / 100% 3px no-repeat',
              }}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden border-t border-white/15 mt-3 pt-3"
            >
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-xs uppercase tracking-[0.16em] font-semibold text-[#D8D6CE]">
                  Daftar Audio Simfoni ({CONCERT_EVENTS.length})
                </span>
                <span className="text-xs text-[#B8B6AE]">
                  Pilih audio untuk mendengarkan pratinjau
                </span>
              </div>

              <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1">
                {CONCERT_EVENTS.map((evt, idx) => {
                  const isActive = currentTrackIndex === idx;

                  return (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => playTrack(idx)}
                      className={`group flex w-full min-h-[52px] items-center gap-3 rounded-none border p-2.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A] ${
                        isActive
                          ? 'border-[#D4FF2A] bg-[#1C1C1A] text-[#F4F3EF]'
                          : 'border-white/15 bg-[#141413] text-[#D8D6CE] hover:bg-[#1C1C1A] hover:border-white/30'
                      }`}
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-none border text-xs font-mono font-bold transition-colors ${
                          isActive
                            ? 'border-[#D4FF2A] bg-[#D4FF2A] text-[#141413]'
                            : 'border-white/20 bg-[#1C1C1A] text-[#D8D6CE] group-hover:border-[#D4FF2A]'
                        }`}
                      >
                        {isActive && isPlaying ? (
                          <Pause className="h-4 w-4 fill-current" aria-hidden="true" />
                        ) : (
                          `${idx + 1}`
                        )}
                      </div>

                      <div className="flex flex-1 items-center justify-between gap-3 min-w-0">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold truncate text-[#F4F3EF] m-0">
                            {evt.title}
                          </p>
                          <p className="text-[11px] truncate text-[#B8B6AE] m-0">
                            {evt.artist} · {evt.venue}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="shrink-0 rounded-none border-white/20 bg-[#1C1C1A] text-[10px] text-[#D8D6CE]"
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
