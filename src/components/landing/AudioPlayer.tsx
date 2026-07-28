import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Music, Pause, Play, SkipForward, SkipBack, ListMusic,
  Volume2, VolumeX, BarChart3, Heart, Maximize2, Minimize2,
} from 'lucide-react';
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
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

  // ── Minimized pill ──
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-30 animate-fade-up">
        <button onClick={() => setIsMinimized(false)}
          className="bg-[#121212]/95 backdrop-blur-xl border border-white/20 p-2 sm:p-2.5 rounded-full shadow-2xl flex items-center gap-2.5 hover:scale-105 active:scale-95 transition-all text-white cursor-pointer group" title="Buka Pemutar Spotify">
          <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-emerald-500/40">
            <img src={activeTrack.image} alt={activeTrack.title} className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`} />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Music className="w-3.5 h-3.5 text-emerald-400 drop-shadow" /></div>
          </div>
          <div className="text-left pr-1 max-w-[130px] sm:max-w-[180px]">
            <p className="text-xs font-bold text-white truncate leading-tight">{activeTrack.title}</p>
            <p className="text-[10px] text-emerald-400 font-medium truncate mt-0.5">{isPlaying ? '● Memutar Musik' : 'Dipause'}</p>
          </div>
          <div onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center font-bold transition-transform shrink-0">
            {isPlaying ? <Pause className="w-4 h-4 fill-black text-black" /> : <Play className="w-4 h-4 fill-black text-black ml-0.5" />}
          </div>
          <div className="p-1 text-gray-400 hover:text-white"><Maximize2 className="w-4 h-4" /></div>
        </button>
      </div>
    );
  }

  // ── Expanded player ──
  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 md:right-10 z-30 w-auto sm:w-[380px] animate-fade-up">
      <div className="rounded-2xl bg-[#121212]/95 backdrop-blur-2xl p-4 shadow-2xl border border-white/20 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><Music className="w-3 h-3 text-black" /></div>
            <span className="text-[11px] font-bold text-white tracking-wider uppercase">Spotify Player</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowPlaylist(!showPlaylist)} className="p-1.5 text-gray-400 hover:text-emerald-400 transition-colors" title="Daftar Putar"><ListMusic className="w-4 h-4" /></button>
            <button onClick={() => setIsMinimized(true)} className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg bg-white/5 hover:bg-white/10" title="Minimize"><Minimize2 className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Track info */}
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden shadow-lg border border-white/10">
            <img src={activeTrack.image} alt={activeTrack.title} className="w-full h-full object-cover" />
            {isPlaying && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><BarChart3 className="w-5 h-5 text-emerald-400 animate-pulse" /></div>}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-white truncate leading-snug">{activeTrack.title}</h4>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{activeTrack.artist}</p>
          </div>
          <button onClick={() => setIsLiked(!isLiked)} className="p-2 text-gray-400 hover:text-emerald-400 transition-colors shrink-0">
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-emerald-400 text-emerald-400' : ''}`} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 py-0.5">
          <button onClick={playPrev} className="text-gray-400 hover:text-white transition-colors p-1.5" title="Sebelumnya"><SkipBack className="w-5 h-5" /></button>
          <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer" title={isPlaying ? 'Jeda' : 'Putar Musik'}>
            {isPlaying ? <Pause className="w-5 h-5 fill-black text-black" /> : <Play className="w-5 h-5 fill-black text-black ml-0.5" />}
          </button>
          <button onClick={playNext} className="text-gray-400 hover:text-white transition-colors p-1.5" title="Selanjutnya"><SkipForward className="w-5 h-5" /></button>
        </div>

        {/* Seekbar */}
        <div className="space-y-1">
          <input type="range" min="0" max={duration || 100} value={currentTime} onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
          <div className="flex items-center justify-between text-[9px] font-mono text-gray-400">
            <span>{formatTime(currentTime)}</span>
            <span className="text-emerald-400 font-semibold">{isPlaying ? '● MEMUTAR' : 'PAUSED'}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white shrink-0">
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <input type="range" min="0" max="1" step="0.05" value={isMuted ? 0 : volume} onChange={handleVolumeChange}
            className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
        </div>

        {/* Playlist */}
        <AnimatePresence>
          {showPlaylist && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="pt-2 border-t border-white/10 space-y-1.5 max-h-40 overflow-y-auto">
              <span className="text-[10px] text-gray-400 font-bold block px-1 uppercase tracking-wider">Daftar Putar (3 Lagu Asli):</span>
              {CONCERT_EVENTS.map((evt, idx) => (
                <button key={evt.id} onClick={() => playTrack(idx)}
                  className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all cursor-pointer ${
                    currentTrackIndex === idx ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}>
                  <div className="truncate pr-2">
                    <div className="truncate text-xs font-medium">{evt.title}</div>
                    <div className="text-[9px] text-gray-400 truncate">{evt.artist}</div>
                  </div>
                  {currentTrackIndex === idx && isPlaying ? <BarChart3 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Play className="w-3 h-3 text-gray-400 shrink-0" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
