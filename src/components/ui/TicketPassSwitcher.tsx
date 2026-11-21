import React from 'react';
import { CheckCircle2, Users, Ticket } from 'lucide-react';
import type { TicketItem } from '@/components/landing/data';

interface TicketPassSwitcherProps {
  tickets: TicketItem[];
  activeTab: number; // -1 untuk Pass Rombongan (Master QR), >= 0 untuk indeks kursi individu
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
    <div className="rounded-xl border border-[#E4DFD3] bg-white p-3 sm:p-4 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[#171614] inline-flex items-center gap-1.5">
          <Ticket className="w-3.5 h-3.5 text-[#C93018]" aria-hidden="true" />
          <span>Pass Individual per Kursi ({tickets.length} Tiket)</span>
        </span>
        {checkedInCount > 0 && (
          <span className="text-[11px] font-medium text-[#1F6E43] bg-[#1F6E43]/10 border border-[#1F6E43]/25 px-2 py-0.5 rounded">
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
          className={`min-h-[44px] shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] ${
            activeTab === -1
              ? 'bg-[#171614] text-white border-[#171614]'
              : 'bg-[#F6F4EE] text-[#171614] border-[#CFC9BC] hover:border-[#171614]'
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
              className={`min-h-[44px] shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] ${
                isActive
                  ? 'bg-[#C93018] text-white border-[#C93018] font-semibold'
                  : 'bg-[#F6F4EE] text-[#171614] border-[#CFC9BC] hover:border-[#171614]'
              }`}
            >
              <span className="font-mono font-bold">
                {ticket.seatCode || `Tiket ${idx + 1}`}
              </span>
              <span className={`truncate max-w-[110px] ${isActive ? 'text-white/90' : 'text-[#5C5850]'}`}>
                {ticket.attendeeName}
              </span>
              {isChecked && (
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-[#1F6E43]'}`}
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
