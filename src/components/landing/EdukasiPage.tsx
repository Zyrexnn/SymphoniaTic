import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, VolumeX, CameraOff, Shirt, Hand, BookOpen, ChevronDown } from 'lucide-react';

type Section = 'ETIKA' | 'KOMPONIS' | 'GLOSARIUM';

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'ETIKA', label: 'Etika & Dress Code' },
  { id: 'KOMPONIS', label: 'Spotlight Komponis' },
  { id: 'GLOSARIUM', label: 'Glosarium Musik' },
];

const DRESS_CODES = [
  { label: 'Formal / Black Tie', description: 'Jas gelap lengkap dengan dasi, gaun malam, atau kebaya formal. Direkomendasikan untuk kursi VIP dan premiere.' },
  { label: 'Smart Casual', description: 'Kemeja rapi, celana bahan, blazer, atau batik modern. Pilihan paling umum dan diterima di semua kategori kursi.' },
  { label: 'Casual Rapi', description: 'Kaos polos, denim gelap, sneaker bersih. Diterima untuk konser neoklasik, namun hindari sandal dan celana pendek.' },
];

const VENUE_RULES = [
  { icon: VolumeX, title: 'Mode Senyap HP', desc: 'Ponsel wajib mode senyap atau dimatikan selama pertunjukan berlangsung.' },
  { icon: CameraOff, title: 'Tanpa Flash Kamera', desc: 'Flash dan lampu video dilarang karena mengganggu konsentrasi musisi dan penonton lain.' },
  { icon: Hand, title: 'Tepuk Tangan', desc: 'Bertepuk tangan hanya setelah seluruh movement selesai. Tanda penonton berpengalaman adalah hening di sela movement.' },
  { icon: Shirt, title: 'Latecomer Entrance', desc: 'Penonton terlambat hanya boleh masuk saat jeda antar movement atau intermission.' },
];

const COMPOSERS = [
  {
    name: 'Ludwig van Beethoven',
    period: 'Klasik — Romantis (1770–1827)',
    context: 'Bapak simfoni modern. Mulai kehilangan pendengaran sekitar 1798, kondisi yang justru memperdalam ekspresi karyanya. Symphony No. 5 ditulis 1804–1808 di tengah pergolakan Perang Napoleon. Motif empat nada pembuka — G-G-G-Eb — menjadi salah satu ikon musik paling dikenal dunia.',
    works: ['Symphony No. 5 in C minor, Op. 67', 'Symphony No. 9 "Ode to Joy"', 'Für Elise', 'Piano Sonata No. 14 "Moonlight"'],
  },
  {
    name: 'Wolfgang Amadeus Mozart',
    period: 'Klasik (1756–1791)',
    context: 'Prodigy yang mulai komposisi usia 5 tahun. Menggabungkan keindahan melodi dengan struktur formal yang sempurna. Wafat di usia 35 tahun, meninggalkan lebih dari 600 karya. Requiem-nya yang terakhir sempat tak terselesaikan.',
    works: ['Symphony No. 40 in G minor', 'Piano Concerto No. 21', 'Eine kleine Nachtmusik', 'Requiem in D minor'],
  },
  {
    name: 'Frédéric Chopin',
    period: 'Romantis (1810–1849)',
    context: 'Penyair piano. Hampir seluruh karyanya ditulis untuk piano solo. Etnis Polandia, tinggal di Paris sebagian besar hidupnya. Nocturne-nya menggabungkan lirisitas vokal dengan harmoni inovatif. Meninggal muda di usia 39 tahun.',
    works: ['Nocturne Op. 9 No. 2', 'Ballade No. 1 in G minor', 'Fantaisie-Impromptu', 'Revolutionary Étude'],
  },
  {
    name: 'Antonio Vivaldi',
    period: 'Barok (1678–1741)',
    context: 'Padre merah dari Venesia. Menulis lebih dari 500 konser, termasuk The Four Seasons — kembali programatik paling terkenal. Menjadi pastor namun berhenti melayani misa karena alasan kesehatan, lalu mengabdikan diri pada musik.',
    works: ['The Four Seasons', 'Gloria in D', 'Lute Concerto in D', 'Violin Concerto in A minor'],
  },
];

