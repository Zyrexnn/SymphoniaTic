import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Volume2,
  VolumeX,
  FlipHorizontal,
  Clock
} from 'lucide-react';
import { checkInTicketAPI, type OrderRecord } from '../landing/data';

interface ScanResultState {
  type: 'SUCCESS' | 'ERROR' | 'ALREADY_USED';
  title: string;
  message: string;
  order?: OrderRecord;
  timestamp: string;
}

export const GateScannerPanel: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [manualCode, setManualCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResultState | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResultState[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraError, setCameraError] = useState('');

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'gate-qr-reader-container';

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

    // Prevent duplicate triggers for the same QR code within 3 seconds
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
          message: `Tiket sah untuk ${res.data.userName} - ${res.data.categoryName} (${res.data.quantity}x)`,
          order: res.data,
          timestamp: now,
        };
        setScanResult(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
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
        const result: ScanResultState = {
          type: 'ERROR',
          title: 'TIKET TIDAK VALID / VOID',
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

      // Re-fetch cameras after permission granted if list was empty
      if (cameras.length === 0) {
        const devices = await Html5Qrcode.getCameras().catch(() => []);
        if (devices.length > 0) setCameras(devices);
      }
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      // Fallback attempt with user facing camera constraint if specific device failed
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
      setCameraError('Gagal mengakses kamera. Pastikan Anda telah mengizinkan (Allow) akses kamera pada browser dan menutup aplikasi kamera lain.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#1a1a1a] border border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-base font-light text-white tracking-wide uppercase m-0">
              Pemindai Gate Masuk (Live QR Scanner)
            </h2>
          </div>
          <p className="text-xs text-[#9a9a9a] font-light m-0">
            Arahkan kamera ke QR Code E-Ticket penonton atau masukkan kode manual untuk validasi pintu masuk.
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 border text-xs font-light flex items-center gap-1.5 transition-colors cursor-pointer ${
              soundEnabled ? 'border-white/20 text-white bg-white/5' : 'border-white/10 text-[#5a5a5a]'
            }`}
            title={soundEnabled ? 'Suara Beep Aktif' : 'Suara Beep Nonaktif'}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            <span className="text-[11px]">{soundEnabled ? 'Audio On' : 'Muted'}</span>
          </button>

          {isScanning ? (
            <button
              type="button"
              onClick={stopScanner}
              className="px-4 py-2 border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-light uppercase tracking-wider transition-colors cursor-pointer"
            >
              Matikan Kamera
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startScanner()}
              className="px-4 py-2 bg-white text-[#171717] hover:bg-white/90 text-xs font-light uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2"
            >
              <Camera size={14} />
              <span>Aktifkan Kamera</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="border border-white/10 bg-[#141414] p-4 flex flex-col items-center justify-center relative min-h-[340px]">
            {cameraError && (
              <div className="p-3 mb-4 w-full border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-light flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}

            <div
              id={scannerContainerId}
              className={`w-full max-w-[420px] aspect-square bg-[#0f0f0f] border border-white/15 overflow-hidden flex items-center justify-center relative ${
                !isScanning ? 'hidden' : 'block'
              }`}
            />

            {!isScanning && (
              <div className="text-center p-8 space-y-3">
                <div className="w-14 h-14 mx-auto border border-white/20 flex items-center justify-center bg-white/[0.02]">
                  <Camera size={24} className="text-[#9a9a9a]" />
                </div>
                <h3 className="text-sm font-light text-white m-0">Kamera Scanner Sedang Nonaktif</h3>
                <p className="text-xs text-[#9a9a9a] font-light max-w-xs mx-auto">
                  Klik tombol Aktifkan Kamera di atas untuk mulai memindai QR Code tiket di gate.
                </p>
              </div>
            )}

            {cameras.length > 1 && (
              <div className="w-full mt-4 pt-3 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
                <span className="text-[#9a9a9a] font-light flex items-center gap-1.5">
                  <FlipHorizontal size={13} /> Pilih Kamera:
                </span>
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    setSelectedCameraId(e.target.value);
                    if (isScanning) startScanner(e.target.value);
                  }}
                  className="bg-[#1c1c1c] border border-white/20 text-white text-xs px-2.5 py-1 outline-none"
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

          <form onSubmit={handleManualSubmit} className="p-4 border border-white/10 bg-[#1a1a1a] flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="text-[#9a9a9a] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Input kode tiket manual (cth: SYM-893472)..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-[#5a5a5a] outline-none focus:border-white/30"
              />
            </div>
            <button
              type="submit"
              disabled={!manualCode || isProcessing}
              className="px-5 py-2 bg-white text-[#171717] hover:bg-white/90 text-xs uppercase font-light cursor-pointer disabled:opacity-40"
            >
              {isProcessing ? 'Verifikasi...' : 'Cek Manual'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-5">
          <div className="border border-white/10 bg-[#1a1a1a] p-5 flex flex-col justify-between">
            <div className="border-b border-white/10 pb-3 mb-4 flex items-center justify-between">
              <span className="text-xs font-mono text-[#9a9a9a] uppercase tracking-wider">
                STATUS HASIL SCAN TERAKHIR
              </span>
              {scanResult && <span className="text-[11px] font-mono text-[#9a9a9a]">{scanResult.timestamp}</span>}
            </div>

            {scanResult ? (
              <div
                className={`p-5 border space-y-4 transition-all ${
                  scanResult.type === 'SUCCESS'
                    ? 'border-emerald-500/40 bg-emerald-950/20'
                    : scanResult.type === 'ALREADY_USED'
                    ? 'border-amber-500/40 bg-amber-950/20'
                    : 'border-rose-500/40 bg-rose-950/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  {scanResult.type === 'SUCCESS' ? (
                    <CheckCircle2 size={24} className="text-emerald-400 shrink-0" />
                  ) : scanResult.type === 'ALREADY_USED' ? (
                    <Clock size={24} className="text-amber-400 shrink-0" />
                  ) : (
                    <AlertCircle size={24} className="text-rose-400 shrink-0" />
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
                    <p className="text-xs text-white/80 font-light mt-0.5 m-0">{scanResult.message}</p>
                  </div>
                </div>

                {scanResult.order && (
                  <div className="pt-3 border-t border-white/10 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-[#9a9a9a] uppercase block">Kode Tiket</span>
                      <span className="font-mono text-white text-sm">{scanResult.order.orderCode}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9a9a9a] uppercase block">Pemegang</span>
                      <span className="text-white truncate block">{scanResult.order.userName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9a9a9a] uppercase block">Kategori</span>
                      <span className="text-white">{scanResult.order.categoryName} ({scanResult.order.quantity}x)</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#9a9a9a] uppercase block">Event Konser</span>
                      <span className="text-white truncate block">{scanResult.order.eventTitle}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-white/10 text-xs font-light text-[#9a9a9a]">
                Belum ada tiket yang dipindai pada sesi ini.
              </div>
            )}
          </div>

          <div className="border border-white/10 bg-[#1a1a1a] p-5 flex-1 flex flex-col">
            <div className="border-b border-white/10 pb-3 mb-3 flex items-center justify-between">
              <span className="text-xs font-mono text-[#9a9a9a] uppercase tracking-wider">
                RIWAYAT VERIFIKASI GATE ({scanHistory.length})
              </span>
              {scanHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setScanHistory([])}
                  className="text-[11px] text-[#9a9a9a] hover:text-white bg-transparent border-none cursor-pointer"
                >
                  Bersihkan
                </button>
              )}
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
              {scanHistory.length === 0 ? (
                <p className="text-xs text-[#5a5a5a] font-light text-center py-4">Riwayat scan kosong.</p>
              ) : (
                scanHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 border border-white/5 bg-[#141414] flex items-center justify-between text-xs font-light"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          item.type === 'SUCCESS'
                            ? 'bg-emerald-400'
                            : item.type === 'ALREADY_USED'
                            ? 'bg-amber-400'
                            : 'bg-rose-400'
                        }`}
                      />
                      <span className="font-mono text-white shrink-0">{item.order?.orderCode || 'UNKNOWN'}</span>
                      <span className="text-[#9a9a9a] truncate">{item.order?.userName || item.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#7a7a7a] shrink-0">{item.timestamp}</span>
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
