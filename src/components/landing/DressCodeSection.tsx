import React from 'react';
import { DRESS_CODES } from './edukasiData';
import { Reveal } from './Reveal';

export const DressCodeSection: React.FC = () => {
  return (
    <section id="pakaian" className="scroll-mt-28 border-b border-[#DFDDD6] bg-[#EAE8E1]">
      <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start">
            <div className="lg:col-span-4">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413] m-0">
                <span className="inline-block w-1.5 h-1.5 bg-[#141413]" aria-hidden="true" />
                <span>02 Panduan Pakaian</span>
              </p>
            </div>
            <div className="lg:col-span-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-display text-3xl font-extrabold leading-[0.98] tracking-[-0.04em] text-[#141413] sm:text-5xl m-0">
                Panduan Berpakaian (Dress Code)
              </h2>
              <p className="max-w-xs text-xs sm:text-sm leading-relaxed text-[#52514D] m-0">
                Berpakaian rapi merupakan bentuk apresiasi terhadap musisi orkestra dan kenyamanan sesama penonton.
              </p>
            </div>
          </div>
        </Reveal>

        <ul className="mt-12 grid gap-px bg-[#DFDDD6] border border-[#DFDDD6] sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 list-none p-0">
          {DRESS_CODES.map((dc, i) => (
            <Reveal key={dc.name} delay={i * 0.06}>
              <li className="group h-full overflow-hidden rounded-none bg-white transition-colors duration-150">
                <div className="p-4 pb-0">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#141413] chamfer-br">
                    <img
                      src={dc.image}
                      alt={`Referensi gaya pakaian ${dc.name}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                    />
                    <span className="absolute left-3 top-3 rounded-none bg-[#D4FF2A] px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#141413]">
                      {dc.label}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="font-display text-2xl font-extrabold tracking-[-0.03em] text-[#141413] m-0">
                    {dc.name}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#52514D] mb-0">{dc.description}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
};
