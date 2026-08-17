import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FAQS } from './data';

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10 py-20 sm:py-24">
        <div id="faq" className="border-t border-line pt-12 sm:pt-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.03em] text-ink mb-12">
            Pertanyaan Umum
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-0">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className={`border-b border-line transition-colors duration-200 ${
                    isOpen ? 'bg-brand-light/50 -mx-4 px-4 rounded-lg' : ''
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer bg-transparent border-none group"
                  >
                    <span
                      className={`text-[15px] sm:text-base font-medium tracking-[-0.01em] transition-colors duration-200 ${
                        isOpen ? 'text-brand' : 'text-ink group-hover:text-brand'
                      }`}
                    >
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={18}
                      strokeWidth={2}
                      className={`shrink-0 transition-all duration-300 ${
                        isOpen ? 'text-brand rotate-180' : 'text-muted group-hover:text-brand'
                      }`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm sm:text-[15px] font-normal text-ink-soft leading-[1.7] pb-5">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
