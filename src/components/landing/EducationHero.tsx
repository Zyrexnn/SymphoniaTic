import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Reveal } from './Reveal';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1400&q=80';

const META = ['Classical Music', 'Concert Guide', '2026'];

export const EducationHero: React.FC = () => {
  return (
    <section className="border-b border-[#E5E7EB]">
      <div className="mx-auto max-w-[1400px] px-6 pt-10 sm:px-8 md:px-10 md:pt-14">
        <a
          href="/"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-normal text-[#64748B] transition-colors duration-200 hover:text-[#183B56] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          <span>Kembali ke Beranda</span>
        </a>
      </div>

      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10">
        <div className="grid items-end gap-10 pb-14 pt-8 lg:grid-cols-12 lg:gap-12 lg:pb-20 lg:pt-14">
          <Reveal className="lg:col-span-7">
            <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#183B56]">
              <span className="h-2 w-2 bg-brand-accent" aria-hidden />
              Panduan Penonton
            </p>

            <h1 className="mt-6 text-[clamp(44px,9vw,104px)] font-bold leading-[0.92] tracking-[-0.045em] text-[#183B56]">
              Music
              <br />
              Culture
              <br />
              Guide
            </h1>

            <p className="mt-8 max-w-lg text-lg leading-[1.5] text-[#64748B]">
              Etika, Sejarah &amp; Glosarium Musik Klasik.
            </p>

            <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#64748B] sm:text-base">
              Pelajari tata krama pertunjukan simfoni, kenali komponis di balik mahakarya, dan pahami istilah musik klasik sebelum menikmati konser.
            </p>

            <dl className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[#E5E7EB] pt-5">
              {META.map((item) => (
                <div key={item} className="flex items-baseline gap-2">
                  <dt className="sr-only">{item}</dt>
                  <dd className="text-xs font-semibold uppercase tracking-[0.16em] text-[#64748B]">{item}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-5">
            <figure className="relative overflow-hidden rounded-2xl bg-[#F1F5F9]">
              <img
                src={HERO_IMAGE}
                alt="Pemain orkestra di panggung konser"
                className="aspect-[4/5] w-full object-cover brightness-[0.92] transition-transform duration-500 hover:scale-[1.03] lg:aspect-[3/4]"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5">
                <p className="text-xs uppercase tracking-[0.16em] text-white/80">
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
