import React, { useState, useEffect, useRef } from 'react';
import type { Html5Qrcode as Html5QrcodeType } from 'html5-qrcode';
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
  RefreshCw,
  Upload,
  ShieldAlert,
} from 'lucide-react';
import {
  checkInTicketAPI,
  fetchGateAttendanceAPI,
  type EventItem,
  type GateAttendanceSummary,
  type OrderRecord,
} from '../landing/data';
import { normalizeTicketScanPayload } from '@/lib/qrPayload';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export const GateScannerPanel: React.FC<GateScannerPanelProps> = ({
  events = [],
  onScanSuccess,
}) => {
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
  const [bypassOpenGate, setBypassOpenGate] = useState(false);

  const html5QrCodeRef = useRef<Html5QrcodeType | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bypassOpenGateRef = useRef(false);
  const soundEnabledRef = useRef(true);
  const selectedEventIdRef = useRef('');
  const isProcessingRef = useRef(false);
  const scannerContainerId = 'gate-qr-reader-container';
  const fileScannerContainerId = 'gate-qr-file-reader';

  useEffect(() => {
    bypassOpenGateRef.current = bypassOpenGate;
  }, [bypassOpenGate]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    selectedEventIdRef.current = selectedEventId;
  }, [selectedEventId]);

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
    if (!soundEnabledRef.current || typeof window === 'undefined') return;
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
        const { Html5Qrcode } = await import('html5-qrcode');
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices);
          const backCam = devices.find(
            (d) =>
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

  const handleVerifyCode = async (rawCode: string, skipDebounce = false) => {
    if (!rawCode) return;
    const code = normalizeTicketScanPayload(rawCode);
    if (!code) return;
    const nowTs = Date.now();

    if (!skipDebounce && lastScannedCodeRef.current === code && nowTs - lastScannedTimeRef.current < 3000) {
      return;
    }
    if (isProcessingRef.current) return;

    lastScannedCodeRef.current = code;
    lastScannedTimeRef.current = nowTs;
    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      const res = await checkInTicketAPI(code, bypassOpenGateRef.current);
      const now = new Date().toLocaleTimeString('id-ID');

      if (res.success && res.data) {
        playBeep('success');
        const seatProgress = res.data.checkedInSeats
          ? ` · Kursi masuk: ${res.data.checkedInSeats}`
          : '';
        const result: ScanResultState = {
          type: 'SUCCESS',
          title: 'CHECK-IN BERHASIL (VALID)',
          message: `${res.message || `Tiket sah untuk ${res.data.userName}`} (${res.data.categoryName}${seatProgress})`,
          order: res.data,
          timestamp: now,
        };
        setScanResult(result);
        setScanHistory((prev) => [result, ...prev.slice(0, 19)]);
        void loadAttendance(selectedEventIdRef.current);
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
        let errMsg = res.message || 'Kode tiket tidak ditemukan di sistem database.';
        const lowerMsg = (res.message || '').toLowerCase();
        if (lowerMsg.includes('belum dibuka')) {
          errTitle = 'GERBANG BELUM DIBUKA';
          if (!bypassOpenGateRef.current) {
            errMsg = `${errMsg} Aktifkan tombol "Mode Uji Coba Gate" jika ingin melakukan gladi/uji pemindaian lebih awal.`;
          }
        } else if (lowerMsg.includes('telah selesai') || lowerMsg.includes('kedaluwarsa')) {
          errTitle = 'KONSER TELAH BERAKHIR';
        } else if (lowerMsg.includes('telah ditutup')) {
          errTitle = 'KONSER DITUTUP PANITIA';
        }

        const result: ScanResultState = {
          type: 'ERROR',
          title: errTitle,
          message: errMsg,
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
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  const waitForNextFrame = () =>
    new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

  const startScanner = async (camId?: string) => {
    setCameraError('');

    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setCameraError(
        'Akses kamera langsung diblokir browser karena halaman dibuka melalui HTTP non-localhost. Gunakan tombol "Unggah Foto QR" atau input manual.'
      );
      setIsScanning(false);
      return;
    }

    setIsScanning(true);
    await waitForNextFrame();

    try {
      const { Html5Qrcode } = await import('html5-qrcode');

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
    } catch (err) {
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
      setCameraError(
        'Gagal mengakses kamera. Pastikan izin kamera aktif atau gunakan tombol "Unggah Foto QR".'
      );
      setIsScanning(false);
    }
  };

  const handleScanImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setCameraError('');
    setIsProcessing(true);
    isProcessingRef.current = true;
    let fileScanner: Html5QrcodeType | null = null;
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      fileScanner = new Html5Qrcode(fileScannerContainerId);
      const decodedText = await fileScanner.scanFile(file, false);
      fileScanner.clear();
      fileScanner = null;
      isProcessingRef.current = false;
      setIsProcessing(false);
      await handleVerifyCode(decodedText, true);
    } catch (err) {
      console.error('QR file scan error:', err);
      if (fileScanner) {
        try {
          fileScanner.clear();
        } catch {}
      }
      playBeep('error');
      setCameraError('QR Code tidak terbaca pada gambar tersebut. Pastikan gambar jelas dan tidak terpotong.');
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {}
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode) return;
    handleVerifyCode(manualCode, true);
    setManualCode('');
  };

  const attendancePct = attendance ? Math.min(100, Math.round(attendance.checkInPercentage)) : 0;

  return (
    <div className="space-y-6 pb-8">
      <Card>
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-1">
              <h2 className="text-base font-semibold text-card-foreground tracking-tight m-0">
                Pemindai Gate Masuk (QR Scanner)
              </h2>
              <Badge variant={isScanning ? 'success' : 'secondary'} className="font-mono text-[11px]">
                {isScanning ? 'Kamera Aktif' : 'Siap Memindai'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground m-0 leading-relaxed">
              Arahkan kamera ke QR Code E-Ticket penonton atau masukkan kode manual untuk validasi pintu masuk.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <Button
              type="button"
              variant={bypassOpenGate ? 'default' : 'outline'}
              onClick={() => setBypassOpenGate((prev) => !prev)}
              aria-pressed={bypassOpenGate}
              className="min-h-[44px]"
              title="Izinkan pemindaian tiket meski waktu Open Gate konser belum dimulai (mode gladi / uji coba)"
            >
              <ShieldAlert size={16} aria-hidden="true" />
              <span>{bypassOpenGate ? 'Bypass Open Gate: Aktif' : 'Mode Uji Coba Gate'}</span>
            </Button>

            <Button
              type="button"
              variant={soundEnabled ? 'secondary' : 'outline'}
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-pressed={soundEnabled}
              className="min-h-[44px]"
            >
              {soundEnabled ? <Volume2 size={16} aria-hidden="true" /> : <VolumeX size={16} aria-hidden="true" />}
              <span>{soundEnabled ? 'Audio On' : 'Muted'}</span>
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleScanImageFile}
              className="hidden"
              aria-label="Pilih gambar QR Code tiket"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="min-h-[44px]"
            >
              <Upload size={16} aria-hidden="true" />
              <span>Unggah Foto QR</span>
            </Button>

            {isScanning ? (
              <Button type="button" variant="destructive" onClick={stopScanner} className="min-h-[44px]">
                Matikan Kamera
              </Button>
            ) : (
              <Button type="button" variant="default" onClick={() => startScanner()} className="min-h-[44px]">
                <Camera size={16} aria-hidden="true" />
                <span>Aktifkan Kamera</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-none border border-[#156E3F]/30 bg-[#156E3F]/10 dark:border-emerald-500/30 dark:bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Users size={16} className="text-[#156E3F] dark:text-emerald-400" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-card-foreground m-0">
                  Progres Kehadiran Penonton
                </h3>
                <p className="text-xs text-muted-foreground m-0 tabular-nums">
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
                <Select
                  value={selectedEventId || 'ALL'}
                  onValueChange={(val) => setSelectedEventId(val === 'ALL' ? '' : val)}
                >
                  <SelectTrigger aria-label="Filter kehadiran per konser" className="w-full sm:w-[230px] text-xs">
                    <SelectValue placeholder="Semua Konser" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Semua Konser</SelectItem>
                    {events.map((evt) => (
                      <SelectItem key={evt.id} value={String(evt.id)}>
                        {evt.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => loadAttendance(selectedEventId)}
                disabled={isAttendanceLoading}
                aria-label="Segarkan progres kehadiran"
              >
                <RefreshCw
                  size={14}
                  className={isAttendanceLoading ? 'animate-spin' : ''}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">Segarkan</span>
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Progress
              value={attendancePct}
              aria-label="Persentase kehadiran penonton"
              indicatorClassName="bg-[#156E3F] dark:bg-emerald-500"
            />
            {attendance && (
              <div className="flex justify-between items-center text-[11px] font-mono text-muted-foreground tabular-nums">
                <span>Sudah Masuk: {attendance.totalCheckedIn}</span>
                <span>Belum Masuk: {attendance.remainingCheckIn}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-5">
          <Card className="p-5 flex flex-col items-center justify-center relative min-h-[340px]">
            {cameraError && (
              <div
                role="alert"
                className="p-3.5 mb-4 w-full rounded-none border border-[#C81E1E]/35 bg-[#C81E1E]/10 text-[#C81E1E] dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-200 text-xs flex items-center gap-2.5"
              >
                <AlertCircle size={16} className="shrink-0" aria-hidden="true" />
                <span>{cameraError}</span>
              </div>
            )}

            <div id={fileScannerContainerId} className="hidden" aria-hidden="true" />

            <div className="w-full max-w-[400px] aspect-square bg-background border border-border rounded-none overflow-hidden flex items-center justify-center relative">
              <div
                id={scannerContainerId}
                className={`w-full h-full flex items-center justify-center ${
                  isScanning ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              />

              {!isScanning && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-8 space-y-3 bg-background">
                  <div className="w-14 h-14 mx-auto rounded-none border border-border-strong flex items-center justify-center bg-background">
                    <Camera size={24} className="text-foreground dark:text-[#D4FF2A]" aria-hidden="true" />
                  </div>
                  <h3 className="text-sm font-semibold text-card-foreground m-0">
                    Kamera Scanner Sedang Nonaktif
                  </h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                    Klik Aktifkan Kamera di atas untuk memindai langsung, atau gunakan Unggah Foto QR jika kamera tidak tersedia.
                  </p>
                </div>
              )}
            </div>

            {cameras.length > 1 && (
              <div className="w-full mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <FlipHorizontal size={14} aria-hidden="true" /> Pilih Kamera:
                </span>
                <Select
                  value={selectedCameraId}
                  onValueChange={(val) => {
                    setSelectedCameraId(val);
                    if (isScanning) startScanner(val);
                  }}
                >
                  <SelectTrigger aria-label="Pilih kamera scanner" className="w-full sm:w-[240px] text-xs">
                    <SelectValue placeholder="Pilih Kamera" />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.label || `Kamera ${c.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </Card>

          <Card>
            <form onSubmit={handleManualSubmit} className="p-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search
                  size={16}
                  className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <Input
                  type="text"
                  aria-label="Input kode tiket manual"
                  placeholder="Input kode tiket manual (cth: SYM-893472)..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                type="submit"
                variant="dark"
                disabled={!manualCode || isProcessing}
                className="shrink-0"
              >
                {isProcessing ? 'Verifikasi...' : 'Cek Manual'}
              </Button>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-5">
          <Card className="p-5 flex flex-col justify-between">
            <div className="border-b border-border pb-3 mb-4 flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold">
                Status Hasil Scan Terakhir
              </span>
              {scanResult && (
                <span className="text-xs font-mono text-foreground font-medium">
                  {scanResult.timestamp}
                </span>
              )}
            </div>

            {scanResult ? (
              <div
                role="status"
                className={`p-5 rounded-none border space-y-4 ${
                  scanResult.type === 'SUCCESS'
                    ? 'border-[#156E3F]/35 bg-[#156E3F]/10 dark:border-emerald-500/40 dark:bg-emerald-950/35'
                    : scanResult.type === 'ALREADY_USED'
                    ? 'border-[#8A5A00]/35 bg-[#8A5A00]/10 dark:border-amber-500/40 dark:bg-amber-950/35'
                    : 'border-[#C81E1E]/35 bg-[#C81E1E]/10 dark:border-rose-500/40 dark:bg-rose-950/35'
                }`}
              >
                <div className="flex items-start gap-3">
                  {scanResult.type === 'SUCCESS' ? (
                    <CheckCircle2
                      size={24}
                      className="text-[#156E3F] dark:text-emerald-400 shrink-0"
                      aria-hidden="true"
                    />
                  ) : scanResult.type === 'ALREADY_USED' ? (
                    <Clock
                      size={24}
                      className="text-[#8A5A00] dark:text-amber-400 shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <AlertCircle
                      size={24}
                      className="text-[#C81E1E] dark:text-rose-400 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <div>
                    <h3
                      className={`text-sm font-semibold tracking-wide m-0 ${
                        scanResult.type === 'SUCCESS'
                          ? 'text-[#156E3F] dark:text-emerald-300'
                          : scanResult.type === 'ALREADY_USED'
                          ? 'text-[#8A5A00] dark:text-amber-300'
                          : 'text-[#C81E1E] dark:text-rose-300'
                      }`}
                    >
                      {scanResult.title}
                    </h3>
                    <p className="text-xs text-foreground mt-1 m-0 leading-relaxed">
                      {scanResult.message}
                    </p>
                  </div>
                </div>

                {scanResult.order && (
                  <div className="pt-3 border-t border-border grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[11px] text-muted-foreground uppercase block">
                        Kode Tiket
                      </span>
                      <span className="font-mono text-foreground font-semibold text-sm">
                        {scanResult.order.orderCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground uppercase block">
                        Pemilik Kursi
                      </span>
                      <span className="text-foreground truncate block font-medium">
                        {scanResult.order.checkedInAttendee || scanResult.order.userName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground uppercase block">
                        Kategori &amp; Kursi
                      </span>
                      <span className="text-foreground">
                        {scanResult.order.categoryName} ({scanResult.order.quantity}x)
                        {scanResult.order.checkedInSeat || scanResult.order.seatNumbers
                          ? ` · ${scanResult.order.checkedInSeat || scanResult.order.seatNumbers}`
                          : ''}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground uppercase block">
                        Event Konser
                      </span>
                      <span className="text-foreground truncate block">
                        {scanResult.order.eventTitle}
                      </span>
                    </div>
                    {scanResult.order.checkedInAt && (
                      <div className="col-span-2">
                        <span className="text-[11px] text-muted-foreground uppercase block">
                          Waktu Check-In Tercatat
                        </span>
                        <span className="font-mono text-foreground font-medium">
                          {new Date(scanResult.order.checkedInAt).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          WIB
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-border-strong rounded-none text-xs text-muted-foreground bg-background">
                Belum ada tiket yang dipindai pada sesi ini.
              </div>
            )}
          </Card>

          <Card className="p-5 flex-1 flex flex-col">
            <div className="border-b border-border pb-3 mb-3 flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider font-semibold">
                Riwayat Verifikasi Gate ({scanHistory.length})
              </span>
              {scanHistory.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setScanHistory([])}
                  className="h-8 min-h-[32px] px-2 text-xs"
                >
                  Bersihkan
                </Button>
              )}
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[240px] pr-1">
              {scanHistory.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4 m-0">
                  Riwayat scan masih kosong.
                </p>
              ) : (
                scanHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 border border-border bg-background rounded-none flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        aria-hidden="true"
                        className={`w-2 h-2 rounded-none shrink-0 ${
                          item.type === 'SUCCESS'
                            ? 'bg-[#156E3F] dark:bg-emerald-400'
                            : item.type === 'ALREADY_USED'
                            ? 'bg-[#8A5A00] dark:bg-amber-400'
                            : 'bg-[#C81E1E] dark:bg-rose-400'
                        }`}
                      />
                      <span className="font-mono text-foreground font-semibold shrink-0">
                        {item.order?.orderCode || 'UNKNOWN'}
                      </span>
                      <span className="text-muted-foreground truncate">
                        {item.order?.userName || item.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground shrink-0 tabular-nums">
                      {item.timestamp}
                    </span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
