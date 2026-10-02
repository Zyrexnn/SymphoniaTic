import React from 'react';
import { ArrowUpRight, Ticket } from 'lucide-react';

export const Hero: React.FC = () => (
  <main className="relative z-10 flex flex-col justify-end mx-auto max-w-[1400px] min-h-[100dvh] px-5 sm:px-8 md:px-10 lg:px-12 pb-[100px] md:pb-[120px]">
    <div className="max-w-4xl">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/5 border border-white/15 text-xs font-mono text-[#9a9a9a] uppercase tracking-widest mb-6">
        <span>[ MUSIM SEMI 2026 ]</span>
      </div>

      <h1 className="text-[clamp(36px,6.5vw,60px)] leading-[1.05] tracking-[-0.04em] font-light text-white m-0 max-w-4xl">
        Nikmati Harmoni Orkestra & Simfoni Terbaik.
      </h1>

      <p className="text-base sm:text-lg md:text-xl font-light text-[#9a9a9a] mt-6 max-w-2xl leading-relaxed">
        Platform resmi pemesanan tiket pertunjukan musik simfoni kelas dunia, ansambel neoklasik, dan opera pilihan.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
        <a
          href="#bento"
          style={{ color: '#171717' }}
          className="group inline-flex items-center gap-3 px-6 py-3.5 bg-white !text-[#171717] text-xs sm:text-sm font-mono font-medium tracking-wider uppercase hover:bg-neutral-200 transition-all duration-300 cursor-pointer"
        >
          <span style={{ color: '#171717' }}>Jelajahi Konser</span>
          <ArrowUpRight size={16} strokeWidth={2} style={{ color: '#171717' }} className="!text-[#171717] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
        <a
          href="/redeem"
          style={{ color: '#ffffff' }}
          className="inline-flex items-center gap-2 px-6 py-3.5 border border-white/30 text-white bg-white/5 text-xs sm:text-sm font-mono tracking-wider uppercase hover:border-white hover:bg-white/10 transition-all duration-300 cursor-pointer"
        >
          <Ticket size={16} strokeWidth={1.5} className="text-white" />
          <span>Cek Tiket Saya</span>
        </a>
      </div>
    </div>
  </main>
);