import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Reveal } from './Reveal';

export const CTASection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState<'success' | 'idle' | 'submitting'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed('submitting');
    setTimeout(() => {
      setSubscribed('success');
    }, 0);
  };

  return (
    <section className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-16 bg-[#F4F3EF]">
      <Reveal>
        <div className="relative overflow-hidden rounded-none border border-[#141413] bg-[#141413] text-[#F4F3EF] px-6 sm:px-10 lg:px-14 py-12 lg:py-16">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="max-w-xl">
              <span className="text-[11px] font-bold tracking-[0.16em] text-[#D4FF2A] uppercase block mb-3">
                • Jangan Lewati
              </span>
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[-0.04em] text-[#F4F3EF] leading-[1.02]">
                Dapatkan notifikasi konser terbaru lebih dulu.
              </h2>
              <p className="text-sm font-normal text-[#B8B6AE] mt-3 leading-relaxed">
                Daftarkan email Anda dan dapatkan akses pre-sale serta jadwal simfoni eksklusif langsung di inbox.
              </p>
            </div>

            <div className="w-full lg:w-[420px] shrink-0">
              {subscribed === 'success' ? (
                <div className="flex items-center gap-3 text-[#D4FF2A] border border-[#D4FF2A]/40 bg-[#1C1C1A] p-4">
                  <CheckCircle size={20} strokeWidth={2} className="shrink-0" aria-hidden="true" />
                  <span className="text-sm font-semibold">Terima kasih! Email Anda telah terdaftar.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Mail size={15} strokeWidth={2} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B8B6AE]" aria-hidden="true" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anda@email.com"
                      required
                      className="min-h-[46px] w-full bg-[#1C1C1A] border border-white/25 pl-10 pr-3.5 py-2.5 focus-visible:border-[#D4FF2A] placeholder:text-[#B8B6AE] text-sm text-[#F4F3EF] outline-none rounded-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D4FF2A] text-[#141413] text-xs font-bold uppercase tracking-wider rounded-none hover:bg-[#C2EE1A] transition-colors shrink-0 cursor-pointer"
                  >
                    <span>Daftar</span>
                    <ArrowRight size={14} strokeWidth={2.5} aria-hidden="true" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};
