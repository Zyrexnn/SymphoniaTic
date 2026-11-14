import React from 'react';
import { VENUE_RULES } from './edukasiData';
import { Reveal } from './Reveal';

export const EtiquetteSection: React.FC = () => {
  return (
    <section id="etika" className="scroll-mt-28 border-b border-[#272A38] py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-4">
            <p className="text-6xl font-bold leading-none tracking-tight text-white lg:text-7xl font-mono">
              01
            </p>
            <p className="mt-6 text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
              Etika Konser
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[44px]">
              Tata Krama di Ruang Pertunjukan
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#A1A1AA]">
              Aturan ini menjaga keheningan ruang akustik agar pertunjukan orkestra dapat dinikmati secara khidmat oleh seluruh penonton.
            </p>
          </Reveal>

          <div className="lg:col-span-8 lg:pt-4">
            <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {VENUE_RULES.map((rule, i) => {
                const Icon = rule.icon;
                return (
                  <Reveal key={rule.title} delay={i * 0.06}>
                    <li className="border-t border-[#272A38] pt-5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-mono font-semibold tracking-wider text-[#71717A]">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <Icon size={18} strokeWidth={1.5} className="text-white" />
                      </div>
                      <h3 className="mt-4 text-xl font-bold tracking-tight text-white">
                        {rule.title}
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-[#A1A1AA]">{rule.desc}</p>
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