const GLOSSARY = [
  { term: 'Opus', definition: 'Nomor katalog yang menunjukkan urutan penerbitan karya seorang komponis, disingkat "Op.".' },
  { term: 'Movement', definition: 'Bagian mandiri dari sebuah karya besar seperti simfoni. Penonton tradisional menunggu seluruh movement selesai sebelum bertepuk tangan.' },
  { term: 'Encore', definition: 'Lagu tambahan yang dimainkan setelah program utama selesai sebagai respons tepuk tangan penonton.' },
  { term: 'Conductor', definition: 'Dirigen — pemimpin orkestra yang mengatur tempo, dinamika, dan penyatuan para musisi.' },
  { term: 'Cadenza', definition: 'Passage solo virtuosik, biasanya mendekati akhir movement, di mana solois menampilkan improvisasi teknis tanpa iringan penuh.' },
  { term: 'Allegro', definition: 'Penunjuk tempo yang berarti cepat dan hidup. "Allegro con brio" = cepat dengan semangat.' },
  { term: 'Andante', definition: 'Penunjuk tempo yang berarti berjalan, tidak terlalu lambat maupun cepat.' },
  { term: 'Symphony', definition: 'Karya orkestra besar multi-bagian, biasanya empat movement, untuk orkestra simfoni penuh.' },
  { term: 'Chamber Music', definition: 'Musik klasik untuk kelompok kecil musisi (umumnya 2–9 orang), dimainkan tanpa konduktor.' },
  { term: 'Orchestra Pit', definition: 'Area tempat duduk musisi di depan panggung, sedikit lebih rendah dari lantai penonton.' },
  { term: 'Overture', definition: 'Pembuka instrumental yang dimainkan sebelum opera atau balet dimulai.' },
  { term: 'Forte', definition: 'Penunjuk dinamika yang berarti keras atau kuat. Disimbolkan "f".' },
  { term: 'Piano', definition: 'Penunjuk dinamika yang berarti lembut. Disimbolkan "p". Bukan merujuk alat musik piano.' },
  { term: 'Vibrato', definition: 'Teknik getaran pitch yang dilakukan penyanyi atau pemain gesek untuk memperkaya warna bunyi.' },
];

