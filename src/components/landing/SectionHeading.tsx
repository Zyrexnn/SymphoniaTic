import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  support: string;
  actionLabel: string;
  actionHref: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  support,
  actionLabel,
  actionHref,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 sm:mb-14">
      <div className="max-w-2xl">
        <p className="inline-flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-[#A1A1AA]">
          <span className="h-px w-8 bg-white/40" aria-hidden />
          {eyebrow}
        </p>
        <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight leading-[1.08] text-white">
          {title}
        </h2>
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#A1A1AA] max-w-xl">
          {support}
        </p>
      </div>
      <a
        href={actionHref}
        className="group/btn inline-flex items-center gap-2 rounded-lg bg-white text-black px-5 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition-colors shrink-0 shadow-sm"
      >
        {actionLabel}
        <ArrowUpRight
          size={16}
          className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
        />
      </a>
    </div>
  );
};

export default SectionHeading;