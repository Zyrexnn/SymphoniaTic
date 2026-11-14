import React from 'react';
import { FIRST_TIMER_STEPS } from './edukasiData';
import { Reveal } from './Reveal';

export const ConcertGuide: React.FC = () => {
  return (
    <section className="border-b border-[#272A38] py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10">
        <Reveal>
          <p className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
            Panduan Penonton Perdana
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[44px]">
            Pengalaman Pertama di Konser Klasik
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
            Lima langkah sederhana agar kehadiran pertama Anda di auditorium orkestra terasa nyaman, menyenangkan, dan berkesan.
          </p>
        </Reveal>

        <ol className="mt-12 border-t border-[#272A38] lg:mt-16">
          {FIRST_TIMER_STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.05}>
              <li className="group grid gap-3 border-b border-[#272A38] py-7 transition-colors duration-300 sm:grid-cols-12 sm:items-baseline sm:gap-8">
                <span className="text-4xl font-mono font-bold leading-none tracking-tight text-[#71717A] transition-colors duration-300 group-hover:text-white sm:col-span-2 sm:text-5xl">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-xl font-bold tracking-tight text-white sm:col-span-4">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#A1A1AA] sm:col-span-6">{step.description}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
};
