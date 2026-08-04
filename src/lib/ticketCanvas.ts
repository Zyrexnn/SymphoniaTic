import type { OrderRecord } from '@/components/landing/data';

export function drawTicketCanvas(order: OrderRecord): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1100;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Background Canvas
  ctx.fillStyle = '#171717';
  ctx.fillRect(0, 0, width, height);

  // Border Frame
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Header Branding
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 34px Inter, system-ui, sans-serif';
  ctx.fillText('SymphoniaTic Pass', 50, 80);

  ctx.fillStyle = '#9a9a9a';
  ctx.font = '300 16px Inter, system-ui, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('VERIFIED E-TICKET', 750, 80);
  ctx.textAlign = 'left';

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.moveTo(50, 105);
  ctx.lineTo(750, 105);
  ctx.stroke();

  // Event Info
  ctx.fillStyle = '#9a9a9a';
  ctx.font = '300 12px sans-serif';
  ctx.fillText('PERTUNJUKAN RESMI', 50, 130);

  ctx.fillStyle = '#ffffff';
  ctx.font = '400 26px sans-serif';
  ctx.fillText(order.eventTitle, 50, 165);

  ctx.fillStyle = '#9a9a9a';
  ctx.font = '300 15px sans-serif';
  ctx.fillText(order.artist, 50, 192);

  const drawInfo = (y: number, label: string, value: string) => {
    ctx.fillStyle = '#9a9a9a';
    ctx.font = '300 11px sans-serif';
    ctx.fillText(label.toUpperCase(), 50, y);
    ctx.fillStyle = '#ffffff';
    ctx.font = '300 15px sans-serif';
    ctx.fillText(value, 50, y + 20);
  };

  drawInfo(235, 'Tanggal & Waktu', order.date);
  drawInfo(290, 'Pemegang Tiket', order.userName);
  drawInfo(345, 'Kategori Tiket', `${order.categoryName} (${order.quantity}x Tiket)`);

  // Divider Line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(50, 395);
  ctx.lineTo(width - 50, 395);
  ctx.stroke();
  ctx.setLineDash([]);

  // Map Location Box Section
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(50, 425, 700, 180);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(50, 425, 700, 180);

  ctx.fillStyle = '#38bdf8';
  ctx.font = '600 15px sans-serif';
  ctx.fillText('📍 PETUNJUK LOKASI VENUE & MAPS', 75, 460);

  ctx.fillStyle = '#ffffff';
  ctx.font = '400 16px sans-serif';
  ctx.fillText(order.venue, 75, 492);

  ctx.fillStyle = '#9a9a9a';
  ctx.font = '300 13px sans-serif';
  ctx.fillText(`Navigasi Peta: maps.google.com/?q=${encodeURIComponent(order.venue)}`, 75, 522);

  ctx.fillStyle = '#64748b';
  ctx.font = '300 11px sans-serif';
  ctx.fillText('Tunjukkan dokumen E-Ticket ini saat memasuki gerbang pemeriksaan (Open Gate).', 75, 570);

  // QR Code Section
  const qrSize = 190;
  const qrX = (width - qrSize) / 2;
  const qrY = 640;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = '#171717';
  const drawFinder = (fx: number, fy: number) => {
    ctx.fillRect(fx, fy, 38, 38);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + 5, fy + 5, 28, 28);
    ctx.fillStyle = '#171717';
    ctx.fillRect(fx + 10, fy + 10, 18, 18);
  };

  const qrPad = 18;
  const qrInner = qrSize - qrPad * 2;
  drawFinder(qrX + qrPad, qrY + qrPad);
  drawFinder(qrX + qrPad + qrInner - 38, qrY + qrPad);
  drawFinder(qrX + qrPad, qrY + qrPad + qrInner - 38);

  ctx.fillStyle = '#171717';
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

  ctx.fillStyle = '#9a9a9a';
  ctx.font = '300 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(order.orderCode, width / 2, 870);

  ctx.fillStyle = '#9a9a9a';
  ctx.font = '300 12px sans-serif';
  ctx.fillText('Pindai QR Code ini pada scanner gate di pintu masuk hall', width / 2, 905);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.font = '300 11px sans-serif';
  ctx.fillText('SYMPHONIATIC OFFICIAL E-TICKET PASS & MAP GUIDE', width / 2, 1040);

  return canvas;
}
