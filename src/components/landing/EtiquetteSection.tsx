import React from 'react';
import { VENUE_RULES } from './edukasiData';
import { Reveal } from './Reveal';

export const EtiquetteSection: React.FC = () => {
  return (
    <section id="etika" className="scroll-mt-28 border-b border-[#DFDDD6] bg-[#F4F3EF]">
      <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-4">
            <p className="font-display text-6xl font-extrabold leading-none tracking-[-0.05em] text-[#141413] lg:text-7xl m-0 tabular-nums">
              <span className="bg-[#D4FF2A] px-2 py-0.5 inline-block">01</span>
            </p>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413]">
              • Etika Konser
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-[0.98] tracking-[-0.04em] text-[#141413] sm:text-5xl">
              Tata Krama di Ruang Pertunjukan
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#52514D]">
              Aturan ini menjaga keheningan ruang akustik agar pertunjukan orkestra dapat dinikmati secara khidmat oleh seluruh penonton.
            </p>
          </Reveal>

          <div className="lg:col-span-8 lg:pt-2">
            <ul className="grid gap-px bg-[#DFDDD6] border border-[#DFDDD6] sm:grid-cols-2 list-none p-0">
              {VENUE_RULES.map((rule, i) => {
                const Icon = rule.icon;
                return (
                  <Reveal key={rule.title} delay={i * 0.05}>
                    <li className="bg-white p-6 h-full">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-mono font-bold tracking-wider text-[#141413] bg-[#D4FF2A] px-2 py-0.5">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <Icon size={18} strokeWidth={1.8} className="text-[#141413]" aria-hidden="true" />
                      </div>
                      <h3 className="mt-4 font-display text-2xl font-extrabold tracking-[-0.03em] text-[#141413] m-0">
                        {rule.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#52514D] mb-0">{rule.desc}</p>
                    </li>
                  </Reveal>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
