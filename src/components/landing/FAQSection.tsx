import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { FAQS } from './data';

export default function FAQSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-[1400px] px-10 pb-20">
      <div id="faq" className="border-t border-white/[0.06] pt-12">
        <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] mb-8 uppercase">Pertanyaan Umum (FAQ)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
          {FAQS.map((faq, i) => (
            <div key={i} className="border-b border-white/[0.06] pb-4">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-2 text-left cursor-pointer hover:opacity-60 transition-opacity bg-transparent border-none"
              >
                <span className="text-lg font-light tracking-[-0.05px] text-white">{faq.q}</span>
                <ChevronDown
                  size={16}
                  className="text-[#9a9a9a] shrink-0 transition-transform duration-200"
                  style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none' }}
                />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="text-base font-light tracking-[-0.05px] text-[#9a9a9a] leading-[1.6] pt-2 pb-3">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
