import React, { useEffect, useRef, useState } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260611_183632_c311af08-e4b7-458f-81e7-79847a49b3d3.mp4';

const FALLBACK_IMAGE = '/hero_bg_mono.jpg';

export const BoomerangVideoBg: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onError = () => setVideoFailed(true);
    const onPlay = () => setIsPlaying(true);

    video.addEventListener('error', onError);
    video.addEventListener('playing', onPlay);

    // Try to play
    video.play().catch(() => setVideoFailed(true));

    return () => {
      video.removeEventListener('error', onError);
      video.removeEventListener('playing', onPlay);
    };
  }, []);

  if (videoFailed) {
    return (
      <div className="absolute inset-0 z-0">
        <img
          src={FALLBACK_IMAGE}
          alt=""
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.4)' }}
        />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
        style={{
          opacity: isPlaying ? 1 : 0,
          transition: 'opacity 0.8s ease',
          filter: 'brightness(0.45)',
        }}
      />
      {!isPlaying && (
        <img
          src={FALLBACK_IMAGE}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.4)' }}
        />
      )}
    </div>
  );
};
