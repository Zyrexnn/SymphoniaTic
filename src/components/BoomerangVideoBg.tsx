import React, { useState } from 'react';

const CLASSICAL_HERO_IMAGE =
  'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1600&q=85';
const FALLBACK_IMAGE = '/poster_1.jpg';

export const BoomerangVideoBg: React.FC = () => {
  const [src, setSrc] = useState(CLASSICAL_HERO_IMAGE);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#141413]">
      <img
        src={src}
        alt="Panggung konser orkestra simfoni"
        fetchPriority="high"
        onError={() => {
          if (src !== FALLBACK_IMAGE) setSrc(FALLBACK_IMAGE);
        }}
        className="w-full h-full object-cover brightness-[0.65]"
      />
    </div>
  );
};
