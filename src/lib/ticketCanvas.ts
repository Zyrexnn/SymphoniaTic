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

  // Darkroom canvas
  ctx.fillStyle = '#0C0D12';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Brand header
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 34px Inter, system-ui, sans-serif';
  ctx.fillText('SymphoniaTic Pass', 50, 80);

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '300 16px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('VERIFIED E-TICKET', 750, 80);
  ctx.textAlign = 'left';

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.moveTo(50, 105);
  ctx.lineTo(750, 105);
  ctx.stroke();

  ctx.fillStyle = '#71717A';
  ctx.font = '300 12px sans-serif';
  ctx.fillText('PERTUNJUKAN RESMI', 50, 130);

  ctx.fillStyle = '#ffffff';
  ctx.font = '400 26px sans-serif';
  ctx.fillText(order.eventTitle, 50, 165);

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '300 15px sans-serif';
  ctx.fillText(order.artist, 50, 192);

  const drawInfo = (x: number, y: number, label: string, value: string) => {
    ctx.fillStyle = '#71717A';
    ctx.font = '300 11px sans-serif';
    ctx.fillText(label.toUpperCase(), x, y);
    ctx.fillStyle = '#ffffff';
    ctx.font = '300 15px sans-serif';
    ctx.fillText(value, x, y + 20);
  };

  drawInfo(50, 235, 'Tanggal & Waktu', order.date);
  drawInfo(450, 235, 'Open Gate', order.openGate || 'Sesuai Jadwal');
  drawInfo(50, 295, 'Pemegang Tiket', order.userName);
  drawInfo(450, 295, 'Kategori Tiket', `${order.categoryName} (${order.quantity}x Tiket)`);
  drawInfo(50, 350, 'Kode Order', order.orderCode);

  // Perforated separator line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(50, 395);
  ctx.lineTo(width - 50, 395);
  ctx.stroke();
  ctx.setLineDash([]);

  // Venue metadata container
  ctx.fillStyle = '#14161F';
  ctx.fillRect(50, 425, 700, 180);
  ctx.strokeStyle = '#272A38';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 425, 700, 180);

  ctx.fillStyle = '#ffffff';
  ctx.font = '600 15px sans-serif';
  ctx.fillText('PETUNJUK LOKASI VENUE & MAPS', 75, 460);

  ctx.fillStyle = '#ffffff';
  ctx.font = '400 16px sans-serif';
  ctx.fillText(order.venue, 75, 492);

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '300 13px sans-serif';
  ctx.fillText(`Navigasi Peta: maps.google.com/?q=${encodeURIComponent(order.venue)}`, 75, 522);

  ctx.fillStyle = '#71717A';
  ctx.font = '300 11px sans-serif';
  ctx.fillText(
    `Tunjukkan dokumen E-Ticket ini saat memasuki gerbang pemeriksaan (${order.openGate ? `Open Gate ${order.openGate}` : 'Open Gate'}).`,
    75,
    570
  );

  // Real Scannable QR Code Matrix
  const qrSize = 190;
  const qrX = (width - qrSize) / 2;
  const qrY = 640;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX, qrY, qrSize, qrSize);

  const qrPayload = order.qrCode || order.orderCode;
  try {
    const qr = QRCode.create(qrPayload, { errorCorrectionLevel: 'H' });
    const moduleCount = qr.modules.size;
    const quietZone = 2;
    const totalCount = moduleCount + quietZone * 2;
    const cellSize = qrSize / totalCount;

    ctx.fillStyle = '#0C0D12';
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

  // Footer bar
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 22px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(order.orderCode, width / 2, 875);

  ctx.fillStyle = '#71717A';
  ctx.font = '300 12px sans-serif';
  ctx.fillText('SIMPAN & TUNJUKKAN KODE QR RESMI INI KEPADA PETUGAS GATE', width / 2, 905);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.moveTo(50, 930);
  ctx.lineTo(750, 930);
  ctx.stroke();

  ctx.fillStyle = '#A1A1AA';
  ctx.font = '300 13px sans-serif';
  ctx.fillText('SymphoniaTic Orchestra Hall Verification • All Rights Reserved', width / 2, 960);

  return canvas;
}
