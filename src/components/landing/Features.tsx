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
  <section className="mx-auto max-w-[1280px] px-4 sm:px-8 md:px-10 py-16">
    <Reveal>
      <div className="mb-12 max-w-2xl">
        <span className="text-[11px] font-semibold tracking-[0.2em] text-brand-accent uppercase block mb-3">
          Mengapa SymphoniaTic
        </span>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.03em] text-[#183B56]">
          Pengalaman konser yang dirancang untuk keindahan suara.
        </h2>
      </div>
    </Reveal>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {FEATURES.map((f, i) => {
        const Icon = f.icon;
        return (
          <Reveal key={f.title} delay={i * 0.08}>
            <div className="flex flex-col p-6 rounded-none bg-white border border-line transition-all duration-300 hover:border-[#CBD5E1] hover:shadow-[0_20px_40px_-24px_rgba(24,59,86,0.25)]">
              <div className="w-10 h-10 rounded-none flex items-center justify-center mb-4">
                <Icon size={20} strokeWidth={2} className="text-brand-accent" />
              </div>
              <h3 className="text-base font-semibold text-[#183B56] tracking-tight mb-2.5">
                {f.title}
              </h3>
              <p className="text-[13px] font-normal text-[#64748B] leading-relaxed">
                {f.desc}
              </p>
            </div>
          </Reveal>
        );
      })}
    </div>
  </section>
);