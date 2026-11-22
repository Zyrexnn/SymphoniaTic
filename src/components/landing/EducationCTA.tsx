import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from './Reveal';

export const EducationCTA: React.FC = () => {
  return (
    <section className="bg-[#141413] text-[#F4F3EF] border-t border-white/15">
      <div className="mx-auto max-w-[1360px] border-x border-white/15 px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-12">
            <div className="lg:col-span-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D4FF2A] m-0">
                • Langkah Selanjutnya
              </p>
              <h2 className="mt-4 font-display text-3xl font-extrabold leading-[0.98] tracking-[-0.04em] text-[#F4F3EF] sm:text-5xl m-0">
                Sudah siap menikmati pertunjukan?
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#B8B6AE] sm:text-base mb-0">
                Temukan konser berikutnya dan rasakan pengalaman musik secara langsung. Semua pengetahuan tadi akan Anda rasakan langsung dari kursi penonton.
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-right">
              <a
                href="/events"
                className="inline-flex min-h-12 items-center gap-2.5 rounded-none bg-[#D4FF2A] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-[#141413] transition-colors hover:bg-[#C2EE1A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A]"
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
