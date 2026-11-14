import React, { useState } from 'react';
import { COMPOSERS } from './edukasiData';
import { Reveal } from './Reveal';

export const ComposerSpotlight: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const composer = COMPOSERS[activeIndex];

  return (
    <section id="komponis" className="scroll-mt-28 border-b border-[#272A38] py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10">
        <Reveal>
          <p className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
            03 Profil Komponis
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[44px]">
            Sosok di Balik Mahakarya Simfoni Dunia
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
            <figure className="overflow-hidden rounded-2xl bg-[#14161F] border border-[#272A38] lg:col-span-5">
              <img
                key={composer.name}
                src={composer.image}
                alt={`Potret editorial ${composer.name}`}
                className="aspect-[4/5] w-full object-cover brightness-[0.88]"
              />
            </figure>

            <div className="lg:col-span-7 lg:pt-4">
              <h3 className="text-[clamp(36px,6vw,68px)] font-bold leading-[0.95] tracking-tight text-white">
                {composer.name}
              </h3>

              <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 border-y border-[#272A38] py-6 sm:grid-cols-3">
                <div>
                  <dt className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                    Tahun Hidup
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-white">{composer.lifespan}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                    Negara Asal
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-white">{composer.country}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-mono uppercase tracking-widest text-[#71717A]">
                    Era Musik
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-white">{composer.era}</dd>
                </div>
              </dl>

              <p className="mt-6 text-sm leading-relaxed text-[#A1A1AA] sm:text-base">{composer.context}</p>

              <p className="mt-8 text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
                Karya Pilihan
              </p>
              <ul className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
                {composer.works.map((work) => (
                  <li
                    key={work}
                    className="shrink-0 whitespace-nowrap rounded-lg border border-[#272A38] bg-[#14161F] px-4 py-2 text-xs font-medium text-white"
                  >
                    {work}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-12 border-t border-[#272A38] pt-6">
            <p className="text-xs font-mono uppercase tracking-widest text-[#71717A]">
              Pilih Komponis
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {COMPOSERS.map((c, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    aria-pressed={isActive}
                    className={`min-h-11 cursor-pointer rounded-lg border px-4 py-2 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D12] ${
                      isActive
                        ? 'border-white bg-white font-semibold text-black'
                        : 'border-[#272A38] bg-[#14161F] font-normal text-[#A1A1AA] hover:border-white/40 hover:text-white'
                    }`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
