import React from 'react';
import { VENUE_RULES } from './edukasiData';
import { Reveal } from './Reveal';

export const EtiquetteSection: React.FC = () => {
  return (
    <section id="etika" className="scroll-mt-20 border-b border-[#E5E7EB] py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-4">
            <p className="text-6xl font-bold leading-none tracking-[-0.04em] text-brand-accent lg:text-7xl">
              01
            </p>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">
              Etika Konser
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-[#183B56] sm:text-4xl lg:text-[44px]">
              Bagaimana bersikap di ruang pertunjukan.
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-[#64748B]">
              Empat aturan ini bukan formalitas. Melanggar satu saja cukup untuk merusak pengalaman seluruh penonton di sekitarmu.
            </p>
          </Reveal>

          <div className="lg:col-span-8 lg:pt-4">
            <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {VENUE_RULES.map((rule, i) => {
                const Icon = rule.icon;
                return (
                  <Reveal key={rule.title} delay={i * 0.06}>
                    <li className="border-t border-[#183B56] pt-5">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs font-semibold tracking-[0.14em] text-ink-soft">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <Icon size={18} strokeWidth={1.25} className="text-brand-accent" />
                      </div>
                      <h3 className="mt-4 text-xl font-bold tracking-[-0.02em] text-[#183B56]">
                        {rule.title}
                      </h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-[#64748B]">{rule.desc}</p>
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
