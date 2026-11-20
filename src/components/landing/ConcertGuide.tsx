import React from 'react';
import { FIRST_TIMER_STEPS } from './edukasiData';
import { Reveal } from './Reveal';

export const ConcertGuide: React.FC = () => {
  return (
    <section className="border-b border-[#E4DFD3] bg-[#F6F4EE] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C93018]">
            Panduan Penonton Perdana
          </p>
          <h2 className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-[#171614] sm:text-4xl lg:text-[46px]">
            Pengalaman Pertama di Konser Klasik
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-[#5C5850] sm:text-base">
            Lima langkah sederhana agar kehadiran pertama Anda di auditorium orkestra terasa nyaman, menyenangkan, dan berkesan.
          </p>
        </Reveal>

        <ol className="mt-12 border-t border-[#E4DFD3] lg:mt-14 list-none p-0">
          {FIRST_TIMER_STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.05}>
              <li className="group grid gap-3 border-b border-[#E4DFD3] py-7 transition-colors duration-300 sm:grid-cols-12 sm:items-baseline sm:gap-8">
                <span className="font-display text-4xl font-semibold leading-none tracking-tight text-[#6B665D] transition-colors duration-300 group-hover:text-[#C93018] sm:col-span-2 sm:text-5xl">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-2xl font-semibold tracking-tight text-[#171614] sm:col-span-4 m-0">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#5C5850] sm:col-span-6 m-0">{step.description}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
};
