import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  support: string;
  actionLabel: string;
  actionHref: string;
}

/* ─── Reusable editorial section header ─── */
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
        <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.22em] text-brand-accent">
          <span className="h-px w-9 bg-brand-accent" aria-hidden />
          {eyebrow}
        </p>
        <h2 className="mt-4 text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-[-0.03em] leading-[1.08] text-ink">
          {title}
        </h2>
        <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#64748B] max-w-xl">
          {support}
        </p>
      </div>
      <a
        href={actionHref}
        className="group/btn inline-flex items-center gap-2 rounded-full bg-[#183B56] text-white px-5 py-2.5 text-sm font-semibold hover:bg-brand-accent transition-colors shrink-0"
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