import React, { useState } from 'react';
import { COMPOSERS } from './edukasiData';
import { Reveal } from './Reveal';

export const ComposerSpotlight: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const composer = COMPOSERS[activeIndex];

  return (
    <section id="komponis" className="scroll-mt-20 border-b border-[#E5E7EB] py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">
            03 Spotlight Komponis
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-[#183B56] sm:text-4xl lg:text-[44px]">
            Sosok di balik mahakarya yang akan kamu dengarkan.
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-12 lg:gap-12">
            <figure className="overflow-hidden rounded-2xl bg-[#F1F5F9] lg:col-span-5">
              <img
                key={composer.name}
                src={composer.image}
                alt={`Potret editorial ${composer.name}`}
                className="aspect-[4/5] w-full object-cover brightness-[0.9]"
              />
            </figure>

            <div className="lg:col-span-7 lg:pt-4">
              <h3 className="text-[clamp(36px,6vw,68px)] font-bold leading-[0.95] tracking-[-0.04em] text-[#183B56]">
                {composer.name}
              </h3>

              <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 border-y border-[#E5E7EB] py-6 sm:grid-cols-3">
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    Tahun Hidup
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-[#183B56]">{composer.lifespan}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    Negara
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-[#183B56]">{composer.country}</dd>
                </div>
                <div>
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
                    Era
                  </dt>
                  <dd className="mt-1.5 text-sm font-semibold text-[#183B56]">{composer.era}</dd>
                </div>
              </dl>

              <p className="mt-6 text-sm leading-relaxed text-[#64748B] sm:text-base">{composer.context}</p>

              <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#64748B]">
                Karya Terpilih
              </p>
              <ul className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-2">
                {composer.works.map((work) => (
                  <li
                    key={work}
                    className="shrink-0 whitespace-nowrap rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-2.5 text-sm text-[#183B56]"
                  >
                    {work}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-12 border-t border-[#E5E7EB] pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
              Pilih Komponis Lain
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
                    className={`min-h-11 cursor-pointer rounded-lg border px-4 py-2 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 ${
                      isActive
                        ? 'border-brand-accent bg-brand-accent/10 font-semibold text-[#183B56]'
                        : 'border-[#E5E7EB] bg-white font-normal text-[#183B56] hover:border-brand-accent/45'
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
