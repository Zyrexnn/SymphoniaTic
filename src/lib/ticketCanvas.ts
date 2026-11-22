import type { OrderRecord, TicketItem } from '@/components/landing/data';
import QRCode from 'qrcode';

export interface TicketDrawOptions {
  seatCode?: string;
  attendeeName?: string;
  qrPayload?: string;
  ticketIndex?: number;
  totalTickets?: number;
}

function parseAttendeeList(raw?: string): string[] {
  if (!raw || !raw.trim()) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || '').trim());
      }
    } catch {
      // Fallback ke pemisahan koma jika bukan JSON array valid
    }
  }
  return trimmed.split(',').map((s) => s.trim());
}

export function resolveOrderTickets(order: OrderRecord): TicketItem[] {
  if (Array.isArray(order.tickets) && order.tickets.length > 0) {
    return order.tickets;
  }

  const seats = (order.seatNumbers || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const count = seats.length > 0 ? seats.length : Math.max(1, order.quantity || 1);
  const attendees = parseAttendeeList(order.attendeeNames);
  const checkedSet = new Set(
    (order.checkedInSeats || '')
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean)
  );
  const allCheckedIn = (order.status || '').toUpperCase() === 'CHECKED_IN';
  const fallbackQR = order.qrCode || order.orderCode;

  const items: TicketItem[] = [];
  for (let i = 0; i < count; i++) {
    const seatCode = seats[i] || '';
    const attendeeName = attendees[i] || order.userName;
    const qrCode = seatCode && order.orderCode ? `QR-${order.orderCode}-${seatCode}` : fallbackQR;
    const status =
      allCheckedIn || (seatCode && checkedSet.has(seatCode.toUpperCase()))
        ? 'CHECKED_IN'
        : order.status;
    items.push({ seatCode, attendeeName, qrCode, status });
  }
  return items;
}

export function drawTicketCanvas(order: OrderRecord, options?: TicketDrawOptions): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const width = 800;
  const height = 1100;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const isIndividual = Boolean(options?.seatCode || (options?.totalTickets && options.totalTickets > 1));
  const displayAttendee = options?.attendeeName || order.userName;
  const displaySeat = options?.seatCode || order.seatNumbers || 'Sesuai Kategori';
  const displayCategory = isIndividual ? order.categoryName : `${order.categoryName} (${order.quantity}x Tiket)`;
  const qrPayload = options?.qrPayload || order.qrCode || order.orderCode;
  const displayCode = options?.seatCode ? `${order.orderCode}-${options.seatCode}` : order.orderCode;

  ctx.fillStyle = '#F4F3EF';
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(28, 28, width - 56, height - 56);
  ctx.strokeStyle = '#141413';
  ctx.lineWidth = 2;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  ctx.fillStyle = '#141413';
  ctx.fillRect(28, 28, width - 56, 86);

  ctx.fillStyle = '#D4FF2A';
  ctx.fillRect(28, 28, width - 56, 8);

  ctx.fillStyle = '#F4F3EF';
  ctx.font = '800 30px "Archivo", "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SymphoniaTic. Pass', 56, 86);

  ctx.fillStyle = '#D4FF2A';
  ctx.font = '700 13px "JetBrains Mono", monospace';
  ctx.textAlign = 'right';
  const rightBadge =
    options?.ticketIndex && options?.totalTickets && options.totalTickets > 1
      ? `TIKET ${options.ticketIndex} DARI ${options.totalTickets}`
      : 'VERIFIED E-TICKET';
  ctx.fillText(rightBadge, 744, 83);
  ctx.textAlign = 'left';

  ctx.fillStyle = '#52514D';
  ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('• PERTUNJUKAN RESMI', 56, 148);

  ctx.fillStyle = '#141413';
  ctx.font = '800 28px "Archivo", "Plus Jakarta Sans", sans-serif';
  ctx.fillText(order.eventTitle, 56, 184);

  ctx.fillStyle = '#52514D';
  ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(order.artist, 56, 212);

  const drawInfo = (x: number, y: number, label: string, value: string) => {
    ctx.fillStyle = '#6E6D68';
    ctx.font = '700 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(label.toUpperCase(), x, y);
    ctx.fillStyle = '#141413';
    ctx.font = '700 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(value, x, y + 22);
  };

  drawInfo(56, 254, 'Tanggal & Waktu', order.date);
  drawInfo(440, 254, 'Open Gate', order.openGate || 'Sesuai Jadwal');
  drawInfo(56, 316, 'Pemegang Tiket', displayAttendee);
  drawInfo(440, 316, 'Kategori Tiket', displayCategory);
  drawInfo(56, 378, 'Kode Order', order.orderCode);
  drawInfo(440, 378, 'Nomor Kursi', displaySeat);

  ctx.strokeStyle = '#DFDDD6';
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.moveTo(56, 426);
  ctx.lineTo(width - 56, 426);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#F4F3EF';
  ctx.fillRect(56, 452, 688, 172);
  ctx.strokeStyle = '#DFDDD6';
  ctx.lineWidth = 1;
  ctx.strokeRect(56, 452, 688, 172);

  ctx.fillStyle = '#141413';
  ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('• PETUNJUK LOKASI VENUE & MAPS', 80, 486);

  ctx.fillStyle = '#141413';
  ctx.font = '700 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(order.venue, 80, 516);

  ctx.fillStyle = '#52514D';
  ctx.font = '400 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(`Navigasi Peta: maps.google.com/?q=${encodeURIComponent(order.venue)}`, 80, 546);

  ctx.fillStyle = '#6E6D68';
  ctx.font = '400 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(
    `Tunjukkan dokumen E-Ticket ini saat memasuki gerbang pemeriksaan (${order.openGate ? `Open Gate ${order.openGate}` : 'Open Gate'}).`,
    80,
    590
  );

  const qrSize = 196;
  const qrX = (width - qrSize) / 2;
  const qrY = 656;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);
  ctx.strokeStyle = '#141413';
  ctx.lineWidth = 2;
  ctx.strokeRect(qrX - 12, qrY - 12, qrSize + 24, qrSize + 24);

  try {
    const qr = QRCode.create(qrPayload, { errorCorrectionLevel: 'H' });
    const moduleCount = qr.modules.size;
    const quietZone = 2;
    const totalCount = moduleCount + quietZone * 2;
    const cellSize = qrSize / totalCount;

    ctx.fillStyle = '#141413';
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

  ctx.fillStyle = '#141413';
  ctx.font = '700 22px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(displayCode, width / 2, 902);

  ctx.fillStyle = '#52514D';
  ctx.font = '700 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SIMPAN & TUNJUKKAN KODE QR RESMI INI KEPADA PETUGAS GATE', width / 2, 932);

  ctx.strokeStyle = '#DFDDD6';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(56, 962);
  ctx.lineTo(744, 962);
  ctx.stroke();

  ctx.fillStyle = '#52514D';
  ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('SymphoniaTic. Orchestra Hall Verification · All Rights Reserved', width / 2, 996);

  return canvas;
}

