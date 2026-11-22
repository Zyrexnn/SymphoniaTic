import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  support: string;
  actionLabel?: string;
  actionHref?: string;
  align?: 'left' | 'center';
  dark?: boolean;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  support,
  actionLabel,
  actionHref,
  align = 'left',
  dark = false,
}) => {
  if (align === 'center') {
    return (
      <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-14">
        <p
          className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] m-0 ${
            dark ? 'text-[#D4FF2A]' : 'text-[#141413]'
          }`}
        >
          <span aria-hidden="true">•</span>
          <span>{eyebrow}</span>
        </p>
        <h2
          className={`mt-3 font-display text-3xl sm:text-5xl font-extrabold tracking-[-0.04em] leading-[0.98] m-0 ${
            dark ? 'text-[#F4F3EF]' : 'text-[#141413]'
          }`}
        >
          {title}
        </h2>
        <p
          className={`mt-3.5 text-sm sm:text-base leading-relaxed m-0 ${
            dark ? 'text-[#B8B6AE]' : 'text-[#52514D]'
          }`}
        >
          {support}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-start mb-10 sm:mb-12">
      <div className="lg:col-span-4 pt-1">
        <p
          className={`inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] m-0 ${
            dark ? 'text-[#D4FF2A]' : 'text-[#141413]'
          }`}
        >
          <span
            className={`inline-block w-1.5 h-1.5 ${
              dark ? 'bg-[#D4FF2A]' : 'bg-[#141413]'
            }`}
            aria-hidden="true"
          />
          <span>{eyebrow}</span>
        </p>
      </div>

      <div className="lg:col-span-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h2
            className={`font-display text-3xl sm:text-5xl lg:text-[52px] font-extrabold tracking-[-0.04em] leading-[0.96] m-0 ${
              dark ? 'text-[#F4F3EF]' : 'text-[#141413]'
            }`}
          >
            {title}
          </h2>
          {support && (
            <p
              className={`mt-3.5 text-sm sm:text-base leading-relaxed max-w-xl m-0 ${
                dark ? 'text-[#B8B6AE]' : 'text-[#52514D]'
              }`}
            >
              {support}
            </p>
          )}
        </div>

        {actionLabel && actionHref && (
          <a
            href={actionHref}
            className={`group/btn min-h-[44px] inline-flex items-center gap-2 rounded-none border px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 ${
              dark
                ? 'border-white/25 bg-transparent text-[#F4F3EF] hover:bg-[#D4FF2A] hover:text-[#141413] hover:border-[#D4FF2A] focus-visible:ring-[#D4FF2A]'
                : 'border-[#141413] bg-white text-[#141413] hover:bg-[#141413] hover:text-[#D4FF2A] focus-visible:ring-[#141413]'
            }`}
          >
            <span>{actionLabel}</span>
            <ArrowUpRight
              size={15}
              className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
              aria-hidden="true"
            />
          </a>
        )}
      </div>
    </div>
  );
};

export default SectionHeading;
