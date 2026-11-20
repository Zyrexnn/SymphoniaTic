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
  <section className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10 py-16 bg-[#F6F4EE]">
    <Reveal>
      <div className="mb-12 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C93018] block mb-3">
          Keunggulan Layanan
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-[-0.02em] text-[#171614]">
          Standar Resmi Pemesanan Tiket Musik Klasik
        </h2>
      </div>
    </Reveal>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {FEATURES.map((f, i) => {
        const Icon = f.icon;
        return (
          <Reveal key={f.title} delay={i * 0.08}>
            <div className="flex flex-col p-6 rounded-xl bg-white border border-[#E4DFD3] transition-colors duration-200 hover:border-[#171614] h-full">
              <div className="w-10 h-10 rounded-lg bg-[#ECE8DF] flex items-center justify-center mb-4">
                <Icon size={20} strokeWidth={1.8} className="text-[#C93018]" aria-hidden="true" />
              </div>
              <h3 className="font-display text-xl font-semibold text-[#171614] tracking-tight mb-2">
                {f.title}
              </h3>
              <p className="text-xs sm:text-sm font-normal text-[#5C5850] leading-relaxed m-0">
                {f.desc}
              </p>
            </div>
          </Reveal>
        );
      })}
    </div>
  </section>
);
