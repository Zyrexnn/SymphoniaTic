import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { EventItem, TicketCategory } from '../landing/data';
import { formatIDR } from '../landing/data';

interface EventsPanelProps {
  events: EventItem[];
  onAddEvent: () => void;
  onEditEvent: (event: EventItem) => void;
  onDeleteEvent: (id: string, title: string) => void;
  onAddCategory: (event: EventItem) => void;
  onEditCategory: (eventId: string, cat: TicketCategory) => void;
  onDeleteCategory: (catId: string, name: string) => void;
}

export const EventsPanel: React.FC<EventsPanelProps> = ({
  events, onAddEvent, onEditEvent, onDeleteEvent,
  onAddCategory, onEditCategory, onDeleteCategory,
}) => (
  <div className="flex flex-col gap-6">
    <div className="border border-white/10 bg-[#171717] p-5 flex justify-between items-center">
      <div>
        <h3 className="text-base font-light text-white tracking-tight m-0">Postingan Konser & Kategori Tiket</h3>
        <p className="text-xs font-light text-[#9a9a9a] mt-1 m-0">
          Kelola data event, jam open gate, konduktor, lokasi venue, serta kuota tempat duduk
        </p>
      </div>
      <button
        onClick={onAddEvent}
        className="px-4 py-2 text-[13px] font-light text-white border border-white bg-transparent cursor-pointer flex items-center gap-1.5 hover:opacity-60"
      >
        <Plus size={14} strokeWidth={1} />
        <span>Tambah Konser Baru</span>
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map((evt) => (
        <EventCard
          key={evt.id}
          event={evt}
          onEdit={() => onEditEvent(evt)}
          onDelete={() => onDeleteEvent(String(evt.id), evt.title)}
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
  onAddCategory: () => void;
  onEditCategory: (cat: TicketCategory) => void;
  onDeleteCategory: (catId: string, name: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({
  event: evt, onEdit, onDelete, onAddCategory, onEditCategory, onDeleteCategory,
}) => (
  <div className="border border-white/10 bg-[#171717] p-5 flex flex-col gap-4">
    <div className="flex justify-between gap-3">
      <div className="flex gap-3 min-w-0">
        <img src={evt.image} alt={evt.title} className="w-16 h-16 object-cover border border-white/[0.06]" />
        <div>
          <span className="text-[10px] font-light text-[#9a9a9a] tracking-wider uppercase">{evt.category}</span>
          <h4 className="text-[15px] font-light text-white mt-1 mb-0.5 tracking-tight">{evt.title}</h4>
          <p className="text-xs font-light text-[#9a9a9a] m-0">{evt.artist}</p>
        </div>
      </div>
      <div className="flex gap-1.5 shrink-0">
        <button onClick={onEdit} title="Edit"
          className="p-1.5 bg-transparent border border-white/[0.1] cursor-pointer flex hover:opacity-60">
          <Edit size={14} strokeWidth={1} className="text-[#9a9a9a]" />
        </button>
        <button onClick={onDelete} title="Hapus"
          className="p-1.5 bg-transparent border border-white/[0.1] cursor-pointer flex hover:opacity-60">
          <Trash2 size={14} strokeWidth={1} className="text-[#9a9a9a]" />
        </button>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-2">
      <DetailBox label="Venue & Hall" value={evt.venue} />
      <DetailBox label="Jadwal Tanggal" value={`${evt.date} @ ${evt.time}`} />
      {evt.conductor && <DetailBox label="Konduktor" value={evt.conductor} />}
      {evt.openGate && <DetailBox label="Open Gate" value={evt.openGate} />}
    </div>

    <div className="border-t border-white/10 pt-3">
      <div className="flex justify-between mb-2">
        <span className="text-xs font-light text-[#9a9a9a]">Kategori Tiket & Kuota:</span>
        <button onClick={onAddCategory}
          className="text-xs font-light text-[#9a9a9a] bg-transparent border-none cursor-pointer flex items-center gap-1 p-0 hover:text-white">
          <Plus size={12} strokeWidth={1} />
          <span>Tambah Kategori</span>
        </button>
      </div>
      <div>
        {evt.categories && evt.categories.length > 0 ? (
          evt.categories.map((cat) => (
            <div key={cat.id} className="border-b border-white/[0.04] py-2 flex justify-between items-center">
              <div>
                <span className="text-[13px] font-light text-white block">{cat.name}</span>
                <span className="text-[10px] font-light text-[#9a9a9a] block mt-0.5">Sisa Kuota: {cat.quota} tempat duduk</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-light text-white">{formatIDR(cat.price)}</span>
                <button onClick={() => onEditCategory(cat)} title="Edit Kategori"
                  className="p-1 bg-transparent border-none cursor-pointer flex hover:opacity-60">
                  <Edit size={12} strokeWidth={1} className="text-[#9a9a9a]" />
                </button>
                <button onClick={() => onDeleteCategory(cat.id, cat.name)} title="Hapus Kategori"
                  className="p-1 bg-transparent border-none cursor-pointer flex hover:opacity-60">
                  <Trash2 size={12} strokeWidth={1} className="text-[#9a9a9a]" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <span className="text-xs font-light text-[#9a9a9a] italic">Belum ada kategori tiket</span>
        )}
      </div>
    </div>
  </div>
);

const DetailBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="border border-white/[0.04] p-2.5">
    <span className="text-[9px] font-light text-[#9a9a9a] tracking-wider uppercase block">{label}</span>
    <span className="text-xs font-light text-white block mt-0.5">{value}</span>
  </div>
);
