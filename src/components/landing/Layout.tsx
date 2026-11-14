import React from 'react';
import { ArrowUpRight, Ticket } from 'lucide-react';

export const Hero: React.FC = () => (
  <main className="relative z-10 flex flex-col justify-end mx-auto max-w-[1400px] min-h-[100dvh] px-5 sm:px-8 md:px-10 lg:px-12 pb-[100px] md:pb-[120px]">
    <div className="max-w-4xl">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/15 text-xs font-mono text-[#94A3B8] uppercase tracking-widest mb-6">
        <span>[ MUSIM KONSER 2026 ]</span>
      </div>

      <h1 className="text-[clamp(36px,6.5vw,60px)] leading-[1.08] tracking-[-0.03em] font-medium text-[#F4F4F6] m-0 max-w-4xl">
        Nikmati Harmoni Orkestra dan Simfoni Pilihan
      </h1>

      <p className="text-base sm:text-lg md:text-xl font-normal text-[#94A3B8] mt-6 max-w-2xl leading-relaxed">
        Platform resmi pemesanan tiket pertunjukan musik simfoni kelas dunia, ansambel neoklasik, dan opera pilihan.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
        <a
          href="/events"
          className="group inline-flex items-center gap-2.5 px-6 py-3.5 bg-white text-[#0C0D12] font-semibold rounded-lg text-xs sm:text-sm tracking-wider uppercase hover:bg-neutral-200 transition-colors cursor-pointer shadow-sm"
        >
          <span>Jelajahi Konser</span>
          <ArrowUpRight size={16} strokeWidth={2.2} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
        <a
          href="/redeem"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/5 border border-white/20 text-[#F4F4F6] rounded-lg text-xs sm:text-sm tracking-wider uppercase hover:bg-white/10 hover:border-white/40 transition-colors cursor-pointer"
        >
          <Ticket size={16} strokeWidth={1.8} className="text-white" />
          <span>Cek E-Ticket</span>
        </a>
      </div>
    </div>
  </main>
);
