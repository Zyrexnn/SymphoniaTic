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
    <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 py-16 bg-[--color-canvas] rounded-2xl">
      <Reveal>
        <div className="relative overflow-hidden px-8 sm:px-12 lg:px-16 py-12 lg:py-16">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-40%] right-[-10%] w-[50%] h-[120%] rounded-full bg-white/10 blur-[100px]" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="max-w-xl">
              <span className="text-[11px] font-semibold tracking-[0.2em] text-white/70 uppercase block mb-3">
                Jangan Lewati
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.03em] text-white leading-[1.15]">
                Dapatkan notifikasi konser terbaru lebih dulu.
              </h2>
              <p className="text-[13px] font-normal text-white/80 mt-3 leading-relaxed">
                Daftarkan email Anda dan dapatkan akses pre-sale serta jadwal simfoni eksklusif langsung di inbox.
              </p>
            </div>

            <div className="w-full lg:w-[400px] shrink-0">
              {subscribed === 'success' ? (
                <div className="flex items-center gap-3 text-white">
                  <CheckCircle size={20} strokeWidth={2} className="shrink-0" />
                  <span className="text-sm font-medium">Terima kasih! Email Anda telah terdaftar.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail size={15} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anda@email.com"
                      required
                      className="w-full bg-white/5 border border-white/10 focus-visible:border-white focus-visible:ring-2 focus-visible:ring-white/20 placeholder:text-white/40 text-sm text-ink outline-none rounded-xl transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-brand text-white text-[13px] font-semibold tracking-wide rounded-xl hover:bg-brand/90 active:scale-[0.98] transition-all duration-200 shrink-0 cursor-pointer"
                  >
                    Daftar
                    <ArrowRight size={14} strokeWidth={2.5} />
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
