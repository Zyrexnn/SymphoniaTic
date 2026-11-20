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
      className="sticky top-[62px] sm:top-[68px] z-20 border-b border-[#E4DFD3] bg-[#F6F4EE]/95 backdrop-blur-md"
    >
      <div className="mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
        <ul className="no-scrollbar flex gap-5 sm:gap-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 list-none m-0">
          {EDUKASI_NAV.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`flex min-h-11 cursor-pointer items-center gap-2 whitespace-nowrap border-b-2 bg-transparent text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F4EE] ${
                    isActive
                      ? 'border-[#C93018] font-semibold text-[#171614]'
                      : 'border-transparent font-normal text-[#5C5850] hover:text-[#171614]'
                  }`}
                >
                  <span className={`text-[10px] font-mono font-semibold tracking-wider ${isActive ? 'text-[#C93018]' : 'text-[#6B665D]'}`}>
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
