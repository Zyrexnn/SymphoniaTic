import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, QrCode, CheckCircle2, MapPin, Download, AlertCircle, ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react';
import { lookupTicketAPI, type OrderRecord, formatIDR } from '../landing/data';

export const RedeemPage: React.FC = () => {
  const [searchCode, setSearchCode] = useState('');
  const [foundOrder, setFoundOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState<'PNG' | 'PDF' | null>(null);

  // Auto search if query param ?code=SYM-xxx is present in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const codeParam = urlParams.get('code');
      if (codeParam) {
        setSearchCode(codeParam.toUpperCase());
        performLookup(codeParam.toUpperCase());
      }
    }
  }, []);

  const performLookup = async (codeStr: string) => {
    const cleanCode = codeStr.trim().toUpperCase();
    if (!cleanCode) return;

    setIsLoading(true);
    setHasSearched(true);
    setErrorMessage('');
    setFoundOrder(null);

    try {
      const res = await lookupTicketAPI(cleanCode);
      if (res.success && res.data) {
        setFoundOrder(res.data);
      } else {
        setErrorMessage(res.message || 'Kode pesanan tiket tidak ditemukan. Pastikan kode yang Anda masukkan benar.');
      }
    } catch {
      setErrorMessage('Terjadi kesalahan koneksi saat memverifikasi tiket. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(searchCode);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSearchCode(text.trim().toUpperCase());
      }
    } catch {
      // Browser permission fallback
    }
  };

  const handleCopyCode = () => {
    if (!foundOrder) return;
    navigator.clipboard.writeText(foundOrder.orderCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Canvas PDF & PNG Export Engine
  const drawTicketCanvas = (order: OrderRecord): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 1100;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    ctx.fillStyle = '#171717';
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, width - 40, height - 40);

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

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(50, 395);
    ctx.lineTo(width - 50, 395);
    ctx.stroke();
    ctx.setLineDash([]);

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
  };

  const handleDownloadPNG = () => {
    if (!foundOrder) return;
    setIsDownloading('PNG');
    try {
      const canvas = drawTicketCanvas(foundOrder);
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `E-Ticket-${foundOrder.orderCode}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('PNG download error:', err);
    } finally {
      setIsDownloading(null);
    }
  };

  const handleDownloadPDF = async () => {
    if (!foundOrder) return;
    setIsDownloading('PDF');
    try {
      const canvas = drawTicketCanvas(foundOrder);
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default;
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xPos = (pdfWidth - imgWidth) / 2;

      pdf.setFillColor(23, 23, 23);
      pdf.rect(0, 0, 210, 297, 'F');
      pdf.addImage(imgData, 'PNG', xPos, 10, imgWidth, imgHeight);
      pdf.save(`E-Ticket-${foundOrder.orderCode}.pdf`);
    } catch (err) {
      console.error('PDF download error:', err);
    } finally {
      setIsDownloading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#171717] text-white flex flex-col justify-between selection:bg-white selection:text-[#171717]">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 bg-[#171717]/90 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="inline-flex items-center gap-2 text-white hover:opacity-70 transition-opacity">
            <ArrowLeft className="w-4 h-4" strokeWidth={1} />
            <span className="text-sm font-light tracking-wide">Kembali ke Beranda</span>
          </a>
          <div className="flex items-center gap-2">
            <QrCode className="w-4 h-4 text-[#9a9a9a]" strokeWidth={1} />
            <span className="text-xs font-light tracking-widest text-[#9a9a9a] uppercase">Portal Redem Tiket</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[800px] w-full mx-auto px-6 py-12 flex flex-col gap-10">
        {/* Title Header Section */}
        <div className="text-center flex flex-col items-center">
          <span className="text-xs font-light tracking-[0.2em] uppercase text-[#9a9a9a] border border-white/10 px-3.5 py-1 mb-4">
            [ VERIFIKASI RESMI TIKET SIMFONI ]
          </span>
          <h1 className="text-3xl sm:text-4xl tracking-[-0.03em] font-light text-white leading-tight">
            Redem &amp; Cek E-Ticket Konser Anda
          </h1>
          <p className="text-sm sm:text-base font-light text-[#9a9a9a] max-w-[560px] mt-3 leading-relaxed">
            Masukkan kode unik pesanan Anda (contoh: <code className="text-white bg-white/10 px-1.5 py-0.5 font-mono">SYM-893472</code>) untuk mengakses tiket pass digital, QR code gate, serta dokumen cetak PDF.
          </p>
        </div>

        {/* Search Bar Input Form */}
        <div className="bg-[#0f172a] border border-white/10 p-6 sm:p-8 flex flex-col gap-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9a9a9a]" strokeWidth={1} />
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="MASUKKAN KODE PESANAN (SYM-XXXXXX)..."
                className="w-full bg-[#171717] border border-white/15 pl-12 pr-4 py-3.5 text-base font-mono tracking-wider text-white uppercase outline-none focus:border-white transition-colors"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !searchCode.trim()}
              className={`px-8 py-3.5 text-sm font-light tracking-wider uppercase bg-white text-[#171717] flex items-center justify-center gap-2 cursor-pointer hover:bg-white/90 transition-all ${
                isLoading || !searchCode.trim() ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? (
                <span>Memeriksa...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" strokeWidth={1.5} />
                  <span>Verifikasi Tiket</span>
                </>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between text-xs text-[#9a9a9a] pt-1">
            <span>Contoh format kode: SYM-XXXXXX</span>
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="hover:text-white transition-colors underline cursor-pointer bg-transparent border-none"
            >
              Tempel dari Clipboard
            </button>
          </div>
        </div>

        {/* Error State */}
        {hasSearched && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 border border-red-500/30 bg-red-950/20 text-red-200 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div className="text-sm font-light leading-relaxed">
              <p className="font-normal text-red-300 mb-1">Tiket Tidak Ditemukan</p>
              <p>{errorMessage}</p>
            </div>
          </motion.div>
        )}

        {/* Verified Ticket Found Result */}
        {foundOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#171717] border border-white/15 overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Ticket Card Top Bar */}
            <div className="bg-[#0f172a] px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" strokeWidth={1.5} />
                <span className="text-xs font-light tracking-widest text-emerald-400 uppercase">TIKET VERIFIKASI RESMI</span>
              </div>
              <span className="text-xs font-mono text-[#9a9a9a] uppercase">Status: {foundOrder.status}</span>
            </div>

            {/* Ticket Card Main Content */}
            <div className="p-6 sm:p-8 flex flex-col gap-6">
              {/* Event Metadata */}
              <div>
                <span className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1">Pertunjukan Simfoni</span>
                <h3 className="text-2xl font-light text-white tracking-tight">{foundOrder.eventTitle}</h3>
                <p className="text-base font-light text-[#9a9a9a] mt-1">{foundOrder.artist}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-y border-white/10 py-6">
                <div>
                  <span className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1">Tanggal &amp; Waktu Konser</span>
                  <span className="text-base font-light text-white">{foundOrder.date}</span>
                </div>
                <div>
                  <span className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1">Venue &amp; Gedung</span>
                  <span className="text-base font-light text-white">{foundOrder.venue}</span>
                </div>
                <div>
                  <span className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1">Pemegang Tiket</span>
                  <span className="text-base font-light text-white">{foundOrder.userName} ({foundOrder.userEmail})</span>
                </div>
                <div>
                  <span className="text-xs font-light text-[#9a9a9a] tracking-wider uppercase block mb-1">Kategori &amp; Kuota</span>
                  <span className="text-base font-light text-white">{foundOrder.categoryName} — {foundOrder.quantity}x Tiket ({formatIDR(foundOrder.totalPrice)})</span>
                </div>
              </div>

              {/* QR Code & Order Code Display */}
              <div className="bg-[#0f172a] border border-white/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-2">
                  <span className="text-xs font-light text-[#9a9a9a] uppercase tracking-wider">Kode Pesanan Transaksi</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-mono text-white tracking-wider">{foundOrder.orderCode}</span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 border border-white/20 text-[#9a9a9a] hover:text-white transition-colors cursor-pointer"
                      title="Salin Kode Pesanan"
                    >
                      {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs font-light text-[#9a9a9a] max-w-[320px] mt-1">
                    Tunjukkan Kode QR ini di pintu masuk (Open Gate) untuk dipindai oleh pemindai petugas.
                  </p>
                </div>

                <div className="p-3 bg-white border border-white/20 shrink-0">
                  <QrCode className="w-28 h-28 text-[#171717]" strokeWidth={1} />
                </div>
              </div>

              {/* Location Maps & Navigation */}
              <div className="border border-white/10 p-5 bg-[#0f172a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sky-400 text-sm font-light mb-1">
                    <MapPin className="w-4 h-4" strokeWidth={1.5} />
                    <span>Petunjuk Lokasi Venue:</span>
                  </div>
                  <p className="text-sm font-light text-white">{foundOrder.venue}</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(foundOrder.venue)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-light tracking-wider uppercase text-white border border-white/20 px-4 py-2.5 hover:bg-white/10 transition-colors shrink-0"
                >
                  <span>Buka Peta Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.5} />
                </a>
              </div>

              {/* Export & Download Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={!!isDownloading}
                  className="w-full bg-white text-[#171717] py-3 text-xs font-light tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-white/90 transition-opacity"
                >
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  <span>{isDownloading === 'PDF' ? 'Proses PDF...' : 'Unduh PDF E-Ticket Pass'}</span>
                </button>

                <button
                  onClick={handleDownloadPNG}
                  disabled={!!isDownloading}
                  className="w-full bg-transparent border border-white/20 text-white py-3 text-xs font-light tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer hover:bg-white/10 transition-opacity"
                >
                  <Download className="w-4 h-4" strokeWidth={1.5} />
                  <span>{isDownloading === 'PNG' ? 'Proses PNG...' : 'Simpan Gambar PNG'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Redeem Info & FAQ */}
        <div className="border-t border-white/10 pt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm font-light text-[#9a9a9a]">
          <div>
            <h4 className="text-white text-base font-light mb-2">Bantuan Penukaran Kode</h4>
            <p className="leading-relaxed">
              Jika Anda kehilangan kode pesanan atau membutuhkan bantuan verifikasi ulang tiket, Anda dapat memeriksa kotak masuk email yang digunakan saat pemesanan.
            </p>
          </div>
          <div>
            <h4 className="text-white text-base font-light mb-2">Pemeriksaan di Gate</h4>
            <p className="leading-relaxed">
              E-Ticket digital ini sah dan tidak wajib dicetak. Cukup tunjukkan layar QR Code atau dokumen PDF hasil unduhan pada smartphone Anda.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] py-8 text-center text-xs text-[#9a9a9a] font-light">
        &copy; 2026 SymphoniaTic Official Ticket Redemption Portal. All rights reserved.
      </footer>
    </div>
  );
};
