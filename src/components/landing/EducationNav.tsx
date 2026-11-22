import React from 'react';
import { EDUKASI_NAV, type EdukasiSectionId } from './edukasiData';

interface EducationNavProps {
  active: EdukasiSectionId;
  onSelect: (id: EdukasiSectionId) => void;
}

export const EducationNav: React.FC<EducationNavProps> = ({ active, onSelect }) => {
  return (
    <nav
      aria-label="Bagian halaman edukasi"
      className="sticky top-[64px] z-20 border-b border-[#DFDDD6] bg-[#F4F3EF]"
    >
      <div className="mx-auto max-w-[1360px] border-x border-[#DFDDD6] px-5 sm:px-8 lg:px-10">
        <ul className="no-scrollbar flex gap-4 sm:gap-7 overflow-x-auto -mx-5 px-5 sm:mx-0 sm:px-0 list-none m-0">
          {EDUKASI_NAV.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`flex min-h-11 cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 bg-transparent text-xs font-bold uppercase tracking-wider transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
                    isActive
                      ? 'border-[#141413] text-[#141413]'
                      : 'border-transparent text-[#52514D] hover:text-[#141413]'
                  }`}
                >
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-bold tracking-wider ${
                      isActive ? 'bg-[#D4FF2A] text-[#141413]' : 'text-[#6E6D68]'
                    }`}
                  >
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
