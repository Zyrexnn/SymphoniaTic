import React from 'react';
import { Plus, Edit, Trash2, MapPin, Calendar, Clock, User } from 'lucide-react';
import type { EventItem, TicketCategory } from '../landing/data';
import { formatIDR } from '../landing/data';
import { ProgressBar } from './ui';

interface EventsPanelProps {
  events: EventItem[];
  onAddEvent: () => void;
  onEditEvent: (event: EventItem) => void;
  onDeleteEvent: (id: string, title: string) => void;
  onToggleCloseEvent?: (id: string) => void;
  onAddCategory: (event: EventItem) => void;
  onEditCategory: (eventId: string, cat: TicketCategory) => void;
  onDeleteCategory: (catId: string, name: string) => void;
}

export const EventsPanel: React.FC<EventsPanelProps> = ({
  events, onAddEvent, onEditEvent, onDeleteEvent, onToggleCloseEvent,
  onAddCategory, onEditCategory, onDeleteCategory,
}) => (
  <div className="flex flex-col gap-6 pb-12">
    <div className="border border-[#272A38] bg-[#14161F] p-5 sm:p-6 rounded-xl flex justify-between items-center gap-4 flex-wrap shadow-xl">
      <div>
        <h3 className="text-base font-semibold text-[#F4F4F6] tracking-tight m-0">Postingan Konser & Kategori Tiket</h3>
        <p className="text-xs font-normal text-[#94A3B8] mt-1 m-0">
          Kelola data event, jam open gate, penutupan order tiket, lokasi venue, serta kuota tempat duduk
        </p>
      </div>
      <button
        onClick={onAddEvent}
        className="px-4 py-2.5 text-[13px] font-semibold text-[#0C0D12] bg-white hover:bg-neutral-200 rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-md active:scale-95"
      >
        <Plus size={15} strokeWidth={2} />
        <span>Tambah Konser Baru</span>
      </button>
    </div>

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
  <div className="border border-[#272A38] bg-[#14161F] rounded-xl p-5 sm:p-6 flex flex-col justify-between gap-5 hover:border-white/30 transition-all shadow-xl">
    <div>
      <div className="flex gap-4">
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden rounded-lg border border-[#272A38] bg-[#0C0D12]">
          <img src={evt.image} alt={evt.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-widest text-white uppercase border border-white/20 bg-white/10 px-2 py-0.5 rounded">
                {evt.category || 'SIMFONI'}
              </span>
              {evt.isClosed && (
                <span className="text-[9px] font-mono text-rose-300 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded">
                  [ORDER CLOSED]
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={onToggleClose}
                title={evt.isClosed ? 'Buka Kembali Penjualan Tiket' : 'Tutup Penjualan Tiket'}
                className={`px-2 py-1 text-[10px] font-mono rounded border cursor-pointer transition-all ${
                  evt.isClosed
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                }`}
              >
                {evt.isClosed ? 'Buka Order' : 'Tutup Order'}
              </button>
              <button
                onClick={onEdit}
                title="Edit Event"
                className="p-1.5 bg-[#0C0D12] border border-[#272A38] rounded text-[#A1A1AA] hover:text-white hover:border-white/40 cursor-pointer transition-all"
              >
                <Edit size={14} strokeWidth={1.5} />
              </button>
              <button
                onClick={onDelete}
                title="Hapus Event"
                className="p-1.5 bg-[#0C0D12] border border-[#272A38] rounded text-rose-400 hover:text-rose-300 hover:border-rose-500/30 cursor-pointer transition-all"
              >
                <Trash2 size={14} strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <h4 className="text-base font-semibold text-white tracking-tight leading-snug truncate m-0">{evt.title}</h4>
          <p className="text-xs font-normal text-[#A1A1AA] mt-1 mb-0 truncate">{evt.artist}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <DetailBox icon={MapPin} label="Venue" value={evt.venue} />
        <DetailBox icon={Calendar} label="Jadwal" value={`${evt.date} (${evt.time})`} />
        {evt.conductor && <DetailBox icon={User} label="Konduktor" value={evt.conductor} />}
        {evt.openGate && <DetailBox icon={Clock} label="Open Gate" value={evt.openGate} />}
      </div>

      <div className="border-t border-[#272A38] mt-5 pt-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">Kategori Tiket & Sisa Kuota</span>
          <button
            onClick={onAddCategory}
            className="text-xs font-medium text-white bg-[#0C0D12] hover:bg-[#1D202D] border border-[#272A38] hover:border-white/40 rounded px-2.5 py-1 cursor-pointer flex items-center gap-1 transition-all"
          >
            <Plus size={12} strokeWidth={1.5} />
            <span>Kategori Baru</span>
          </button>
        </div>

        <div className="space-y-2">
          {evt.categories && evt.categories.length > 0 ? (
            evt.categories.map((cat) => (
              <div key={cat.id} className="border border-[#272A38] bg-[#0C0D12] rounded-lg p-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-white truncate">{cat.name}</span>
                    {(cat.remainingQuota !== undefined ? cat.remainingQuota : cat.quota) < 10 && (
                      <span className="text-[9px] font-mono text-rose-300 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                        Kuota Menipis
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-normal text-[#A1A1AA] block mt-0.5">
                    Sisa: {cat.remainingQuota !== undefined ? cat.remainingQuota : cat.quota} / Total: {cat.quota} tempat duduk
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-mono text-white font-semibold">{formatIDR(cat.price)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditCategory(cat)}
                      title="Edit Kategori"
                      className="p-1 bg-transparent border-none text-[#A1A1AA] hover:text-white cursor-pointer"
                    >
                      <Edit size={13} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => onDeleteCategory(cat.id, cat.name)}
                      title="Hapus Kategori"
                      className="p-1 bg-transparent border-none text-rose-400 hover:text-rose-300 cursor-pointer"
                    >
                      <Trash2 size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs font-normal text-[#A1A1AA] italic py-2">Belum ada kategori tiket disetel</div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const DetailBox: React.FC<{ icon: any; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="border border-[#272A38] bg-[#0C0D12] rounded-lg p-2.5 flex items-start gap-2">
    <Icon size={13} className="text-white mt-0.5 shrink-0" strokeWidth={1.5} />
    <div className="min-w-0">
      <span className="text-[9px] font-medium text-[#71717A] tracking-wider uppercase block">{label}</span>
      <span className="text-xs font-medium text-white block truncate mt-0.5">{value}</span>
    </div>
  </div>
);
