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
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#171717', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h3 style={{ fontSize: 16, fontWeight: 300, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>Postingan Konser & Kategori Tiket</h3>
        <p style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', margin: '4px 0 0 0' }}>
          Kelola data event, jam open gate, konduktor, lokasi venue, serta kuota tempat duduk
        </p>
      </div>
      <button
        onClick={onAddEvent}
        style={{
          padding: '8px 16px', fontSize: 13, fontWeight: 300, color: '#ffffff',
          border: '1px solid #ffffff', background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.6'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        <Plus size={14} strokeWidth={1} />
        <span>Tambah Konser Baru</span>
      </button>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
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
  <div style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#171717', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, minWidth: 0 }}>
        <img src={evt.image} alt={evt.title} style={{ width: 64, height: 64, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.06)' }} />
        <div>
          <span style={{ fontSize: 10, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{evt.category}</span>
          <h4 style={{ fontSize: 15, fontWeight: 300, color: '#ffffff', margin: '4px 0 2px', letterSpacing: '-0.02em' }}>{evt.title}</h4>
          <p style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', margin: 0 }}>{evt.artist}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button onClick={onEdit} title="Edit"
          style={{ padding: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex' }}>
          <Edit size={14} strokeWidth={1} style={{ color: '#9a9a9a' }} />
        </button>
        <button onClick={onDelete} title="Hapus"
          style={{ padding: 6, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex' }}>
          <Trash2 size={14} strokeWidth={1} style={{ color: '#9a9a9a' }} />
        </button>
      </div>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      <DetailBox label="Venue & Hall" value={evt.venue} />
      <DetailBox label="Jadwal Tanggal" value={`${evt.date} @ ${evt.time}`} />
      {evt.conductor && <DetailBox label="Konduktor" value={evt.conductor} />}
      {evt.openGate && <DetailBox label="Open Gate" value={evt.openGate} />}
    </div>

    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a' }}>Kategori Tiket & Kuota:</span>
        <button onClick={onAddCategory}
          style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
          <Plus size={12} strokeWidth={1} />
          <span>Tambah Kategori</span>
        </button>
      </div>
      <div>
        {evt.categories && evt.categories.length > 0 ? (
          evt.categories.map((cat) => (
            <div key={cat.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 300, color: '#ffffff', display: 'block' }}>{cat.name}</span>
                <span style={{ fontSize: 10, fontWeight: 300, color: '#9a9a9a', display: 'block', marginTop: 1 }}>Sisa Kuota: {cat.quota} tempat duduk</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 300, color: '#ffffff' }}>{formatIDR(cat.price)}</span>
                <button onClick={() => onEditCategory(cat)} title="Edit Kategori"
                  style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  <Edit size={12} strokeWidth={1} style={{ color: '#9a9a9a' }} />
                </button>
                <button onClick={() => onDeleteCategory(cat.id, cat.name)} title="Hapus Kategori"
                  style={{ padding: 4, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex' }}>
                  <Trash2 size={12} strokeWidth={1} style={{ color: '#9a9a9a' }} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <span style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', fontStyle: 'italic' }}>Belum ada kategori tiket</span>
        )}
      </div>
    </div>
  </div>
);

const DetailBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{ border: '1px solid rgba(255,255,255,0.04)', padding: 10 }}>
    <span style={{ fontSize: 9, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block' }}>{label}</span>
    <span style={{ fontSize: 12, fontWeight: 300, color: '#ffffff', display: 'block', marginTop: 2 }}>{value}</span>
  </div>
);
