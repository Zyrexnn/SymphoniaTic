import React from 'react';
import { ArrowUpRight, Ticket } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQS } from './data';

export default function FAQSection() {
  return (
    <>
      <section className="bg-[#F4F3EF] border-b border-[#DFDDD6]">
        <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10 py-14 sm:py-20">
          <div id="faq" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-4">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#141413] m-0">
                <span className="inline-block w-1.5 h-1.5 bg-[#141413]" aria-hidden="true" />
                <span>Informasi Penonton</span>
              </p>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-extrabold tracking-[-0.04em] leading-[0.98] text-[#141413] m-0">
                Pertanyaan Umum
              </h2>
              <p className="mt-3 text-sm text-[#52514D] leading-relaxed m-0">
                Panduan ringkas mengenai E-Ticket, batas pemesanan kursi, dan tata tertib menghadiri konser klasik.
              </p>
            </div>

            <div className="lg:col-span-8">
              <Accordion
                type="single"
                collapsible
                defaultValue="faq-0"
                className="border-t border-[#DFDDD6]"
              >
                {FAQS.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="border-b border-[#DFDDD6] px-3 data-[state=open]:bg-white data-[state=open]:px-5 transition-colors"
                  >
                    <AccordionTrigger className="min-h-[56px] py-4 text-left text-[15px] sm:text-base font-bold tracking-tight text-[#141413] hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm sm:text-[15px] text-[#52514D] leading-[1.7]">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#141413] text-[#F4F3EF]">
        <img
          src="/poster_2.jpg"
          alt="Pertunjukan orkestra klasik di gedung konser"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.35]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(20,20,19,0.55) 0%, rgba(20,20,19,0.88) 100%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1360px] border-x border-white/15 px-5 sm:px-8 lg:px-10 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-end">
            <div className="lg:col-span-4">
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#D4FF2A] m-0">
                <span className="inline-block w-1.5 h-1.5 bg-[#D4FF2A]" aria-hidden="true" />
                <span>Reservasi Resmi</span>
              </p>
            </div>

            <div className="lg:col-span-8">
              <h2 className="font-display text-3xl sm:text-5xl font-extrabold leading-[0.96] tracking-[-0.04em] text-[#F4F3EF] m-0">
                Dapatkan Tiket Konser Anda Sekarang
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#D8D6CE] max-w-xl leading-relaxed m-0">
                Pilih kategori kursi terbaik di gedung konser pilihan dan terima E-Ticket dengan Kode QR resmi langsung setelah pemesanan.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="/events"
                  className="min-h-[48px] inline-flex items-center gap-2 rounded-none bg-[#D4FF2A] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#141413] hover:bg-[#C2EE1A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A]"
                >
                  <span>Beli Tiket Sekarang</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>
                <a
                  href="/redeem"
                  className="min-h-[48px] inline-flex items-center gap-2 rounded-none border border-white/35 bg-[#141413]/75 px-6 py-3 text-xs font-semibold uppercase tracking-wider text-[#F4F3EF] hover:border-[#D4FF2A] hover:text-[#D4FF2A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A]"
                >
                  <Ticket size={16} aria-hidden="true" />
                  <span>Cek E-Ticket</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
