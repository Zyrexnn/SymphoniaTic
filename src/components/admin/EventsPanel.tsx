import React from 'react';
import { Plus, Edit, Trash2, MapPin, Calendar, Clock, User, Ticket } from 'lucide-react';
import type { EventItem, TicketCategory } from '../landing/data';
import { formatIDR } from '../landing/data';

interface EventsPanelProps {
  events: EventItem[];
  isLoading?: boolean;
  onAddEvent: () => void;
  onEditEvent: (event: EventItem) => void;
  onDeleteEvent: (id: string, title: string) => void;
  onToggleCloseEvent?: (id: string) => void;
  onAddCategory: (event: EventItem) => void;
  onEditCategory: (eventId: string, cat: TicketCategory) => void;
  onDeleteCategory: (catId: string, name: string) => void;
}

export const EventsPanel: React.FC<EventsPanelProps> = ({
  events, isLoading, onAddEvent, onEditEvent, onDeleteEvent, onToggleCloseEvent,
  onAddCategory, onEditCategory, onDeleteCategory,
}) => (
  <div className="flex flex-col gap-6 pb-8">
    <div className="border border-[#272A38] bg-[#14161F] p-5 sm:p-6 rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h2 className="text-base font-semibold text-[#F4F4F6] tracking-tight m-0">Postingan Konser &amp; Kategori Tiket</h2>
        <p className="text-xs font-normal text-[#A1A1AA] mt-1 m-0">
          Kelola data konser, jam open gate, penutupan order tiket, lokasi venue, serta kuota tempat duduk.
        </p>
      </div>
      <button
        type="button"
        onClick={onAddEvent}
        className="min-h-[44px] px-4 py-2.5 text-sm font-semibold text-[#0C0D12] bg-white hover:bg-neutral-200 rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0"
      >
        <Plus size={16} strokeWidth={2} aria-hidden="true" />
        <span>Tambah Konser Baru</span>
      </button>
    </div>

    {isLoading && events.length === 0 ? (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="border border-[#272A38] bg-[#14161F] rounded-xl p-6 space-y-4 animate-pulse">
            <div className="h-24 bg-[#1D202D] rounded-lg" />
            <div className="h-16 bg-[#1D202D] rounded-lg" />
            <div className="h-24 bg-[#1D202D] rounded-lg" />
          </div>
        ))}
      </div>
    ) : events.length === 0 ? (
      <div className="border border-dashed border-[#3E4357] bg-[#14161F] rounded-xl p-10 text-center flex flex-col items-center">
        <Ticket className="w-10 h-10 text-[#94A3B8] mb-3" strokeWidth={1.5} aria-hidden="true" />
        <h3 className="text-base font-semibold text-white m-0">Belum Ada Konser Terdaftar</h3>
        <p className="text-sm text-[#A1A1AA] mt-1.5 mb-5 max-w-md">
          Tambahkan jadwal konser pertama Anda untuk mulai membuka pemesanan tiket dan kategori kursi.
        </p>
        <button
          type="button"
          onClick={onAddEvent}
          className="min-h-[44px] px-5 py-2.5 text-sm font-semibold text-[#0C0D12] bg-white hover:bg-neutral-200 rounded-lg inline-flex items-center gap-2"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Tambah Konser Pertama</span>
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((evt) => (
          <EventCard
            key={evt.id}
            event={evt}
            onEdit={() => onEditEvent(evt)}
            onDelete={() => onDeleteEvent(String(evt.id), evt.title)}
            onToggleClose={() => onToggleCloseEvent && onToggleCloseEvent(String(evt.id))}
            onAddCategory={() => onAddCategory(evt)}
            onEditCategory={(cat) => onEditCategory(String(evt.id), cat)}
            onDeleteCategory={(catId, name) => onDeleteCategory(catId, name)}
          />
        ))}
      </div>
    )}
  </div>
);

