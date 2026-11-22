import React from 'react';
import { FIRST_TIMER_STEPS } from './edukasiData';
import { Reveal } from './Reveal';

export const ConcertGuide: React.FC = () => {
  return (
    <section className="border-b border-[#DFDDD6] bg-[#F4F3EF]">
      <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
            <div className="lg:col-span-4">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413] m-0">
                <span className="inline-block w-1.5 h-1.5 bg-[#141413]" aria-hidden="true" />
                <span>Panduan Penonton Perdana</span>
              </p>
            </div>
            <div className="lg:col-span-8">
              <h2 className="max-w-3xl font-display text-3xl font-extrabold leading-[0.98] tracking-[-0.04em] text-[#141413] sm:text-5xl m-0">
                Pengalaman Pertama di Konser Klasik
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#52514D] sm:text-base m-0">
                Lima langkah sederhana agar kehadiran pertama Anda di auditorium orkestra terasa nyaman, menyenangkan, dan berkesan.
              </p>
            </div>
          </div>
        </Reveal>

        <ol className="mt-12 border-t border-[#141413] lg:mt-14 list-none p-0">
          {FIRST_TIMER_STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.04}>
              <li className="group grid gap-3 border-b border-[#DFDDD6] py-7 transition-colors duration-150 hover:bg-white/70 px-2 sm:grid-cols-12 sm:items-baseline sm:gap-8">
                <span className="font-display text-4xl font-extrabold leading-none tracking-[-0.04em] text-[#6E6D68] transition-colors duration-150 group-hover:text-[#141413] sm:col-span-2 sm:text-5xl tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-[#141413] sm:col-span-4 m-0">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#52514D] sm:col-span-6 m-0">{step.description}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
};
