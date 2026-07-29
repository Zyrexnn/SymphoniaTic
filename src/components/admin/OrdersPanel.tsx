import React from 'react';
import { Search, Download } from 'lucide-react';
import type { OrderRecord } from '../landing/data';
import { formatIDR } from '../landing/data';

interface OrdersPanelProps {
  orders: OrderRecord[];
  search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  onExportCSV: () => void;
}

export const OrdersPanel: React.FC<OrdersPanelProps> = ({
  orders, search, statusFilter, onSearchChange, onStatusFilterChange,
  onUpdateStatus, onExportCSV,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
    <div style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#171717', padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 1, minWidth: 200, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} strokeWidth={1} style={{ color: '#9a9a9a', position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Cari Kode Pesanan, Nama, Email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
              padding: '8px 10px 8px 32px', fontSize: 13, fontWeight: 300, color: '#ffffff', outline: 'none',
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          style={{
            background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
            padding: '8px 10px', fontSize: 13, fontWeight: 300, color: '#ffffff', cursor: 'pointer',
          }}
        >
          <option value="" style={{ background: '#171717', color: '#ffffff' }}>Semua Status</option>
          <option value="VERIFIED" style={{ background: '#171717', color: '#ffffff' }}>VERIFIED</option>
          <option value="CHECKED_IN" style={{ background: '#171717', color: '#ffffff' }}>CHECKED_IN</option>
          <option value="CANCELLED" style={{ background: '#171717', color: '#ffffff' }}>CANCELLED</option>
        </select>
      </div>
      <button
        onClick={onExportCSV}
        style={{
          padding: '8px 16px', fontSize: 13, fontWeight: 300, color: '#ffffff',
          border: '1px solid #ffffff', background: 'transparent', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.6'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        <Download size={14} strokeWidth={1} />
        <span>Ekspor Laporan CSV</span>
      </button>
    </div>

    <div style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#171717', overflow: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, fontWeight: 300 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {['Kode Pesanan', 'Konser & Kategori', 'Pemegang Tiket', 'Jumlah', 'Total Bayar', 'Status', 'Aksi Update Status'].map((h) => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 10, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? (
            orders.map((ord) => (
              <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '12px 16px', color: '#9a9a9a', fontFamily: 'monospace' }}>{ord.orderCode}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: '#ffffff', display: 'block' }}>{ord.eventTitle}</span>
                  <span style={{ fontSize: 11, color: '#9a9a9a', display: 'block' }}>{ord.categoryName}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: '#ffffff', display: 'block' }}>{ord.userName}</span>
                  <span style={{ fontSize: 11, color: '#9a9a9a', display: 'block' }}>{ord.userEmail}</span>
                </td>
                <td style={{ padding: '12px 16px', color: '#9a9a9a' }}>{ord.quantity}x Tiket</td>
                <td style={{ padding: '12px 16px', color: '#ffffff' }}>{formatIDR(ord.totalPrice)}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a' }}>{ord.status}</span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <select
                    value={ord.status}
                    onChange={(e) => onUpdateStatus(ord.id, e.target.value)}
                    style={{
                      background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                      padding: '6px 8px', fontSize: 12, fontWeight: 300, color: '#ffffff', cursor: 'pointer',
                    }}
                  >
                    <option value="VERIFIED" style={{ background: '#171717', color: '#ffffff' }}>VERIFIED</option>
                    <option value="CHECKED_IN" style={{ background: '#171717', color: '#ffffff' }}>CHECKED_IN</option>
                    <option value="CANCELLED" style={{ background: '#171717', color: '#ffffff' }}>CANCELLED</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', padding: 48, color: '#9a9a9a', fontSize: 12 }}>
                Tidak ada data pesanan yang cocok dengan kriteria pencarian.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