interface EventCardProps {
  event: EventItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleClose: () => void;
  onAddCategory: () => void;
  onEditCategory: (cat: TicketCategory) => void;
  onDeleteCategory: (catId: string, name: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event: evt, onEdit, onDelete, onToggleClose, onAddCategory, onEditCategory, onDeleteCategory,
}) => (
  <article className="border border-[#272A38] bg-[#14161F] rounded-xl p-5 sm:p-6 flex flex-col justify-between gap-5 hover:border-white/30 transition-colors">
    <div>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:w-28 h-44 sm:h-28 shrink-0 overflow-hidden rounded-lg border border-[#272A38] bg-[#0C0D12]">
          <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono tracking-wider text-white uppercase border border-white/25 bg-white/10 px-2.5 py-0.5 rounded">
                {evt.category || 'SIMFONI'}
              </span>
              {evt.isClosed && (
                <span className="text-[11px] font-mono text-rose-300 bg-rose-500/15 border border-rose-500/35 px-2 py-0.5 rounded">
                  ORDER CLOSED
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleClose}
                className={`min-h-[40px] px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  evt.isClosed
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/35 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/35 hover:bg-rose-500/20'
                }`}
              >
                {evt.isClosed ? 'Buka Order' : 'Tutup Order'}
              </button>
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Edit event ${evt.title}`}
                className="h-10 w-10 inline-flex items-center justify-center bg-[#0C0D12] border border-[#3E4357] rounded-lg text-[#E4E4E7] hover:text-white hover:border-white transition-colors"
              >
                <Edit size={15} strokeWidth={1.7} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onDelete}
                aria-label={`Hapus event ${evt.title}`}
                className="h-10 w-10 inline-flex items-center justify-center bg-[#0C0D12] border border-rose-500/35 rounded-lg text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 transition-colors"
              >
                <Trash2 size={15} strokeWidth={1.7} aria-hidden="true" />
              </button>
            </div>
          </div>
          <h3 className="text-base font-semibold text-white tracking-tight leading-snug m-0">{evt.title}</h3>
          <p className="text-xs font-normal text-[#A1A1AA] mt-1 mb-0 truncate">{evt.artist}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
        <DetailBox icon={MapPin} label="Venue" value={evt.venue} />
        <DetailBox icon={Calendar} label="Jadwal" value={`${evt.date} (${evt.time})`} />
        {evt.conductor && <DetailBox icon={User} label="Konduktor" value={evt.conductor} />}
        {evt.openGate && <DetailBox icon={Clock} label="Open Gate" value={evt.openGate} />}
      </div>

      <div className="border-t border-[#272A38] mt-5 pt-4">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <span className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Kategori Tiket &amp; Kuota</span>
          <button
            type="button"
            onClick={onAddCategory}
            className="min-h-[40px] text-xs font-medium text-white bg-[#0C0D12] hover:bg-[#1D202D] border border-[#3E4357] hover:border-white/60 rounded-lg px-3 py-1.5 flex items-center gap-1.5 transition-colors"
          >
            <Plus size={14} strokeWidth={1.8} aria-hidden="true" />
            <span>Kategori Baru</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {evt.categories && evt.categories.length > 0 ? (
            evt.categories.map((cat) => (
              <div key={cat.id} className="border border-[#272A38] bg-[#0C0D12] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">{cat.name}</span>
                    {(cat.remainingQuota !== undefined ? cat.remainingQuota : cat.quota) < 10 && (
                      <span className="text-[11px] font-mono text-rose-300 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded">
                        Kuota Menipis
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-normal text-[#A1A1AA] block mt-0.5">
                    Sisa {cat.remainingQuota !== undefined ? cat.remainingQuota : cat.quota} dari {cat.quota} kursi
                  </span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-xs font-mono text-white font-semibold">{formatIDR(cat.price)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEditCategory(cat)}
                      aria-label={`Edit kategori ${cat.name}`}
                      className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-[#3E4357] bg-[#14161F] text-[#E4E4E7] hover:text-white hover:border-white transition-colors"
                    >
                      <Edit size={14} strokeWidth={1.7} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(cat.id, cat.name)}
                      aria-label={`Hapus kategori ${cat.name}`}
                      className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-rose-500/35 bg-[#14161F] text-rose-300 hover:bg-rose-500/15 transition-colors"
                    >
                      <Trash2 size={14} strokeWidth={1.7} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs font-normal text-[#A1A1AA] py-2">Belum ada kategori tiket disetel</div>
          )}
        </div>
      </div>
    </div>
  </article>
);

const DetailBox: React.FC<{ icon: any; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="border border-[#272A38] bg-[#0C0D12] rounded-lg p-3 flex items-start gap-2.5">
    <Icon size={14} className="text-[#E4E4E7] mt-0.5 shrink-0" strokeWidth={1.7} aria-hidden="true" />
    <div className="min-w-0">
      <span className="text-[11px] font-medium text-[#94A3B8] tracking-wider uppercase block">{label}</span>
      <span className="text-xs font-medium text-white block truncate mt-0.5">{value}</span>
    </div>
  </div>
);
