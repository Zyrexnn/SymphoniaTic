import React, { useState } from 'react';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';
import { Reveal } from './Reveal';

export const CTASection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 3000);
  };

  return (
    <section className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 py-16">
      <Reveal>
        <div className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-dark px-8 sm:px-12 lg:px-16 py-12 lg:py-16 rounded-3xl">
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
              {subscribed ? (
                <div className="flex items-center gap-3 text-white">
                  <CheckCircle size={20} strokeWidth={2} className="shrink-0" />
                  <span className="text-sm font-medium">Terima kasih! Email Anda telah terdaftar.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Mail size={15} strokeWidth={2} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anda@email.com"
                      required
                      className="w-full bg-white border border-transparent focus:border-white pl-10 pr-4 py-3.5 text-sm text-ink placeholder:text-ink/40 outline-none rounded-xl transition-all duration-200"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-ink text-white text-[13px] font-semibold tracking-wide rounded-xl hover:bg-ink/90 active:scale-[0.98] transition-all duration-200 shrink-0 cursor-pointer"
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
