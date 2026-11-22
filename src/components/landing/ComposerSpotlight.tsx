import React, { useState } from 'react';
import { COMPOSERS } from './edukasiData';
import { Reveal } from './Reveal';

export const ComposerSpotlight: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const composer = COMPOSERS[activeIndex];

  return (
    <section id="komponis" className="scroll-mt-28 border-b border-white/15 bg-[#141413] text-[#F4F3EF]">
      <div className="mx-auto max-w-[1360px] border-x border-white/15 px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
            <div className="lg:col-span-4">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D4FF2A] m-0">
                <span className="inline-block w-1.5 h-1.5 bg-[#D4FF2A]" aria-hidden="true" />
                <span>03 Profil Komponis</span>
              </p>
            </div>
            <div className="lg:col-span-8">
              <h2 className="max-w-3xl font-display text-3xl font-extrabold leading-[0.98] tracking-[-0.04em] text-[#F4F3EF] sm:text-5xl m-0">
                Sosok di Balik Mahakarya Simfoni Dunia
              </h2>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-12 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-12">
            <figure className="overflow-hidden rounded-none bg-[#1C1C1A] border border-white/15 chamfer-br lg:col-span-5 m-0">
              <img
                key={composer.name}
                src={composer.image}
                alt={`Potret editorial ${composer.name}`}
                className="aspect-[4/5] w-full object-cover"
              />
            </figure>

            <div className="lg:col-span-7 lg:pt-2">
              <h3 className="font-display text-[clamp(34px,5.2vw,60px)] font-extrabold leading-[0.95] tracking-[-0.04em] text-[#F4F3EF] m-0">
                {composer.name}
              </h3>

              <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 border-y border-white/15 py-6 sm:grid-cols-3">
                <div>
                  <dt className="text-[11px] font-mono uppercase tracking-widest text-[#B8B6AE]">
                    Tahun Hidup
                  </dt>
                  <dd className="mt-1.5 text-sm font-bold text-[#F4F3EF] m-0">{composer.lifespan}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-mono uppercase tracking-widest text-[#B8B6AE]">
                    Negara Asal
                  </dt>
                  <dd className="mt-1.5 text-sm font-bold text-[#F4F3EF] m-0">{composer.country}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-mono uppercase tracking-widest text-[#B8B6AE]">
                    Era Musik
                  </dt>
                  <dd className="mt-1.5 text-sm font-bold text-[#D4FF2A] m-0">{composer.era}</dd>
                </div>
              </dl>

              <p className="mt-6 text-sm leading-relaxed text-[#D8D6CE] sm:text-base">{composer.context}</p>

              <p className="mt-8 text-[11px] font-bold uppercase tracking-[0.16em] text-[#D4FF2A]">
                • Karya Pilihan
              </p>
              <ul className="no-scrollbar mt-4 flex gap-2.5 overflow-x-auto pb-2 list-none p-0">
                {composer.works.map((work) => (
                  <li
                    key={work}
                    className="shrink-0 whitespace-nowrap rounded-none border border-white/25 bg-[#1C1C1A] px-4 py-2 text-xs font-semibold text-[#F4F3EF]"
                  >
                    {work}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-12 border-t border-white/15 pt-6">
            <p className="text-[11px] font-mono uppercase tracking-widest text-[#B8B6AE]">
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
                    className={`min-h-11 cursor-pointer rounded-none border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A] ${
                      isActive
                        ? 'border-[#D4FF2A] bg-[#D4FF2A] text-[#141413]'
                        : 'border-white/25 bg-transparent text-[#D8D6CE] hover:border-white hover:text-white'
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
