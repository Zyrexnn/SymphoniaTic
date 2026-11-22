import React from 'react';
import { QrCode, ShieldCheck, Music4, Headphones } from 'lucide-react';
import { Reveal } from './Reveal';

const FEATURES = [
  {
    icon: QrCode,
    title: 'E-Ticket QR Terenkripsi',
    desc: 'Tiket digital dengan QR Code unik, langsung masuk tanpa cetak dan tanpa antrean fisik.',
  },
  {
    icon: ShieldCheck,
    title: 'Verifikasi Atomic Instan',
    desc: 'Sistem mengunci kuota real-time sehingga zero overbooking dan bebas percaloan.',
  },
  {
    icon: Music4,
    title: 'Kurasi Orkestra Dunia',
    desc: 'Hanya pertunjukan simfoni, opera, dan balet kelas dunia yang tayang di platform.',
  },
  {
    icon: Headphones,
    title: 'Audio Preview Langsung',
    desc: 'Dengarkan cuplikan karya sebelum beli lewat pemutar musik bawaan platform.',
  },
];

export const Features: React.FC = () => (
  <section className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-16 bg-[#F4F3EF]">
    <Reveal>
      <div className="mb-12 max-w-2xl">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413] block mb-3">
          • Keunggulan Layanan
        </span>
        <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] leading-[0.98] text-[#141413]">
          Standar Resmi Pemesanan Tiket Musik Klasik
        </h2>
      </div>
    </Reveal>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[#DFDDD6] border border-[#DFDDD6]">
      {FEATURES.map((f, i) => {
        const Icon = f.icon;
        return (
          <Reveal key={f.title} delay={i * 0.06}>
            <div className="flex flex-col p-6 rounded-none bg-white transition-colors duration-150 hover:bg-[#F9F8F5] h-full">
              <div className="w-10 h-10 rounded-none bg-[#D4FF2A] border border-[#141413] flex items-center justify-center mb-4">
                <Icon size={18} strokeWidth={2} className="text-[#141413]" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-extrabold text-[#141413] tracking-[-0.03em] mb-2">
                {f.title}
              </h3>
              <p className="text-xs sm:text-sm font-normal text-[#52514D] leading-relaxed m-0">
                {f.desc}
              </p>
            </div>
          </Reveal>
        );
      })}
    </div>
  </section>
);
