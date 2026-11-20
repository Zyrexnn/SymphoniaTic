import React from 'react';
import { VENUE_RULES } from './edukasiData';
import { Reveal } from './Reveal';

export const EtiquetteSection: React.FC = () => {
  return (
    <section id="etika" className="scroll-mt-28 border-b border-[#E4DFD3] bg-[#F6F4EE] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-4">
            <p className="font-display text-6xl font-semibold leading-none tracking-tight text-[#C93018] lg:text-7xl m-0">
              01
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-[#C93018]">
              Etika Konser
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-[#171614] sm:text-4xl lg:text-[44px]">
              Tata Krama di Ruang Pertunjukan
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#5C5850]">
              Aturan ini menjaga keheningan ruang akustik agar pertunjukan orkestra dapat dinikmati secara khidmat oleh seluruh penonton.
            </p>
          </Reveal>

          <div className="lg:col-span-8 lg:pt-4">
            <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 list-none p-0">
              {VENUE_RULES.map((rule, i) => {
                const Icon = rule.icon;
                return (
                  <Reveal key={rule.title} delay={i * 0.06}>
                    <li className="border-t border-[#E4DFD3] pt-5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-mono font-semibold tracking-wider text-[#C93018]">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <Icon size={18} strokeWidth={1.6} className="text-[#171614]" aria-hidden="true" />
                      </div>
                      <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-[#171614] m-0">
                        {rule.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#5C5850] mb-0">{rule.desc}</p>
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
