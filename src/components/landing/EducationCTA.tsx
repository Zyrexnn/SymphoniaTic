import React from 'react';
import { Reveal } from './Reveal';

export const EducationCTA: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10">
        <Reveal>
          <div className="grid gap-10 rounded-2xl bg-[#14161F] border border-[#272A38] p-8 sm:p-12 lg:grid-cols-12 lg:items-end lg:gap-12 lg:p-16">
            <div className="lg:col-span-8">
              <p className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
                Langkah Selanjutnya
              </p>
              <h2 className="mt-5 text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[44px]">
                Sudah siap menikmati pertunjukan?
              </h2>
              <p className="mt-5 max-w-lg text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
                Temukan konser berikutnya dan rasakan pengalaman musik secara langsung. Semua pengetahuan tadi akan Anda rasakan langsung dari kursi penonton.
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-right">
              <a
                href="/events"
                className="inline-flex min-h-12 items-center gap-3 rounded-lg bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors duration-200 hover:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D12] shadow-sm"
              >
                <span className="h-2 w-2 rounded-full bg-black" aria-hidden />
                Jelajahi Konser
                <span aria-hidden>&rarr;</span>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
