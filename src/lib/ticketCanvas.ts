import type { OrderRecord } from '@/components/landing/data';

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

  const drawInfo = (y: number, label: string, value: string) => {
    ctx.fillStyle = '#71717A';
    ctx.font = '300 11px sans-serif';
    ctx.fillText(label.toUpperCase(), 50, y);
    ctx.fillStyle = '#ffffff';
    ctx.font = '300 15px sans-serif';
    ctx.fillText(value, 50, y + 20);
  };

  drawInfo(235, 'Tanggal & Waktu', order.date);
  drawInfo(290, 'Pemegang Tiket', order.userName);
  drawInfo(345, 'Kategori Tiket', `${order.categoryName} (${order.quantity}x Tiket)`);

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
  ctx.fillText('Tunjukkan dokumen E-Ticket ini saat memasuki gerbang pemeriksaan (Open Gate).', 75, 570);

  // QR Code Area
  const qrSize = 190;
  const qrX = (width - qrSize) / 2;
  const qrY = 640;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = '#0C0D12';
  const drawFinder = (fx: number, fy: number) => {
    ctx.fillRect(fx, fy, 38, 38);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + 5, fy + 5, 28, 28);
    ctx.fillStyle = '#0C0D12';
    ctx.fillRect(fx + 10, fy + 10, 18, 18);
  };

  const qrPad = 18;
  const qrInner = qrSize - qrPad * 2;
  drawFinder(qrX + qrPad, qrY + qrPad);
  drawFinder(qrX + qrPad + qrInner - 38, qrY + qrPad);
  drawFinder(qrX + qrPad, qrY + qrPad + qrInner - 38);

  ctx.fillStyle = '#0C0D12';
  const gridSize = 10;
  const cellSize = qrInner / gridSize;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if ((r < 4 && c < 4) || (r < 4 && c >= 6) || (r >= 6 && c < 4)) continue;
      if ((r + c * 3 + order.orderCode.length) % 3 === 0) {
        ctx.fillRect(qrX + qrPad + c * cellSize, qrY + qrPad + r * cellSize, cellSize - 1, cellSize - 1);
      }
    }
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
