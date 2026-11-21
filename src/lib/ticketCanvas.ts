import type { OrderRecord } from '@/components/landing/data';
import QRCode from 'qrcode';

export function drawTicketCanvas(order: OrderRecord): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1100;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#F6F4EE';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(28, 28, width - 56, height - 56);
  ctx.strokeStyle = '#E4DFD3';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  ctx.fillStyle = '#C93018';
  ctx.fillRect(28, 28, width - 56, 8);

  ctx.fillStyle = '#171614';
  ctx.font = '600 32px Georgia, serif';
  ctx.fillText('SymphoniaTic Pass', 56, 92);

  ctx.fillStyle = '#C93018';
  ctx.font = '700 13px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('VERIFIED E-TICKET', 744, 88);
  ctx.textAlign = 'left';

  ctx.strokeStyle = '#E4DFD3';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(56, 116);
  ctx.lineTo(744, 116);
  ctx.stroke();

  ctx.fillStyle = '#6B665D';
  ctx.font = '600 11px sans-serif';
  ctx.fillText('PERTUNJUKAN RESMI', 56, 144);

  ctx.fillStyle = '#171614';
  ctx.font = '600 28px Georgia, serif';
  ctx.fillText(order.eventTitle, 56, 180);

  ctx.fillStyle = '#5C5850';
  ctx.font = '400 15px sans-serif';
  ctx.fillText(order.artist, 56, 208);

  const drawInfo = (x: number, y: number, label: string, value: string) => {
    ctx.fillStyle = '#6B665D';
    ctx.font = '600 11px sans-serif';
    ctx.fillText(label.toUpperCase(), x, y);
    ctx.fillStyle = '#171614';
    ctx.font = '600 15px sans-serif';
    ctx.fillText(value, x, y + 22);
  };

  drawInfo(56, 250, 'Tanggal & Waktu', order.date);
  drawInfo(440, 250, 'Open Gate', order.openGate || 'Sesuai Jadwal');
  drawInfo(56, 312, 'Pemegang Tiket', order.userName);
  drawInfo(440, 312, 'Kategori Tiket', `${order.categoryName} (${order.quantity}x Tiket)`);
  drawInfo(56, 374, 'Kode Order', order.orderCode);
  drawInfo(440, 374, 'Nomor Kursi', order.seatNumbers || 'Sesuai Kategori');

  ctx.strokeStyle = '#CFC9BC';
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(56, 422);
  ctx.lineTo(width - 56, 422);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#F6F4EE';
  ctx.fillRect(56, 450, 688, 172);
  ctx.strokeStyle = '#E4DFD3';
  ctx.lineWidth = 1;
  ctx.strokeRect(56, 450, 688, 172);

  ctx.fillStyle = '#C93018';
  ctx.font = '700 12px sans-serif';
  ctx.fillText('PETUNJUK LOKASI VENUE & MAPS', 80, 484);

  ctx.fillStyle = '#171614';
  ctx.font = '600 17px sans-serif';
  ctx.fillText(order.venue, 80, 514);

  ctx.fillStyle = '#5C5850';
  ctx.font = '400 13px sans-serif';
  ctx.fillText(`Navigasi Peta: maps.google.com/?q=${encodeURIComponent(order.venue)}`, 80, 544);

  ctx.fillStyle = '#6B665D';
  ctx.font = '400 12px sans-serif';
  ctx.fillText(
    `Tunjukkan dokumen E-Ticket ini saat memasuki gerbang pemeriksaan (${order.openGate ? `Open Gate ${order.openGate}` : 'Open Gate'}).`,
    80,
    588
  );

  const qrSize = 196;
  const qrX = (width - qrSize) / 2;
  const qrY = 656;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);
  ctx.strokeStyle = '#E4DFD3';
  ctx.strokeRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);

  const qrPayload = order.qrCode || order.orderCode;
  try {
    const qr = QRCode.create(qrPayload, { errorCorrectionLevel: 'H' });
    const moduleCount = qr.modules.size;
    const quietZone = 2;
    const totalCount = moduleCount + quietZone * 2;
    const cellSize = qrSize / totalCount;

    ctx.fillStyle = '#171614';
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (qr.modules.get(r, c)) {
          const x = qrX + (c + quietZone) * cellSize;
          const y = qrY + (r + quietZone) * cellSize;
          ctx.fillRect(x, y, cellSize + 0.5, cellSize + 0.5);
        }
      }
    }
  } catch (err) {
    console.error('Error generating canvas QR code:', err);
  }

  ctx.fillStyle = '#171614';
  ctx.font = '700 22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(order.orderCode, width / 2, 902);

  ctx.fillStyle = '#6B665D';
  ctx.font = '600 12px sans-serif';
  ctx.fillText('SIMPAN & TUNJUKKAN KODE QR RESMI INI KEPADA PETUGAS GATE', width / 2, 932);

  ctx.strokeStyle = '#E4DFD3';
  ctx.beginPath();
  ctx.moveTo(56, 962);
  ctx.lineTo(744, 962);
  ctx.stroke();

  ctx.fillStyle = '#5C5850';
  ctx.font = '400 13px sans-serif';
  ctx.fillText('SymphoniaTic Orchestra Hall Verification · All Rights Reserved', width / 2, 996);

  return canvas;
}
