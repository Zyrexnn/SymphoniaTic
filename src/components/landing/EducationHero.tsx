import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Reveal } from './Reveal';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1400&q=80';

const META = ['Classical Music', 'Concert Guide', '2026–2027'];

export const EducationHero: React.FC = () => {
  return (
    <section className="border-b border-[#E4DFD3] bg-[#F6F4EE]">
      <div className="mx-auto max-w-[1360px] px-4 pt-24 sm:px-8 lg:px-10 md:pt-28">
        <a
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[#5C5850] transition-colors duration-200 hover:text-[#171614] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F4EE]"
        >
          <ArrowLeft size={16} strokeWidth={1.6} aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </a>
      </div>

      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
        <div className="grid items-end gap-10 pb-14 pt-6 lg:grid-cols-12 lg:gap-12 lg:pb-20 lg:pt-12">
          <Reveal className="lg:col-span-7">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#C93018]">
              <span className="h-2 w-2 bg-[#C93018]" aria-hidden="true" />
              Panduan Penonton
            </p>

            <h1 className="mt-5 font-display text-[clamp(44px,8vw,92px)] font-semibold leading-[0.94] tracking-[-0.03em] text-[#171614]">
              Music
              <br />
              Culture
              <br />
              Guide
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-[1.5] text-[#171614] font-semibold">
              Etika, Sejarah &amp; Glosarium Musik Klasik.
            </p>

            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#5C5850] sm:text-base">
              Pelajari tata krama pertunjukan simfoni, kenali komponis di balik mahakarya, dan pahami istilah musik klasik sebelum menikmati konser.
            </p>

            <dl className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[#E4DFD3] pt-5">
              {META.map((item) => (
                <div key={item} className="flex items-baseline gap-2">
                  <dt className="sr-only">{item}</dt>
                  <dd className="text-xs font-mono uppercase tracking-widest text-[#6B665D]">{item}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-5">
            <figure className="relative overflow-hidden rounded-2xl bg-[#11100E] border border-[#E4DFD3]">
              <img
                src={HERO_IMAGE}
                alt="Pemain orkestra di panggung konser"
                fetchPriority="high"
                className="aspect-[4/5] w-full object-cover brightness-[0.9] transition-transform duration-500 hover:scale-[1.03] lg:aspect-[3/4]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#11100E]/85 to-transparent p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-white/95 font-mono m-0">
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
