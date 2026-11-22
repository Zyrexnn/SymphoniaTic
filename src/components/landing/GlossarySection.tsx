import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { GLOSSARY } from './edukasiData';
import { Reveal } from './Reveal';

const ALL = 'ALL';

export const GlossarySection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [letter, setLetter] = useState(ALL);

  const letters = useMemo(() => {
    const present = Array.from(new Set(GLOSSARY.map((g) => g.term.charAt(0).toUpperCase()))).sort();
    return [ALL, ...present];
  }, []);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return GLOSSARY.filter((g) => {
      const matchesLetter = letter === ALL || g.term.charAt(0).toUpperCase() === letter;
      const matchesQuery =
        !q || g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q);
      return matchesLetter && matchesQuery;
    });
  }, [search, letter]);

  const grouped = useMemo(() => {
    return results.reduce<Record<string, typeof GLOSSARY>>((acc, term) => {
      const key = term.term.charAt(0).toUpperCase();
      (acc[key] ||= []).push(term);
      return acc;
    }, {});
  }, [results]);

  return (
    <section id="glosarium" className="scroll-mt-28 border-b border-[#DFDDD6] bg-[#EAE8E1]">
      <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413]">
              • 04 Glosarium Musik
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-[0.98] tracking-[-0.04em] text-[#141413] sm:text-5xl">
              Glosarium Istilah Musik Simfoni
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#52514D]">
              Pahami istilah tempo, dinamika, dan format ansambel klasik agar Anda dapat menikmati alur pertunjukan dengan utuh.
            </p>

            <div className="mt-8 flex items-center gap-3 border border-[#141413] bg-white px-3.5 py-2 focus-within:ring-2 focus-within:ring-[#141413]">
              <Search size={16} strokeWidth={2} className="shrink-0 text-[#52514D]" aria-hidden="true" />
              <label htmlFor="edukasi-search" className="sr-only">
                Cari istilah musik
              </label>
              <input
                id="edukasi-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari istilah musik..."
                className="w-full min-h-[36px] bg-transparent py-1 text-sm text-[#141413] outline-none placeholder:text-[#6E6D68]"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-8">
            <Reveal delay={0.06}>
              <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-2" role="group" aria-label="Filter huruf awal">
                {letters.map((l) => {
                  const isActive = letter === l;
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLetter(l)}
                      aria-pressed={isActive}
                      className={`min-h-11 shrink-0 cursor-pointer rounded-none border px-4 text-xs font-bold uppercase tracking-wider transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
                        isActive
                          ? 'border-[#141413] bg-[#141413] text-[#D4FF2A]'
                          : 'border-[#DFDDD6] bg-white text-[#52514D] hover:border-[#141413] hover:text-[#141413]'
                      }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </Reveal>

            {results.length === 0 ? (
              <div className="mt-10 rounded-none border border-[#DFDDD6] bg-white px-6 py-16 text-center">
                <p className="text-sm text-[#52514D]">
                  Tidak ada istilah yang cocok dengan pencarian Anda.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setLetter(ALL);
                  }}
                  className="mt-4 min-h-11 cursor-pointer bg-[#141413] px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#D4FF2A] transition-colors hover:bg-[#2A2A28]"
                >
                  Reset pencarian
                </button>
              </div>
            ) : (
              <div className="mt-10 space-y-10">
                {Object.entries(grouped).map(([initial, terms]) => (
                  <div key={initial}>
                    <div className="flex items-baseline gap-4 border-b border-[#141413] pb-3">
                      <span className="font-display text-3xl font-extrabold leading-none tracking-tight text-[#141413] bg-[#D4FF2A] px-2.5 py-0.5">
                        {initial}
                      </span>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#52514D]">
                        {terms.length} istilah
                      </span>
                    </div>
                    <dl className="mt-5 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                      {terms.map((entry) => (
                        <div key={entry.term} className="border-t border-[#DFDDD6] pt-4">
                          <dt className="font-display text-xl font-extrabold tracking-tight text-[#141413]">
                            {entry.term}
                          </dt>
                          <dd className="mt-1.5 text-sm leading-relaxed text-[#52514D] m-0">
                            {entry.definition}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
