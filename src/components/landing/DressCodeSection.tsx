import React from 'react';
import { DRESS_CODES } from './edukasiData';
import { Reveal } from './Reveal';

export const DressCodeSection: React.FC = () => {
  return (
    <section id="pakaian" className="scroll-mt-20 border-b border-[#E5E7EB] py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">
                02 Panduan Pakaian
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-[#183B56] sm:text-4xl lg:text-[44px]">
                Dress for the Occasion
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#64748B]">
              Tidak ada dress code wajib di semua konser, tapi berpakaian dengan rapi menunjukkan bahwa kamu menghargai waktu dan usaha para musisi.
            </p>
          </div>
        </Reveal>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {DRESS_CODES.map((dc, i) => (
            <Reveal key={dc.name} delay={i * 0.08}>
              <li className="group h-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white transition-all duration-300 ease-out hover:border-brand-accent/45 hover:shadow-[0_24px_48px_-28px_rgba(24,59,86,0.4)]">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F1F5F9]">
                  <img
                    src={dc.image}
                    alt={`Referensi gaya pakaian ${dc.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover brightness-[0.95] transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-4 top-4 bg-white/95 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#183B56]">
                    {dc.label}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold tracking-[-0.02em] text-[#183B56]">{dc.name}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#64748B]">{dc.description}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
};
