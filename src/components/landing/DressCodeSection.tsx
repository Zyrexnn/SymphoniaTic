import React from 'react';
import { DRESS_CODES } from './edukasiData';
import { Reveal } from './Reveal';

export const DressCodeSection: React.FC = () => {
  return (
    <section id="pakaian" className="scroll-mt-28 border-b border-[#E4DFD3] bg-[#ECE8DF] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C93018]">
                02 Panduan Pakaian
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-[#171614] sm:text-4xl lg:text-[46px]">
                Panduan Berpakaian (Dress Code)
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#5C5850]">
              Berpakaian rapi dan pantas merupakan bentuk apresiasi terhadap musisi orkestra dan kenyamanan sesama penonton simfoni.
            </p>
          </div>
        </Reveal>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6 list-none p-0">
          {DRESS_CODES.map((dc, i) => (
            <Reveal key={dc.name} delay={i * 0.08}>
              <li className="group h-full overflow-hidden rounded-xl border border-[#E4DFD3] bg-white transition-colors duration-200 hover:border-[#171614]">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#ECE8DF]">
                  <img
                    src={dc.image}
                    alt={`Referensi gaya pakaian ${dc.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-4 top-4 rounded-md bg-[#C93018] px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-white">
                    {dc.label}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-display text-2xl font-semibold tracking-tight text-[#171614] m-0">
                    {dc.name}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#5C5850] mb-0">{dc.description}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
};
