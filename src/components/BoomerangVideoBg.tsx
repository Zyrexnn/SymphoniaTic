import React, { useState } from 'react';

const CLASSICAL_HERO_IMAGE = '/images/concerts/symphony-no-5.jpg';
const FALLBACK_IMAGE = '/images/venues/aula-simfonia.jpg';

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
