import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  support: string;
  actionLabel?: string;
  actionHref?: string;
  align?: 'left' | 'center';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  support,
  actionLabel,
  actionHref,
  align = 'left',
}) => {
  if (align === 'center') {
    return (
      <div className="mx-auto max-w-2xl text-center mb-10 sm:mb-14">
        <p className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#C93018] m-0">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-[-0.02em] leading-[1.08] text-[#171614] m-0">
          {title}
        </h2>
        <p className="mt-3.5 text-sm sm:text-base leading-relaxed text-[#5C5850] m-0">
          {support}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-14">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#C93018] m-0">
          <span className="h-px w-8 bg-[#C93018]" aria-hidden="true" />
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl lg:text-[46px] font-semibold tracking-[-0.02em] leading-[1.08] text-[#171614] m-0">
          {title}
        </h2>
        <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#5C5850] max-w-xl m-0">
          {support}
        </p>
      </div>
      {actionLabel && actionHref && (
        <a
          href={actionHref}
          className="group/btn min-h-[44px] inline-flex items-center gap-2 rounded-lg border border-[#CFC9BC] bg-white text-[#171614] px-5 py-2.5 text-sm font-semibold hover:border-[#171614] hover:bg-[#ECE8DF]/50 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
        >
          <span>{actionLabel}</span>
          <ArrowUpRight
            size={16}
            className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
            aria-hidden="true"
          />
        </a>
      )}
    </div>
  );
};

export default SectionHeading;
