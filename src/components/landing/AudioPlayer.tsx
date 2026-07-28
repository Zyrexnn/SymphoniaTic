import React, { useState } from 'react';
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
  const activeTrack = CONCERT_EVENTS[currentTrackIndex];

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) { audio.pause(); onSetIsPlaying(false); }
    else { audio.play().then(() => onSetIsPlaying(true)).catch(() => onSetIsPlaying(false)); }
  };

  const playNext = () => { onSetCurrentTrackIndex((currentTrackIndex + 1) % CONCERT_EVENTS.length); onSetIsPlaying(true); };
  const playPrev = () => { onSetCurrentTrackIndex((currentTrackIndex - 1 + CONCERT_EVENTS.length) % CONCERT_EVENTS.length); onSetIsPlaying(true); };
  const playTrack = (i: number) => { if (currentTrackIndex === i) togglePlay(); else { onSetCurrentTrackIndex(i); onSetIsPlaying(true); } };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    onSetVolume(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const toggleMute = () => { if (audioRef.current) { audioRef.current.muted = !isMuted; onSetIsMuted(!isMuted); } };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30"
      style={{ background: '#171717', borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Main bar */}
      <div
        className="flex items-center justify-between mx-auto"
        style={{ maxWidth: 1400, padding: '10px 40px' }}
      >
        {/* Left: controls + track info */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <button onClick={playPrev} className="cursor-pointer bg-transparent border-none p-1" style={{ color: '#9a9a9a' }}>
              <SkipBack size={14} strokeWidth={1} />
            </button>
            <button onClick={togglePlay} className="cursor-pointer bg-transparent border-none p-1" style={{ color: '#ffffff' }}>
              {isPlaying ? <Pause size={14} strokeWidth={1} /> : <Play size={14} strokeWidth={1} />}
            </button>
            <button onClick={playNext} className="cursor-pointer bg-transparent border-none p-1" style={{ color: '#9a9a9a' }}>
              <SkipForward size={14} strokeWidth={1} />
            </button>
          </div>
          <div className="min-w-0">
            <p className="truncate" style={{ fontSize: 13, fontWeight: 300, letterSpacing: '-0.05px', color: '#ffffff' }}>
              {activeTrack.title}
            </p>
            <p className="truncate" style={{ fontSize: 12, fontWeight: 300, letterSpacing: '-0.03px', color: '#9a9a9a' }}>
              {activeTrack.artist}
            </p>
          </div>
        </div>

        {/* Center: seek bar */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-md mx-8">
          <span style={{ fontSize: 11, fontWeight: 300, color: '#9a9a9a', fontVariantNumeric: 'tabular-nums', minWidth: 32 }}>
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="flex-1 cursor-pointer"
            style={{ height: 2, appearance: 'none', background: 'rgba(255,255,255,0.1)', outline: 'none' }}
          />
          <span style={{ fontSize: 11, fontWeight: 300, color: '#9a9a9a', fontVariantNumeric: 'tabular-nums', minWidth: 32 }}>
            {formatTime(duration)}
          </span>
        </div>

        {/* Right: volume + expand */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={toggleMute} className="cursor-pointer bg-transparent border-none p-1" style={{ color: '#9a9a9a' }}>
              {isMuted ? <VolumeX size={14} strokeWidth={1} /> : <Volume2 size={14} strokeWidth={1} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 cursor-pointer"
              style={{ height: 2, appearance: 'none', background: 'rgba(255,255,255,0.1)', outline: 'none' }}
            />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="cursor-pointer bg-transparent border-none p-1"
            style={{ color: '#9a9a9a' }}
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
            className="overflow-hidden mx-auto"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)', maxWidth: 1400 }}
          >
            <div style={{ padding: '12px 40px 16px', maxHeight: 200, overflowY: 'auto' }}>
              {CONCERT_EVENTS.map((evt, idx) => (
                <button
                  key={evt.id}
                  onClick={() => playTrack(idx)}
                  className="w-full text-left flex items-center gap-4 cursor-pointer transition-opacity hover:opacity-60 bg-transparent border-none"
                  style={{
                    padding: '8px 0',
                    fontSize: 16,
                    fontWeight: 300,
                    letterSpacing: '-0.05px',
                    color: currentTrackIndex === idx ? '#ffffff' : '#9a9a9a',
                  }}
                >
                  <span style={{ width: 20, fontSize: 12, fontWeight: 300, fontVariantNumeric: 'tabular-nums' }}>
                    {currentTrackIndex === idx && isPlaying ? '→' : `${idx + 1}`}
                  </span>
                  <span className="truncate flex-1">{evt.title}</span>
                  <span className="truncate" style={{ color: '#9a9a9a' }}>{evt.artist}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