const EdukasiPage: React.FC = () => {
  const [section, setSection] = useState<Section>('ETIKA');
  const [search, setSearch] = useState('');
  const [openComposer, setOpenComposer] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-[#171717] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-[1400px] px-10 pt-[80px] pb-10">
          <a href="/" className="inline-flex items-center gap-2 text-base font-light tracking-[-0.05px] text-[#9a9a9a] hover:opacity-60 transition-opacity mb-10">
            <ArrowLeft size={16} strokeWidth={1} />
            <span>Kembali ke Beranda</span>
          </a>
          <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mb-5">
            Panduan Penonton
          </p>
          <h1 className="text-[clamp(32px,5vw,56px)] leading-[1.0] tracking-[-0.056em] font-light m-0">
            Etika, Sejarah &amp; Glosarium<br />Musik Klasik.
          </h1>
          <p className="text-xl tracking-[-0.01em] font-light text-[#9a9a9a] mt-5 max-w-[720px]">
            Pelajari tata krama pertunjukan simfoni, kenali komponis di balik mahakarya, dan pahami istilah musik klasik sebelum menikmati konser.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-[rgba(23,23,23,0.95)] border-b border-white/[0.06]">
        <div className="mx-auto max-w-[1400px] px-10">
          <div className="flex overflow-x-auto no-scrollbar">
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`whitespace-nowrap cursor-pointer bg-transparent border-none text-base font-light tracking-[-0.05px] px-6 pt-4 pb-[14px] ${
                  section === s.id
                    ? 'text-white border-b border-white'
                    : 'text-[#9a9a9a] border-b border-transparent'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-[1400px] px-10 py-20">
        {/* ETIKA */}
        {section === 'ETIKA' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Aturan Ruang */}
            <h2 className="text-[28px] tracking-[-0.02em] font-light mb-10">Aturan Ruang Pertunjukan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 mb-20 max-w-[1000px]">
              {VENUE_RULES.map((rule, i) => {
                const Icon = rule.icon;
                return (
                  <div key={i} className="border-b border-white/[0.06] pb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon size={18} strokeWidth={1} className="text-white" />
                      <h3 className="text-xl tracking-[-0.01em] font-light text-white">{rule.title}</h3>
                    </div>
                    <p className="text-base font-light text-[#9a9a9a] leading-[1.6]">{rule.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Dress Code */}
            <h2 className="text-[28px] tracking-[-0.02em] font-light mb-10">Panduan Pakaian (Dress Code)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 max-w-[1000px]">
              {DRESS_CODES.map((dc, i) => (
                <div key={i} className="border-t border-l border-white/[0.06] p-8">
                  <span className="inline-block text-[11px] font-light tracking-[0.12em] uppercase text-[#9a9a9a] border border-white/[0.12] px-3 py-1 mb-4">
                    {dc.label}
                  </span>
                  <p className="text-base font-light text-[#9a9a9a] leading-[1.6]">{dc.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* KOMPONIS */}
        {section === 'KOMPONIS' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[800px]"
          >
            <h2 className="text-[28px] tracking-[-0.02em] font-light mb-10">Spotlight Komponis &amp; Sejarah Karya</h2>
            <p className="text-base font-light text-[#9a9a9a] leading-[1.7] mb-12 max-w-[720px]">
              Kenali sosok di balik mahakarya yang akan Anda dengarkan. Setiap komponis membawa konteks zaman, perjuangan, dan visi estetik yang membentuk nada-nada di balik pertunjukan.
            </p>
            <div className="divide-y divide-white/[0.06]">
              {COMPOSERS.map((c, i) => {
                const isOpen = openComposer === i;
                return (
                  <div key={i} className="py-6">
                    <button
                      onClick={() => setOpenComposer(isOpen ? null : i)}
                      className="w-full flex items-center justify-between text-left cursor-pointer bg-transparent border-none"
                    >
                      <div>
                        <h3 className="text-xl tracking-[-0.01em] font-light text-white">{c.name}</h3>
                        <p className="text-base font-light text-[#9a9a9a] mt-1">{c.period}</p>
                      </div>
                      <ChevronDown
                        size={16}
                        strokeWidth={1}
                        className={`text-[#9a9a9a] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="text-base font-light text-[#9a9a9a] leading-[1.7] mt-5 mb-6">
                          {c.context}
                        </p>
                        <p className="text-[11px] font-light tracking-[0.12em] uppercase text-[#9a9a9a] mb-3">Karya Terpilih</p>
                        <ul className="space-y-2">
                          {c.works.map((w, j) => (
                            <li key={j} className="text-base font-light text-white leading-[1.5]">{w}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* GLOSARIUM */}
        {section === 'GLOSARIUM' && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[800px]"
          >
            <h2 className="text-[28px] tracking-[-0.02em] font-light mb-10 flex items-center gap-3">
              <BookOpen size={20} strokeWidth={1} className="text-white" />
              Glosarium Musik Klasik
            </h2>

            <div className="flex items-center gap-3 mb-10 max-w-[400px] border-b border-white/[0.08] pb-2">
              <Search size={14} strokeWidth={1} className="text-[#9a9a9a]" />
              <input
                type="text"
                placeholder="Cari istilah musik..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-base font-light tracking-[-0.05px] text-white bg-transparent border-none outline-none w-full py-1"
              />
            </div>

            <div className="divide-y divide-white/[0.06]">
              {GLOSSARY
                .filter((g) =>
                  !search ||
                  g.term.toLowerCase().includes(search.toLowerCase()) ||
                  g.definition.toLowerCase().includes(search.toLowerCase())
                )
                .map((g, i) => (
                  <div key={i} className="py-5">
                    <h3 className="text-xl tracking-[-0.01em] font-light text-white mb-1.5">{g.term}</h3>
                    <p className="text-base font-light text-[#9a9a9a] leading-[1.6]">{g.definition}</p>
                  </div>
                ))}
            </div>

            {GLOSSARY.filter((g) =>
              !search ||
              g.term.toLowerCase().includes(search.toLowerCase()) ||
              g.definition.toLowerCase().includes(search.toLowerCase())
            ).length === 0 && (
              <p className="text-base font-light text-[#9a9a9a] py-10">Istilah tidak ditemukan.</p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EdukasiPage;
