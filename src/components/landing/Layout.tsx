import React from 'react';
import { ArrowUpRight, Ticket } from 'lucide-react';

export const Hero: React.FC = () => (
  <main className="relative z-10 flex flex-col justify-end mx-auto max-w-[1400px] min-h-[82dvh] sm:min-h-[88dvh] px-5 sm:px-8 md:px-10 lg:px-12 pt-28 sm:pt-32 pb-16 sm:pb-24">
    <div className="max-w-4xl">
      <h1 className="text-[clamp(34px,6vw,60px)] leading-[1.08] tracking-[-0.03em] font-semibold text-white m-0 max-w-4xl">
        Nikmati Harmoni Orkestra dan Simfoni Pilihan
      </h1>

      <p className="text-base sm:text-lg md:text-xl font-normal text-[#D4D4D8] mt-5 max-w-2xl leading-relaxed">
        Platform resmi pemesanan tiket pertunjukan musik simfoni, ansambel kamar, resital piano, dan opera musim 2026.
      </p>

      <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3.5 sm:gap-5">
        <a
          href="/events"
          className="group min-h-[48px] inline-flex items-center gap-2.5 px-6 py-3 bg-white text-[#0C0D12] font-semibold rounded-lg text-sm tracking-wide hover:bg-neutral-200 transition-colors"
        >
          <span>Jelajahi Konser</span>
          <ArrowUpRight size={17} strokeWidth={2.2} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" aria-hidden="true" />
        </a>
        <a
          href="/redeem"
          className="min-h-[48px] inline-flex items-center gap-2 px-6 py-3 bg-[#14161F] border border-[#3E4357] text-white rounded-lg text-sm font-medium tracking-wide hover:border-white/60 hover:bg-[#1D202D] transition-colors"
        >
          <Ticket size={17} strokeWidth={1.8} className="text-white" aria-hidden="true" />
          <span>Cek E-Ticket</span>
        </a>
      </div>
    </div>
  </main>
);
