import React, { useState } from 'react';
import { COMPOSERS } from './edukasiData';
import { Reveal } from './Reveal';

export const ComposerSpotlight: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const composer = COMPOSERS[activeIndex];

  return (
    <section id="komponis" className="scroll-mt-28 border-b border-[#E4DFD3] bg-[#F6F4EE] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C93018]">
            03 Profil Komponis
          </p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-[#171614] sm:text-4xl lg:text-[46px]">
            Sosok di Balik Mahakarya Simfoni Dunia
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-12 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-12">
            <figure className="overflow-hidden rounded-2xl bg-[#ECE8DF] border border-[#E4DFD3] lg:col-span-5">
              <img
                key={composer.name}
                src={composer.image}
                alt={`Potret editorial ${composer.name}`}
                className="aspect-[4/5] w-full object-cover"
              />
            </figure>

            <div className="lg:col-span-7 lg:pt-4">
              <h3 className="font-display text-[clamp(36px,5.5vw,64px)] font-semibold leading-[0.98] tracking-tight text-[#171614]">
                {composer.name}
              </h3>

              <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 border-y border-[#E4DFD3] py-6 sm:grid-cols-3">
                <div>
                  <dt className="text-[11px] font-mono uppercase tracking-widest text-[#6B665D]">
                    Tahun Hidup
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-[#171614] m-0">{composer.lifespan}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-mono uppercase tracking-widest text-[#6B665D]">
                    Negara Asal
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-[#171614] m-0">{composer.country}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-mono uppercase tracking-widest text-[#6B665D]">
                    Era Musik
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-[#171614] m-0">{composer.era}</dd>
                </div>
              </dl>

              <p className="mt-6 text-sm leading-relaxed text-[#5C5850] sm:text-base">{composer.context}</p>

              <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-[#C93018]">
                Karya Pilihan
              </p>
              <ul className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2 list-none p-0">
                {composer.works.map((work) => (
                  <li
                    key={work}
                    className="shrink-0 whitespace-nowrap rounded-lg border border-[#E4DFD3] bg-white px-4 py-2 text-xs font-semibold text-[#171614]"
                  >
                    {work}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-12 border-t border-[#E4DFD3] pt-6">
            <p className="text-xs font-mono uppercase tracking-widest text-[#6B665D]">
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
                    className={`min-h-11 cursor-pointer rounded-lg border px-4 py-2 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F4EE] ${
                      isActive
                        ? 'border-[#C93018] bg-[#C93018] font-semibold text-white'
                        : 'border-[#CFC9BC] bg-white font-normal text-[#5C5850] hover:border-[#171614] hover:text-[#171614]'
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
