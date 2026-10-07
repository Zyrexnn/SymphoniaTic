import React from 'react';
import { EDUKASI_NAV, type EdukasiSectionId } from './edukasiData';

interface EducationNavProps {
  active: EdukasiSectionId;
  onSelect: (id: EdukasiSectionId) => void;
}

export const EducationNav: React.FC<EducationNavProps> = ({ active, onSelect }) => {
  return (
    <nav aria-label="Bagian halaman edukasi" className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-8 md:px-10">
        <ul className="no-scrollbar flex gap-8 overflow-x-auto">
          {EDUKASI_NAV.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`flex min-h-11 cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 bg-transparent text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2 ${
                    isActive
                      ? 'border-brand-accent font-semibold text-[#183B56]'
                      : 'border-transparent font-normal text-[#64748B] hover:text-[#183B56]'
                  }`}
                >
                  <span className="text-[10px] font-semibold tracking-[0.14em] text-ink-soft">
                    {item.number}
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
