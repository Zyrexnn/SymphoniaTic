import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Reveal } from './Reveal';

const HERO_IMAGE = '/images/venues/aula-simfonia.jpg';

const META = ['Classical Music', 'Concert Guide', '2026-2027'];

export const EducationHero: React.FC = () => {
  return (
    <section className="border-b border-white/15 bg-[#141413] text-[#F4F3EF] pt-[64px]">
      <div className="mx-auto max-w-[1360px] border-x border-white/15 px-5 sm:px-8 lg:px-10 pt-8">
        <a
          href="/"
          className="inline-flex min-h-11 items-center gap-2 border border-white/25 bg-[#141413] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#F4F3EF] transition-colors hover:border-[#D4FF2A] hover:text-[#D4FF2A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A]"
        >
          <ArrowLeft size={15} strokeWidth={2} aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </a>
      </div>

      <div className="mx-auto max-w-[1360px] border-x border-white/15 px-5 sm:px-8 lg:px-10">
        <div className="grid items-end gap-10 pb-14 pt-8 lg:grid-cols-12 lg:gap-12 lg:pb-20 lg:pt-12">
          <Reveal className="lg:col-span-7">
            <p className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#D4FF2A] m-0">
              <span className="h-2 w-2 bg-[#D4FF2A]" aria-hidden="true" />
              <span>Panduan Penonton</span>
            </p>

            <h1 className="mt-5 font-display text-[clamp(44px,8vw,96px)] font-extrabold leading-[0.9] tracking-[-0.045em] text-[#F4F3EF] m-0">
              Music
              <br />
              Culture
              <br />
              Guide.
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-[1.4] text-[#D4FF2A] font-bold m-0">
              Etika, Sejarah &amp; Glosarium Musik Klasik.
            </p>

            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#B8B6AE] sm:text-base m-0">
              Pelajari tata krama pertunjukan simfoni, kenali komponis di balik mahakarya, dan pahami istilah musik klasik sebelum menikmati konser.
            </p>

            <dl className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/15 pt-5">
              {META.map((item) => (
                <div key={item} className="flex items-baseline gap-2">
                  <dt className="sr-only">{item}</dt>
                  <dd className="text-[11px] font-mono uppercase tracking-widest text-[#B8B6AE] m-0">{item}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-5">
            <figure className="relative overflow-hidden bg-[#1C1C1A] border border-white/15 chamfer-br m-0">
              <img
                src={HERO_IMAGE}
                alt="Pemain orkestra di panggung konser"
                fetchPriority="high"
                className="aspect-[4/5] w-full object-cover brightness-[0.88] transition-transform duration-300 hover:scale-[1.03] lg:aspect-[3/4]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#141413]/90 to-transparent p-5">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#D4FF2A] font-mono font-bold m-0">
                  Aula Simfonia Jakarta
                </p>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
