import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQS } from './data';

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="bg-[#0C0D12]">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 py-16 sm:py-24">
        <div id="faq" className="border-t border-[#272A38] pt-12 sm:pt-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-white mb-10">
            Pertanyaan Umum
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-0">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`border-b border-[#272A38] transition-colors duration-200 ${
                    isOpen ? 'bg-[#14161F] px-4 rounded-lg' : ''
                  }`}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full min-h-[56px] flex items-center justify-between gap-4 py-4 text-left bg-transparent border-none group"
                  >
                    <span className="text-[15px] sm:text-base font-medium tracking-[-0.01em] text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      strokeWidth={2}
                      aria-hidden="true"
                      className={`shrink-0 transition-transform duration-200 ${
                        isOpen ? 'text-white rotate-180' : 'text-[#A1A1AA] group-hover:text-white'
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pb-5">
                      <p className="text-sm sm:text-[15px] font-normal text-[#A1A1AA] leading-[1.7] m-0">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
