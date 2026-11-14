import React from 'react';
import { EDUKASI_NAV, type EdukasiSectionId } from './edukasiData';

interface EducationNavProps {
  active: EdukasiSectionId;
  onSelect: (id: EdukasiSectionId) => void;
}

export const EducationNav: React.FC<EducationNavProps> = ({ active, onSelect }) => {
  return (
    <nav aria-label="Bagian halaman edukasi" className="sticky top-[61px] z-20 border-b border-[#272A38] bg-[#0C0D12]/95 backdrop-blur-md">
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
                  className={`flex min-h-11 cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 bg-transparent text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D12] ${
                    isActive
                      ? 'border-white font-semibold text-white'
                      : 'border-transparent font-normal text-[#A1A1AA] hover:text-white'
                  }`}
                >
                  <span className="text-[10px] font-mono font-semibold tracking-wider text-[#71717A]">
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
