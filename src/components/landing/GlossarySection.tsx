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
    <section id="glosarium" className="scroll-mt-28 border-b border-[#E4DFD3] bg-[#ECE8DF] py-20 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal className="lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C93018]">
              04 Glosarium Musik
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.08] tracking-[-0.02em] text-[#171614] sm:text-4xl lg:text-[44px]">
              Glosarium Istilah Musik Simfoni
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#5C5850]">
              Pahami istilah tempo, dinamika, dan format ansambel klasik agar Anda dapat menikmati alur pertunjukan dengan utuh.
            </p>

            <div className="mt-8 flex items-center gap-3 border-b border-[#CFC9BC] pb-2 focus-within:border-[#C93018]">
              <Search size={16} strokeWidth={1.6} className="shrink-0 text-[#6B665D]" aria-hidden="true" />
              <label htmlFor="edukasi-search" className="sr-only">
                Cari istilah musik
              </label>
              <input
                id="edukasi-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari istilah musik..."
                className="w-full bg-transparent py-1 text-sm text-[#171614] outline-none placeholder:text-[#6B665D]"
              />
            </div>
          </Reveal>

          <div className="lg:col-span-8">
            <Reveal delay={0.06}>
              <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter huruf awal">
                {letters.map((l) => {
                  const isActive = letter === l;
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLetter(l)}
                      aria-pressed={isActive}
                      className={`min-h-11 shrink-0 cursor-pointer rounded-lg border px-4 text-xs font-semibold tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ECE8DF] ${
                        isActive
                          ? 'border-[#C93018] bg-[#C93018] text-white font-semibold'
                          : 'border-[#CFC9BC] bg-white text-[#5C5850] hover:border-[#171614] hover:text-[#171614]'
                      }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </Reveal>

            {results.length === 0 ? (
              <div className="mt-10 rounded-xl border border-[#E4DFD3] bg-white px-6 py-16 text-center">
                <p className="text-sm text-[#5C5850]">
                  Tidak ada istilah yang cocok dengan pencarian Anda.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setLetter(ALL);
                  }}
                  className="mt-4 min-h-11 cursor-pointer border-b-2 border-[#C93018] px-1 text-sm font-semibold text-[#C93018] transition-colors duration-200 hover:text-[#A82511] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
                >
                  Reset pencarian
                </button>
              </div>
            ) : (
              <div className="mt-10 space-y-10">
                {Object.entries(grouped).map(([initial, terms]) => (
                  <div key={initial}>
                    <div className="flex items-baseline gap-4 border-b border-[#CFC9BC] pb-3">
                      <span className="font-display text-3xl font-semibold leading-none tracking-tight text-[#C93018]">
                        {initial}
                      </span>
                      <span className="text-[11px] font-mono uppercase tracking-widest text-[#6B665D]">
                        {terms.length} istilah
                      </span>
                    </div>
                    <dl className="mt-5 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                      {terms.map((entry) => (
                        <div key={entry.term} className="border-t border-[#CFC9BC]/70 pt-4">
                          <dt className="font-display text-xl font-semibold tracking-tight text-[#171614]">
                            {entry.term}
                          </dt>
                          <dd className="mt-1.5 text-sm leading-relaxed text-[#5C5850] m-0">
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
