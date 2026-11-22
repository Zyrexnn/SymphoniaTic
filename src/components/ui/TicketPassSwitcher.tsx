import React from 'react';
import { CheckCircle2, Users, Ticket } from 'lucide-react';
import type { TicketItem } from '@/components/landing/data';

interface TicketPassSwitcherProps {
  tickets: TicketItem[];
  activeTab: number;
  onChangeTab: (index: number) => void;
}

export const TicketPassSwitcher: React.FC<TicketPassSwitcherProps> = ({
  tickets,
  activeTab,
  onChangeTab,
}) => {
  if (tickets.length <= 1) return null;

  const checkedInCount = tickets.filter((t) => t.status === 'CHECKED_IN').length;

  return (
    <div className="rounded-none border border-[#DFDDD6] bg-white p-3 sm:p-4 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#141413] inline-flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5 text-[#141413]" aria-hidden="true" />
          <span>Pass Individual per Kursi ({tickets.length} Tiket)</span>
        </span>
        {checkedInCount > 0 && (
          <span className="text-[11px] font-semibold text-[#156E3F] bg-[#156E3F]/10 border border-[#156E3F]/30 px-2 py-0.5 rounded-none">
            {checkedInCount}/{tickets.length} Sudah Masuk Gate
          </span>
        )}
      </div>

      <div
        role="tablist"
        aria-label="Pilih pass tiket per kursi"
        className="flex items-center gap-2 overflow-x-auto pb-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === -1}
          onClick={() => onChangeTab(-1)}
          className={`min-h-[44px] shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-none text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
            activeTab === -1
              ? 'bg-[#141413] text-[#D4FF2A] border-[#141413]'
              : 'bg-[#F4F3EF] text-[#141413] border-[#DFDDD6] hover:border-[#141413]'
          }`}
        >
          <Users className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Semua ({tickets.length} Kursi)</span>
        </button>

        {tickets.map((ticket, idx) => {
          const isActive = activeTab === idx;
          const isChecked = ticket.status === 'CHECKED_IN';
          return (
            <button
              key={`${ticket.seatCode || idx}-${idx}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChangeTab(idx)}
              className={`min-h-[44px] shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-none text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
                isActive
                  ? 'bg-[#D4FF2A] text-[#141413] border-[#141413] font-semibold'
                  : 'bg-[#F4F3EF] text-[#141413] border-[#DFDDD6] hover:border-[#141413]'
              }`}
            >
              <span className="font-mono font-bold">
                {ticket.seatCode || `Tiket ${idx + 1}`}
              </span>
              <span className={`truncate max-w-[110px] ${isActive ? 'text-[#141413]/85' : 'text-[#52514D]'}`}>
                {ticket.attendeeName}
              </span>
              {isChecked && (
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#141413]' : 'text-[#156E3F]'}`}
                  aria-label="Sudah check-in"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
