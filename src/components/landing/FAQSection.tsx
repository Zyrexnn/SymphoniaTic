import React from 'react';
import { ArrowUpRight, Ticket } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { FAQS } from './data';

export default function FAQSection() {
  return (
    <>
      <section className="bg-[#F6F4EE]">
        <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10 py-14 sm:py-20">
          <div id="faq" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
            <div className="lg:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C93018] m-0">
                Informasi Penonton
              </p>
              <h2 className="mt-2.5 font-display text-3xl sm:text-4xl font-semibold tracking-[-0.02em] leading-[1.1] text-[#171614] m-0">
                Pertanyaan Umum
              </h2>
              <p className="mt-3 text-sm text-[#5C5850] leading-relaxed m-0">
                Panduan ringkas mengenai E-Ticket, batas pemesanan kursi, dan tata tertib menghadiri konser klasik.
              </p>
            </div>

            <div className="lg:col-span-8">
              <Accordion
                type="single"
                collapsible
                defaultValue="faq-0"
                className="border-t border-[#E4DFD3]"
              >
                {FAQS.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="border-b border-[#E4DFD3] px-2 data-[state=open]:bg-white data-[state=open]:px-5 data-[state=open]:rounded-lg transition-colors"
                  >
                    <AccordionTrigger className="min-h-[56px] py-4 text-left text-[15px] sm:text-base font-semibold tracking-[-0.01em] text-[#171614] hover:no-underline hover:text-[#C93018]">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-sm sm:text-[15px] text-[#5C5850] leading-[1.7]">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#11100E] text-white">
        <img
          src="/poster_2.jpg"
          alt="Pertunjukan orkestra klasik di gedung konser"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.38]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(17,16,14,0.55) 0%, rgba(17,16,14,0.84) 100%)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-[960px] px-5 sm:px-8 py-16 sm:py-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#E7E2D8] m-0">
            Reservasi Resmi
          </p>
          <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold leading-[1.1] tracking-[-0.02em] text-white m-0">
            Dapatkan Tiket Konser Anda Sekarang
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#D8D3C8] max-w-xl mx-auto leading-relaxed">
            Pilih kategori kursi terbaik di gedung konser pilihan dan terima E-Ticket dengan Kode QR resmi langsung setelah pemesanan.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Button asChild size="lg">
              <a href="/events">
                <span>Beli Tiket Sekarang</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </Button>
            <a
              href="/redeem"
              className="min-h-[48px] inline-flex items-center gap-2 rounded-lg border border-white/35 bg-[#11100E]/60 px-6 py-3 text-sm font-medium text-white hover:bg-white hover:text-[#171614] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <Ticket size={16} aria-hidden="true" />
              <span>Cek E-Ticket</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
