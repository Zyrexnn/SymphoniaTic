import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  Search,
  Volume2,
  VolumeX,
  FlipHorizontal,
  Clock,
  Users,
  RefreshCw
} from 'lucide-react';
import {
  checkInTicketAPI,
  fetchGateAttendanceAPI,
  type EventItem,
  type GateAttendanceSummary,
  type OrderRecord
} from '../landing/data';
import { fieldInputBase } from '@/components/ui/form-controls';

interface ScanResultState {
  type: 'SUCCESS' | 'ERROR' | 'ALREADY_USED';
  title: string;
  message: string;
  order?: OrderRecord;
  timestamp: string;
}

interface GateScannerPanelProps {
  events?: EventItem[];
  onScanSuccess?: () => void;
}

export const GateScannerPanel: React.FC<GateScannerPanelProps> = ({ events = [], onScanSuccess }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultState | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResultState[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraError, setCameraError] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [attendance, setAttendance] = useState<GateAttendanceSummary | null>(null);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'gate-qr-reader-container';

  const loadAttendance = async (eventId = selectedEventId) => {
    setIsAttendanceLoading(true);
    try {
      const summary = await fetchGateAttendanceAPI(eventId || undefined);
      if (summary) setAttendance(summary);
    } finally {
      setIsAttendanceLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance(selectedEventId);
  }, [selectedEventId]);

  const playBeep = (type: 'success' | 'error') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {}
  };

  useEffect(() => {
    const initCameras = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          const backCam = devices.find((d) =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment') ||
            d.label.toLowerCase().includes('kamera belakang')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      } catch (err) {
        console.warn('Camera enumeration warning:', err);
      }
    };
    initCameras();

    return () => {
      stopScanner();
    };
  }, []);

  const lastScannedCodeRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);

  const handleVerifyCode = async (rawCode: string) => {
    if (!rawCode) return;
    const code = rawCode.trim().replace(/^QR-/, '');
    const nowTs = Date.now();

    if (lastScannedCodeRef.current === code && nowTs - lastScannedTimeRef.current < 3000) {
      return;
    }
    if (isProcessing) return;

    lastScannedCodeRef.current = code;
    lastScannedTimeRef.current = nowTs;
    setIsProcessing(true);

    try {
      const res = await checkInTicketAPI(code);
      const now = new Date().toLocaleTimeString('id-ID');

      if (res.success && res.data) {
        playBeep('success');
        const result: ScanResultState = {
          type: 'SUCCESS',
          title: 'CHECK-IN BERHASIL (VALID)',
          message: `Tiket sah untuk ${res.data.userName} (${res.data.categoryName}, ${res.data.quantity}x)`,
          order: res.data,
          timestamp: now,
        };
        setScanResult(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
        void loadAttendance(selectedEventId);
        if (onScanSuccess) onScanSuccess();
      } else if (res.isAlreadyUsed) {
        playBeep('error');
        const result: ScanResultState = {
          type: 'ALREADY_USED',
          title: 'TIKET SUDAH DIGUNAKAN',
          message: res.message || 'Tiket ini sudah pernah melakukan check-in sebelumnya!',
          order: res.data,
          timestamp: now,
        };
        setScanResult(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
      } else {
        playBeep('error');
        let errTitle = 'TIKET TIDAK VALID / VOID';
        const lowerMsg = (res.message || '').toLowerCase();
        if (lowerMsg.includes('belum dibuka')) {
          errTitle = 'GERBANG BELUM DIBUKA';
        } else if (lowerMsg.includes('telah selesai') || lowerMsg.includes('kedaluwarsa')) {
          errTitle = 'KONSER TELAH BERAKHIR';
        } else if (lowerMsg.includes('telah ditutup')) {
          errTitle = 'KONSER DITUTUP PANITIA';
        }

        const result: ScanResultState = {
          type: 'ERROR',
          title: errTitle,
          message: res.message || 'Kode tiket tidak ditemukan di sistem database.',
          order: res.data,
          timestamp: now,
        };
        setScanResult(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
      }
    } catch {
      playBeep('error');
      setScanResult({
        type: 'ERROR',
        title: 'KESALAHAN KONEKSI',
        message: 'Gagal menghubungi server verifikasi gate.',
        timestamp: new Date().toLocaleTimeString('id-ID'),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const startScanner = async (camId?: string) => {
    setCameraError('');
    setIsScanning(true);

    try {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {}
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      const cameraConfig = camId || selectedCameraId || { facingMode: 'environment' };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 15,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleVerifyCode(decodedText);
        },
        () => {}
      );

      if (cameras.length === 0) {
        const devices = await Html5Qrcode.getCameras().catch(() => []);
        if (devices.length > 0) setCameras(devices);
      }
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      try {
        if (html5QrCodeRef.current) {
          await html5QrCodeRef.current.start(
            { facingMode: 'user' },
            { fps: 15, qrbox: { width: 250, height: 250 } },
            (decodedText) => handleVerifyCode(decodedText),
            () => {}
          );
          return;
        }
      } catch (fallbackErr) {
        console.error('Fallback camera failed:', fallbackErr);
      }
      setCameraError('Gagal mengakses kamera. Pastikan Anda telah mengizinkan akses kamera pada browser.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode) return;
    handleVerifyCode(manualCode);
    setManualCode('');
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#14161F] border border-[#272A38] rounded-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-1">
            <h2 className="text-base font-semibold text-[#F4F4F6] tracking-tight m-0">
              Pemindai Gate Masuk (QR Scanner)
            </h2>
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                isScanning
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-[#3E4357] bg-[#0C0D12] text-[#A1A1AA]'
              }`}
            >
              {isScanning ? 'Kamera Aktif' : 'Siap Memindai'}
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] font-normal m-0">
            Arahkan kamera ke QR Code E-Ticket penonton atau masukkan kode manual untuk validasi pintu masuk.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-pressed={soundEnabled}
            className={`min-h-[44px] px-3.5 py-2 border rounded-lg text-xs font-medium flex items-center gap-2 transition-colors ${
              soundEnabled ? 'border-white/40 text-white bg-white/10' : 'border-[#3E4357] text-[#A1A1AA] bg-[#0C0D12]'
            }`}
          >
            {soundEnabled ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
            <span>{soundEnabled ? 'Audio On' : 'Muted'}</span>
          </button>

          {isScanning ? (
            <button
              type="button"
              onClick={stopScanner}
              className="min-h-[44px] px-4 py-2 border border-rose-500/40 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors"
            >
              Matikan Kamera
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startScanner()}
              className="min-h-[44px] px-4 py-2 bg-white text-[#0C0D12] hover:bg-neutral-200 text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2"
            >
              <Camera size={15} aria-hidden="true" />
              <span>Aktifkan Kamera</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-5 bg-[#14161F] border border-[#272A38] rounded-xl space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Users size={16} className="text-emerald-400" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#F4F4F6] m-0">Progres Kehadiran Penonton</h3>
              <p className="text-xs text-[#A1A1AA] m-0">
                {attendance
                  ? `Hadir: ${attendance.totalCheckedIn} dari ${attendance.totalTicketsIssued} tiket (${attendance.checkInPercentage}%)`
                  : isAttendanceLoading
                  ? 'Memuat data kehadiran...'
                  : 'Data kehadiran belum tersedia'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {events.length > 0 && (
              <select
                aria-label="Filter kehadiran per konser"
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="min-h-[44px] bg-[#0C0D12] border border-[#3E4357] text-white rounded-lg text-xs px-3 py-2 outline-none focus:border-white max-w-[240px]"
              >
                <option value="">Semua Konser</option>
                {events.map((evt) => (
                  <option key={evt.id} value={String(evt.id)}>
                    {evt.title}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => loadAttendance(selectedEventId)}
              disabled={isAttendanceLoading}
              aria-label="Segarkan progres kehadiran"
              className="min-h-[44px] px-3 py-2 border border-[#3E4357] bg-[#0C0D12] hover:border-white/60 text-xs text-[#E4E4E7] rounded-lg inline-flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={14} className={isAttendanceLoading ? 'animate-spin' : ''} aria-hidden="true" />
              <span className="hidden sm:inline">Segarkan</span>
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <div
            role="progressbar"
            aria-label="Persentase kehadiran penonton"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={attendance ? Math.min(100, Math.round(attendance.checkInPercentage)) : 0}
            className="w-full h-2.5 bg-[#0C0D12] border border-[#272A38] rounded-full overflow-hidden"
          >
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${attendance ? Math.min(100, attendance.checkInPercentage) : 0}%` }}
            />
          </div>
          {attendance && (
            <div className="flex justify-between items-center text-[11px] font-mono text-[#A1A1AA]">
              <span>Sudah Masuk: {attendance.totalCheckedIn}</span>
              <span>Belum Masuk: {attendance.remainingCheckIn}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="border border-[#272A38] bg-[#14161F] p-5 rounded-xl flex flex-col items-center justify-center relative min-h-[340px]">
            {cameraError && (
              <div role="alert" className="p-3.5 mb-4 w-full rounded-lg border border-rose-500/40 bg-rose-500/10 text-rose-200 text-xs flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-rose-400" aria-hidden="true" />
                <span>{cameraError}</span>
              </div>
            )}

            <div
              id={scannerContainerId}
              className={`w-full max-w-[420px] aspect-square bg-[#0C0D12] border border-[#272A38] rounded-xl overflow-hidden flex items-center justify-center relative ${
                !isScanning ? 'hidden' : 'block'
              }`}
            />

            {!isScanning && (
              <div className="text-center p-8 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-xl border border-[#3E4357] flex items-center justify-center bg-[#0C0D12]">
                  <Camera size={24} className="text-white" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-[#F4F4F6] m-0">Kamera Scanner Sedang Nonaktif</h3>
                <p className="text-xs text-[#A1A1AA] font-normal max-w-xs mx-auto leading-relaxed">
                  Klik tombol Aktifkan Kamera di atas untuk mulai memindai QR Code tiket di gate.
                </p>
              </div>
            )}

            {cameras.length > 1 && (
              <div className="w-full mt-4 pt-4 border-t border-[#272A38] flex flex-wrap items-center justify-between gap-3 text-xs">
                <label htmlFor="gate-camera-select" className="text-[#A1A1AA] font-medium flex items-center gap-1.5">
                  <FlipHorizontal size={14} aria-hidden="true" /> Pilih Kamera:
                </label>
                <select
                  id="gate-camera-select"
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                    if (isScanning) startScanner(e.target.value);
                  }}
                  className="min-h-[40px] bg-[#0C0D12] border border-[#3E4357] text-white rounded-lg text-xs px-3 py-1.5 outline-none focus:border-white"
                >
                  {cameras.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label || `Kamera ${c.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <form onSubmit={handleManualSubmit} className="p-4 border border-[#272A38] bg-[#14161F] rounded-xl flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="text-[#A1A1AA] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
              <input
                type="text"
                aria-label="Input kode tiket manual"
                placeholder="Input kode tiket manual (cth: SYM-893472)..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className={`${fieldInputBase} pl-10`}
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode || isProcessing}
              className="min-h-[46px] px-5 py-2.5 bg-white text-[#0C0D12] hover:bg-neutral-200 text-xs uppercase font-semibold rounded-lg disabled:opacity-40 transition-colors shrink-0"
            >
              {isProcessing ? 'Verifikasi...' : 'Cek Manual'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="border border-[#272A38] bg-[#14161F] rounded-xl p-5 flex flex-col justify-between">
            <div className="border-b border-[#272A38] pb-3 mb-4 flex items-center justify-between">
              <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider font-medium">
                Status Hasil Scan Terakhir
              </span>
              {scanResult && <span className="text-xs font-mono text-white">{scanResult.timestamp}</span>}
            </div>

            {scanResult ? (
              <div
                role="status"
                className={`p-5 rounded-xl border space-y-4 ${
                  scanResult.type === 'SUCCESS'
                    ? 'border-emerald-500/40 bg-emerald-950/30'
                    : scanResult.type === 'ALREADY_USED'
                    ? 'border-amber-500/40 bg-amber-950/30'
                    : 'border-rose-500/40 bg-rose-950/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  {scanResult.type === 'SUCCESS' ? (
                    <CheckCircle2 size={24} className="text-emerald-400 shrink-0" aria-hidden="true" />
                  ) : scanResult.type === 'ALREADY_USED' ? (
                    <Clock size={24} className="text-amber-400 shrink-0" aria-hidden="true" />
                  ) : (
                    <AlertCircle size={24} className="text-rose-400 shrink-0" aria-hidden="true" />
                  )}
                  <div>
                    <h3
                      className={`text-sm font-semibold tracking-wide m-0 ${
                        scanResult.type === 'SUCCESS'
                          ? 'text-emerald-300'
                          : scanResult.type === 'ALREADY_USED'
                          ? 'text-amber-300'
                          : 'text-rose-300'
                      }`}
                    >
                      {scanResult.title}
                    </h3>
                    <p className="text-xs text-white/90 font-normal mt-1 m-0 leading-relaxed">{scanResult.message}</p>
                  </div>
                </div>

                {scanResult.order && (
                  <div className="pt-3 border-t border-white/15 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-[#A1A1AA] uppercase block">Kode Tiket</span>
                      <span className="font-mono text-white font-semibold text-sm">{scanResult.order.orderCode}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#A1A1AA] uppercase block">Pemegang</span>
                      <span className="text-white truncate block font-medium">{scanResult.order.userName}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#A1A1AA] uppercase block">Kategori &amp; Kursi</span>
                      <span className="text-white">
                        {scanResult.order.categoryName} ({scanResult.order.quantity}x)
                        {scanResult.order.seatNumbers ? ` · ${scanResult.order.seatNumbers}` : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#A1A1AA] uppercase block">Event Konser</span>
                      <span className="text-white truncate block">{scanResult.order.eventTitle}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-[#3E4357] rounded-xl text-xs font-normal text-[#A1A1AA]">
                Belum ada tiket yang dipindai pada sesi ini.
              </div>
            )}
          </div>

          <div className="border border-[#272A38] bg-[#14161F] rounded-xl p-5 flex-1 flex flex-col">
            <div className="border-b border-[#272A38] pb-3 mb-3 flex items-center justify-between">
              <span className="text-xs font-mono text-[#A1A1AA] uppercase tracking-wider font-medium">
                Riwayat Verifikasi Gate ({scanHistory.length})
              </span>
              {scanHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setScanHistory([])}
                  className="text-xs text-[#A1A1AA] hover:text-white bg-transparent border-none px-2 py-1 rounded"
                >
                  Bersihkan
                </button>
              )}
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
              {scanHistory.length === 0 ? (
                <p className="text-xs text-[#94A3B8] font-normal text-center py-4">Riwayat scan kosong.</p>
              ) : (
                scanHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 border border-[#272A38] bg-[#0C0D12] rounded-lg flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        aria-hidden="true"
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          item.type === 'SUCCESS'
                            ? 'bg-emerald-400'
                            : item.type === 'ALREADY_USED'
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                      />
                      <span className="font-mono text-white font-semibold shrink-0">{item.order?.orderCode || 'UNKNOWN'}</span>
                      <span className="text-[#A1A1AA] truncate">{item.order?.userName || item.title}</span>
                    </div>
                    <span className="text-[11px] font-mono text-[#94A3B8] shrink-0">{item.timestamp}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