export function downloadOrderPNG(order: OrderRecord, ticket?: TicketItem | null, ticketIndex?: number): void {
  const tickets = resolveOrderTickets(order);
  const options: TicketDrawOptions | undefined = ticket
    ? {
        seatCode: ticket.seatCode,
        attendeeName: ticket.attendeeName,
        qrPayload: ticket.qrCode,
        ticketIndex: typeof ticketIndex === 'number' ? ticketIndex + 1 : undefined,
        totalTickets: tickets.length,
      }
    : undefined;

  const canvas = drawTicketCanvas(order, options);
  const link = document.createElement('a');
  const suffix = ticket?.seatCode ? `-${ticket.seatCode}` : '';
  link.download = `E-Ticket-${order.orderCode}${suffix}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadOrderPDF(order: OrderRecord): Promise<void> {
  const tickets = resolveOrderTickets(order);
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const imgWidth = 180;

  const pages: TicketDrawOptions[] =
    tickets.length > 1
      ? tickets.map((t, idx) => ({
          seatCode: t.seatCode,
          attendeeName: t.attendeeName,
          qrPayload: t.qrCode,
          ticketIndex: idx + 1,
          totalTickets: tickets.length,
        }))
      : [
          {
            seatCode: tickets[0]?.seatCode,
            attendeeName: tickets[0]?.attendeeName || order.userName,
            qrPayload: tickets[0]?.qrCode || order.qrCode || order.orderCode,
          },
        ];

  pages.forEach((opt, idx) => {
    if (idx > 0) {
      pdf.addPage();
    }
    const canvas = drawTicketCanvas(order, opt);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const xPos = (pdfWidth - imgWidth) / 2;
    pdf.setFillColor(244, 243, 239);
    pdf.rect(0, 0, 210, 297, 'F');
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', xPos, 15, imgWidth, imgHeight);
  });

  pdf.save(`E-Ticket-${order.orderCode}.pdf`);
}
