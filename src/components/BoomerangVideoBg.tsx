import React, { useEffect, useRef, useState } from 'react';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260611_183632_c311af08-e4b7-458f-81e7-79847a49b3d3.mp4';

export const BoomerangVideoBg: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isCapturing = true;
    let rvfcId: number | null = null;
    let rafId: number | null = null;

    const captureCurrentFrame = () => {
      if (!isCapturing || !video) return;
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const maxWidth = 960;
        const scale = video.videoWidth > maxWidth ? maxWidth / video.videoWidth : 1;
        const w = Math.round(video.videoWidth * scale);
        const h = Math.round(video.videoHeight * scale);

        const offscreen = document.createElement('canvas');
        offscreen.width = w;
        offscreen.height = h;
        const ctx = offscreen.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          framesRef.current.push(offscreen);
        }
      }
    };

    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      const onFrame = () => {
        captureCurrentFrame();
        if (isCapturing && video && !video.ended) {
          rvfcId = (video as any).requestVideoFrameCallback(onFrame);
        }
      };
      rvfcId = (video as any).requestVideoFrameCallback(onFrame);
    } else {
      const loop = () => {
        captureCurrentFrame();
        if (isCapturing && video && !video.ended) {
          rafId = requestAnimationFrame(loop);
        }
      };
      rafId = requestAnimationFrame(loop);
    }

    const handleEnded = () => {
      isCapturing = false;
      if (rvfcId !== null && 'cancelVideoFrameCallback' in HTMLVideoElement.prototype) {
        (video as any).cancelVideoFrameCallback(rvfcId);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (framesRef.current.length > 0) {
        setVideoEnded(true);
      }
    };

    video.addEventListener('ended', handleEnded);

    return () => {
      isCapturing = false;
      video.removeEventListener('ended', handleEnded);
      if (rvfcId !== null && 'cancelVideoFrameCallback' in HTMLVideoElement.prototype) {
        (video as any).cancelVideoFrameCallback(rvfcId);
      }
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Ping-pong loop at 30fps
  useEffect(() => {
    if (!videoEnded || framesRef.current.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const frames = framesRef.current;
    const totalFrames = frames.length;
    let frameIdx = 0;
    let direction = 1;
    let lastTime = performance.now();
    const fpsInterval = 1000 / 30;
    let animId: number;

    const drawCoverFrame = (frameCanvas: HTMLCanvasElement) => {
      const containerWidth = canvas.clientWidth || window.innerWidth;
      const containerHeight = canvas.clientHeight || window.innerHeight;

      if (canvas.width !== containerWidth || canvas.height !== containerHeight) {
        canvas.width = containerWidth;
        canvas.height = containerHeight;
      }

      const imgWidth = frameCanvas.width;
      const imgHeight = frameCanvas.height;

      const canvasAspect = containerWidth / containerHeight;
      const imgAspect = imgWidth / imgHeight;

      let drawW = containerWidth;
      let drawH = containerHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasAspect > imgAspect) {
        drawH = containerWidth / imgAspect;
        offsetY = (containerHeight - drawH) / 2;
      } else {
        drawW = containerHeight * imgAspect;
        offsetX = (containerWidth - drawW) / 2;
      }

      ctx.clearRect(0, 0, containerWidth, containerHeight);
      ctx.drawImage(frameCanvas, offsetX, offsetY, drawW, drawH);
    };

    const renderLoop = (now: number) => {
      animId = requestAnimationFrame(renderLoop);
      const elapsed = now - lastTime;

      if (elapsed >= fpsInterval) {
        lastTime = now - (elapsed % fpsInterval);

        const frame = frames[frameIdx];
        if (frame) {
          drawCoverFrame(frame);
        }

        frameIdx += direction;
        if (frameIdx >= totalFrames - 1) {
          frameIdx = totalFrames - 1;
          direction = -1;
        } else if (frameIdx <= 0) {
          frameIdx = 0;
          direction = 1;
        }
      }
    };

    animId = requestAnimationFrame(renderLoop);

    const handleResize = () => {
      if (frames[frameIdx]) {
        drawCoverFrame(frames[frameIdx]);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [videoEnded]);

  return (
    <div className="absolute inset-0 z-0 scale-[1.08] origin-center overflow-hidden">
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        autoPlay
        playsInline
        crossOrigin="anonymous"
        className={`w-full h-full object-cover ${videoEnded ? 'hidden' : 'block'}`}
      />
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover ${videoEnded ? 'block' : 'hidden'}`}
      />
    </div>
  );
};
