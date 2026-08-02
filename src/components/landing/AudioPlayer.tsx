import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, SkipForward, SkipBack, ChevronDown, ChevronUp, Volume2, VolumeX } from 'lucide-react';
import { CONCERT_EVENTS, formatTime } from './data';

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
  audioRef, currentTrackIndex, isPlaying, currentTime, duration,
  volume, isMuted, onSetCurrentTrackIndex, onSetIsPlaying,
  onSetVolume, onSetIsMuted, onSeek,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
    onSetCurrentTrackIndex((currentTrackIndex + 1) % CONCERT_EVENTS.length);
    onSetIsPlaying(true);
  }, [currentTrackIndex, onSetCurrentTrackIndex, onSetIsPlaying]);

  const playPrev = useCallback(() => {
    onSetCurrentTrackIndex((currentTrackIndex - 1 + CONCERT_EVENTS.length) % CONCERT_EVENTS.length);
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
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-[#171717] border-t border-white/[0.06]">
      {/* Main bar */}
      <div className="flex items-center justify-between mx-auto max-w-[1400px] px-10 py-2.5">
        {/* Left: controls + track info */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <button onClick={playPrev} className="cursor-pointer bg-transparent border-none p-1 text-[#9a9a9a] hover:text-white transition-colors" title="Lagu sebelumnya">
              <SkipBack size={14} strokeWidth={1} />
            </button>
            <button onClick={togglePlay} className="cursor-pointer bg-transparent border-none p-1 text-white hover:opacity-80 transition-opacity" title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? <Pause size={14} strokeWidth={1} /> : <Play size={14} strokeWidth={1} />}
            </button>
            <button onClick={playNext} className="cursor-pointer bg-transparent border-none p-1 text-[#9a9a9a] hover:text-white transition-colors" title="Lagu berikutnya">
              <SkipForward size={14} strokeWidth={1} />
            </button>
          </div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-light tracking-[-0.05px] text-white">
              {activeTrack.title}
            </p>
            <p className="truncate text-xs font-light tracking-[-0.03px] text-[#9a9a9a]">
              {activeTrack.artist}
            </p>
          </div>
        </div>

        {/* Center: seek bar */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-8">
          <span className="text-[11px] font-light text-[#9a9a9a] tabular-nums min-w-[32px]">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="flex-1 cursor-pointer h-0.5 appearance-none bg-white/10 outline-none"
          />
          <span className="text-[11px] font-light text-[#9a9a9a] tabular-nums min-w-[32px]">
            {formatTime(duration)}
          </span>
        </div>

        {/* Right: volume + expand */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={toggleMute} className="cursor-pointer bg-transparent border-none p-1 text-[#9a9a9a] hover:text-white transition-colors">
              {isMuted ? <VolumeX size={14} strokeWidth={1} /> : <Volume2 size={14} strokeWidth={1} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 cursor-pointer h-0.5 appearance-none bg-white/10 outline-none"
            />
          </div>
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="cursor-pointer bg-transparent border-none p-1 text-[#9a9a9a] hover:text-white transition-colors"
            title={isExpanded ? 'Tutup daftar putar' : 'Buka daftar putar'}
          >
            {isExpanded ? <ChevronDown size={14} strokeWidth={1} /> : <ChevronUp size={14} strokeWidth={1} />}
          </button>
        </div>
      </div>

      {/* Playlist */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden mx-auto max-w-[1400px] border-t border-white/[0.06]"
          >
            <div className="px-10 py-3 pb-4 max-h-[200px] overflow-y-auto">
              {CONCERT_EVENTS.map((evt, idx) => (
                <button
                  key={evt.id}
                  onClick={() => playTrack(idx)}
                  className={`w-full text-left flex items-center gap-4 cursor-pointer transition-opacity hover:opacity-60 bg-transparent border-none py-2 text-base font-light tracking-[-0.05px] ${
                    currentTrackIndex === idx ? 'text-white' : 'text-[#9a9a9a]'
                  }`}
                >
                  <span className="w-5 text-xs font-light tabular-nums">
                    {currentTrackIndex === idx && isPlaying ? '→' : `${idx + 1}`}
                  </span>
                  <span className="truncate flex-1">{evt.title}</span>
                  <span className="truncate text-[#9a9a9a]">{evt.artist}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
