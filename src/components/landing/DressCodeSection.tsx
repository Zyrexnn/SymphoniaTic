import React from 'react';
import { DRESS_CODES } from './edukasiData';
import { Reveal } from './Reveal';

export const DressCodeSection: React.FC = () => {
  return (
    <section id="pakaian" className="scroll-mt-28 border-b border-[#272A38] py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10">
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
                02 Panduan Pakaian
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[44px]">
                Panduan Berpakaian (Dress Code)
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-[#A1A1AA]">
              Berpakaian rapi dan pantas merupakan bentuk apresiasi terhadap musisi orkestra dan kenyamanan sesama penonton simfoni.
            </p>
          </div>
        </Reveal>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
          {DRESS_CODES.map((dc, i) => (
            <Reveal key={dc.name} delay={i * 0.08}>
              <li className="group h-full overflow-hidden rounded-xl border border-[#272A38] bg-[#14161F] transition-all duration-300 ease-out hover:border-white/30">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#1D202D]">
                  <img
                    src={dc.image}
                    alt={`Referensi gaya pakaian ${dc.name}`}
                    loading="lazy"
                    className="h-full w-full object-cover brightness-[0.92] transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                  />
                  <span className="absolute left-4 top-4 rounded-md bg-[#0C0D12]/85 border border-white/20 px-3 py-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                    {dc.label}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold tracking-tight text-white">{dc.name}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#A1A1AA]">{dc.description}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
};
