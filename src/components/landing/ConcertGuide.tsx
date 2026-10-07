import React from 'react';
import { FIRST_TIMER_STEPS } from './edukasiData';
import { Reveal } from './Reveal';

export const ConcertGuide: React.FC = () => {
  return (
    <section className="border-b border-[#E5E7EB] py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">
            Panduan Pertama Kalib
          </p>
          <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.1] tracking-[-0.03em] text-[#183B56] sm:text-4xl lg:text-[44px]">
            First time at a classical concert?
          </h2>
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-[#64748B] sm:text-base">
            Lima langkah ini membuat pengalaman pertunjukan pertamamu berjalan mulus, dan membuat penonton di sekitarmu senang berada di sana.
          </p>
        </Reveal>

        <ol className="mt-12 border-t border-[#E5E7EB] lg:mt-16">
          {FIRST_TIMER_STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.05}>
              <li className="group grid gap-3 border-b border-[#E5E7EB] py-7 transition-colors duration-300 sm:grid-cols-12 sm:items-baseline sm:gap-8">
                <span className="text-4xl font-bold leading-none tracking-[-0.04em] text-ink-soft transition-colors duration-300 group-hover:text-brand-accent sm:col-span-2 sm:text-5xl">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-xl font-bold tracking-[-0.02em] text-[#183B56] sm:col-span-4">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#64748B] sm:col-span-6">{step.description}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
};
