import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from './Reveal';

export const EducationCTA: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 bg-[#F6F4EE]">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
        <Reveal>
          <div className="grid gap-10 rounded-2xl bg-[#11100E] text-white p-8 sm:p-12 lg:grid-cols-12 lg:items-end lg:gap-12 lg:p-16">
            <div className="lg:col-span-8">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-[#D8D3C8]">
                Langkah Selanjutnya
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-[48px]">
                Sudah siap menikmati pertunjukan?
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#D8D3C8] sm:text-base">
                Temukan konser berikutnya dan rasakan pengalaman musik secara langsung. Semua pengetahuan tadi akan Anda rasakan langsung dari kursi penonton.
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-right">
              <a
                href="/events"
                className="inline-flex min-h-12 items-center gap-2.5 rounded-lg bg-[#C93018] px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#A82511] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#11100E]"
              >
                <span>Jelajahi Konser</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
