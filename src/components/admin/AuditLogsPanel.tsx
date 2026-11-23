import React, { useCallback, useEffect, useState } from 'react';
import {
  Search,
  Download,
  History,
  ShieldAlert,
  ShieldBan,
  ShieldCheck,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Ban,
} from 'lucide-react';
import {
  blockIPAPI,
  fetchBlockedIPsAPI,
  searchAdminAuditLogsAPI,
  unblockIPAPI,
  type AuditLogItem,
  type BlockedIPItem,
} from '../landing/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AuditLogsPanelProps {
  logs: AuditLogItem[];
  isLoading?: boolean;
  onNotify?: (message: string, type?: 'success' | 'error') => void;
}

function formatAuditTimestamp(iso?: string): string {
  if (!iso) return 'Permanen';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return '-';
  return (
    dt.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    }) + ' WIB'
  );
}

function getActionBadgeVariant(action: string): 'default' | 'destructive' | 'warning' | 'success' | 'secondary' {
  const up = (action || '').toUpperCase();
  if (up.includes('DELETE') || up.includes('REJECT') || up.includes('BLOCK') || up.includes('PROBE')) {
    return 'destructive';
  }
  if (up.includes('CREATE') || up.includes('CHECKIN') || up.includes('APPROVE') || up.includes('UNBLOCK')) {
    return 'success';
  }
  if (up.includes('RESET') || up.includes('TOGGLE') || up.includes('UPDATE') || up.includes('UNAUTHORIZED') || up.includes('FORBIDDEN') || up.includes('RATE_LIMIT')) {
    return 'warning';
  }
  if (up === 'ADMIN_LOGIN') return 'default';
  return 'secondary';
}

function getSeverityBadgeVariant(severity?: string): 'destructive' | 'warning' | 'secondary' {
  const up = (severity || 'INFO').toUpperCase();
  if (up === 'CRITICAL') return 'destructive';
  if (up === 'WARN') return 'warning';
  return 'secondary';
}

export const AuditLogsPanel: React.FC<AuditLogsPanelProps> = ({
  logs: initialLogs,
  isLoading: parentLoading,
  onNotify,
}) => {
  const [subView, setSubView] = useState<'LOGS' | 'BLOCKLIST'>('LOGS');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [ipFilter, setIpFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const limit = 25;

  const [items, setItems] = useState<AuditLogItem[]>(initialLogs);
  const [total, setTotal] = useState(initialLogs.length);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  const [blockedIPs, setBlockedIPs] = useState<BlockedIPItem[]>([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [blockedError, setBlockedError] = useState<string | null>(null);

  const [blockTargetIP, setBlockTargetIP] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [blockDuration, setBlockDuration] = useState('60');
  const [isSubmittingBlock, setIsSubmittingBlock] = useState(false);

  const loadFilteredLogs = useCallback(async (targetPage: number) => {
    setLoadingLogs(true);
    setLogsError(null);
    try {
      const res = await searchAdminAuditLogsAPI({
        category: categoryFilter,
        severity: severityFilter,
        role: roleFilter,
        ip: ipFilter,
        search,
        from: fromDate,
        to: toDate,
        page: targetPage,
        limit,
      });
      if (res.success && res.data) {
        if (Array.isArray(res.data)) {
          setItems(res.data);
          setTotal(res.data.length);
        } else {
          setItems(res.data.items || []);
          setTotal(res.data.total || 0);
        }
      } else if (initialLogs.length > 0 && targetPage === 1) {
        setItems(initialLogs);
        setTotal(initialLogs.length);
      } else {
        setLogsError(res.message || 'Gagal memuat log audit keamanan.');
      }
    } catch {
      if (initialLogs.length > 0 && targetPage === 1) {
        setItems(initialLogs);
        setTotal(initialLogs.length);
      } else {
        setLogsError('Terjadi kesalahan jaringan saat memuat log audit.');
      }
    } finally {
      setLoadingLogs(false);
    }
  }, [categoryFilter, severityFilter, roleFilter, ipFilter, search, fromDate, toDate, initialLogs]);

  const loadBlockedIPs = useCallback(async () => {
    setLoadingBlocked(true);
    setBlockedError(null);
    try {
      const res = await fetchBlockedIPsAPI(true);
      if (res.success && Array.isArray(res.data)) {
        setBlockedIPs(res.data);
      } else {
        setBlockedError(res.message || 'Gagal memuat daftar IP diblokir.');
      }
    } catch {
      setBlockedError('Terjadi kesalahan jaringan saat memuat daftar blokir IP.');
    } finally {
      setLoadingBlocked(false);
    }
  }, []);

  useEffect(() => {
    void loadFilteredLogs(page);
  }, [page, loadFilteredLogs]);

  useEffect(() => {
    void loadBlockedIPs();
  }, [loadBlockedIPs]);

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('ALL');
    setSeverityFilter('ALL');
    setRoleFilter('ALL');
    setIpFilter('');
    setFromDate('');
    setToDate('');
    setPage(1);
  };

  const handleBlockIPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIP = blockTargetIP.trim();
    if (!cleanIP) {
      onNotify?.('Masukkan alamat IP yang ingin diblokir.', 'error');
      return;
    }
    setIsSubmittingBlock(true);
    try {
      const res = await blockIPAPI({
        ipAddress: cleanIP,
        reason: blockReason.trim() || 'Aktivitas mencurigakan terdeteksi di log audit',
        durationMinutes: parseInt(blockDuration, 10) || 0,
      });
      if (res.success) {
        onNotify?.(res.message || `IP ${cleanIP} berhasil diblokir.`, 'success');
        setBlockTargetIP('');
        setBlockReason('');
        await Promise.all([loadBlockedIPs(), loadFilteredLogs(1)]);
      } else {
        onNotify?.(res.message || 'Gagal memblokir IP.', 'error');
      }
    } catch {
      onNotify?.('Kesalahan jaringan saat memblokir IP.', 'error');
    } finally {
      setIsSubmittingBlock(false);
    }
  };

  const handleUnblockIP = async (idOrIp: string) => {
    try {
      const res = await unblockIPAPI(idOrIp);
      if (res.success) {
        onNotify?.(res.message || 'Blokir IP berhasil dibuka.', 'success');
        await Promise.all([loadBlockedIPs(), loadFilteredLogs(page)]);
      } else {
        onNotify?.(res.message || 'Gagal membuka blokir IP.', 'error');
      }
    } catch {
      onNotify?.('Kesalahan jaringan saat membuka blokir IP.', 'error');
    }
  };

  const handleQuickBlockFromRow = (ip: string) => {
    setBlockTargetIP(ip);
    setBlockReason('Aktivitas mencurigakan dari log audit');
    setSubView('BLOCKLIST');
  };

  const handleExportAuditCSV = () => {
    if (items.length === 0) return;
    const headers = [
      'Waktu',
      'Kategori',
      'Severity',
      'Status HTTP',
      'ID Aktor',
      'Nama Aktor',
      'Peran',
      'Aksi',
      'Target Resource',
      'Detail',
      'Alamat IP',
    ];
    const rows = items.map((l) =>
      [
        `"${formatAuditTimestamp(l.createdAt)}"`,
        `"${l.category || 'OPERATIONAL'}"`,
        `"${l.severity || 'INFO'}"`,
        `"${l.statusCode ?? 200}"`,
        `"${l.actorId}"`,
        `"${l.actorName.replace(/"/g, '""')}"`,
        `"${l.actorRole}"`,
        `"${l.action}"`,
        `"${l.targetResource.replace(/"/g, '""')}"`,
        `"${l.details.replace(/"/g, '""')}"`,
        `"${l.ipAddress}"`,
      ].join(',')
    );
    const csv = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers.join(','), ...rows].join('\n'));
    const link = document.createElement('a');
    link.href = csv;
    link.download = `SymphoniaTic_AuditLogs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const blockedSet = new Set(blockedIPs.map((b) => b.ipAddress));
  const isBusy = Boolean(parentLoading) || loadingLogs;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card className="rounded-none border-border">
        <CardContent className="p-5 sm:p-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h2 className="text-base font-semibold text-card-foreground tracking-tight m-0">
              Log Audit Aktivitas &amp; Pertahanan Keamanan
            </h2>
            <p className="text-xs text-muted-foreground mt-1 m-0 leading-relaxed">
              Pantau jejak operasional, percobaan autentikasi gagal, pemindaian ilegal, dan kelola pemblokiran IP aktif.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={subView === 'LOGS' ? 'default' : 'outline'}
              onClick={() => setSubView('LOGS')}
              className="rounded-none min-h-[40px]"
            >
              <History size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>Log Audit ({total})</span>
            </Button>
            <Button
              type="button"
              variant={subView === 'BLOCKLIST' ? 'default' : 'outline'}
              onClick={() => setSubView('BLOCKLIST')}
              className="rounded-none min-h-[40px]"
            >
              <ShieldBan size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>IP Diblokir ({blockedIPs.length})</span>
            </Button>
            {subView === 'LOGS' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleExportAuditCSV}
                disabled={items.length === 0}
                className="rounded-none min-h-[40px]"
              >
                <Download size={15} strokeWidth={1.7} aria-hidden="true" />
                <span>Ekspor CSV</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {subView === 'BLOCKLIST' ? (
        <div className="flex flex-col gap-6">
          <Card className="rounded-none border-border">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert size={16} className="text-destructive" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-foreground m-0">
                  Blokir Alamat IP Secara Manual
                </h3>
              </div>
              <form onSubmit={handleBlockIPSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-3">
                  <label htmlFor="block-ip-input" className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Alamat IP
                  </label>
                  <Input
                    id="block-ip-input"
                    type="text"
                    placeholder="Contoh: 203.0.113.45"
                    value={blockTargetIP}
                    onChange={(e) => setBlockTargetIP(e.target.value)}
                    className="rounded-none font-mono text-xs"
                  />
                </div>
                <div className="sm:col-span-4">
                  <label htmlFor="block-reason-input" className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Alasan Pemblokiran
                  </label>
                  <Input
                    id="block-reason-input"
                    type="text"
                    placeholder="Brute force login / spam OTP"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    className="rounded-none text-xs"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="block-duration-select" className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Durasi Blokir
                  </label>
                  <Select value={blockDuration} onValueChange={setBlockDuration}>
                    <SelectTrigger id="block-duration-select" className="rounded-none">
                      <SelectValue placeholder="Pilih durasi" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      <SelectItem value="15">15 Menit</SelectItem>
                      <SelectItem value="60">1 Jam</SelectItem>
                      <SelectItem value="1440">24 Jam</SelectItem>
                      <SelectItem value="0">Permanen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={isSubmittingBlock}
                    className="w-full rounded-none min-h-[40px]"
                  >
                    <Ban size={14} aria-hidden="true" />
                    <span>{isSubmittingBlock ? 'Memproses...' : 'Blokir IP'}</span>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {loadingBlocked ? (
            <Card className="p-6 space-y-3 rounded-none">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-none" />
              ))}
            </Card>
          ) : blockedError ? (
            <Card className="rounded-none border-destructive/40">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-destructive m-0">{blockedError}</p>
                <Button type="button" variant="outline" onClick={() => void loadBlockedIPs()} className="rounded-none">
                  <RefreshCw size={14} aria-hidden="true" />
                  <span>Coba Lagi</span>
                </Button>
              </CardContent>
            </Card>
          ) : blockedIPs.length === 0 ? (
            <Card className="border-dashed border-border-strong rounded-none">
              <CardContent className="p-10 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-none border border-border bg-background flex items-center justify-center mb-3">
                  <ShieldCheck className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} aria-hidden="true" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground m-0">
                  Tidak Ada IP yang Diblokir
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 mb-0 max-w-md">
                  Alamat IP yang diblokir otomatis oleh sistem pertahanan atau secara manual oleh Super Admin akan tampil di sini.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-none overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Alamat IP</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Alasan</TableHead>
                    <TableHead>Diblokir Oleh</TableHead>
                    <TableHead>Kedaluwarsa</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedIPs.map((blk) => (
                    <TableRow key={blk.id}>
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        {blk.ipAddress}
                      </TableCell>
                      <TableCell>
                        <Badge variant={blk.isAuto ? 'destructive' : 'warning'} className="rounded-none font-mono text-[10px]">
                          {blk.isAuto ? 'AUTO-BAN' : 'MANUAL'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-sm">
                        {blk.reason}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-foreground">
                        {blk.blockedBy}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {formatAuditTimestamp(blk.expiresAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => void handleUnblockIP(blk.ipAddress)}
                          className="rounded-none"
                        >
                          Buka Blokir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      ) : (
        <>
          <Card className="rounded-none border-border">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="relative lg:col-span-2">
                  <Search
                    size={16}
                    strokeWidth={1.7}
                    className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <Input
                    type="text"
                    aria-label="Cari aktor, resource, detail, atau IP"
                    placeholder="Cari aktor, resource, detail, atau IP..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10 rounded-none"
                  />
                </div>

                <Select
                  value={categoryFilter}
                  onValueChange={(v) => {
                    setCategoryFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger aria-label="Filter kategori audit" className="rounded-none">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="ALL">Semua Kategori</SelectItem>
                    <SelectItem value="OPERATIONAL">OPERATIONAL</SelectItem>
                    <SelectItem value="AUTH">AUTH</SelectItem>
                    <SelectItem value="SECURITY">SECURITY</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={severityFilter}
                  onValueChange={(v) => {
                    setSeverityFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger aria-label="Filter tingkat keparahan" className="rounded-none">
                    <SelectValue placeholder="Semua Severity" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="ALL">Semua Severity</SelectItem>
                    <SelectItem value="INFO">INFO</SelectItem>
                    <SelectItem value="WARN">WARN</SelectItem>
                    <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={roleFilter}
                  onValueChange={(v) => {
                    setRoleFilter(v);
                    setPage(1);
                  }}
                >
                  <SelectTrigger aria-label="Filter peran aktor" className="rounded-none">
                    <SelectValue placeholder="Semua Peran" />
                  </SelectTrigger>
                  <SelectContent className="rounded-none">
                    <SelectItem value="ALL">Semua Peran</SelectItem>
                    <SelectItem value="SUPER_ADMIN">SUPER_ADMIN</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="PETUGAS">PETUGAS</SelectItem>
                    <SelectItem value="USER">USER</SelectItem>
                    <SelectItem value="ANONYMOUS">ANONYMOUS</SelectItem>
                    <SelectItem value="SYSTEM">SYSTEM</SelectItem>
                  </SelectContent>
                </Select>

                <Input
                  type="text"
                  aria-label="Filter IP Address"
                  placeholder="Filter IP (mis. 127.0.0.1)"
                  value={ipFilter}
                  onChange={(e) => {
                    setIpFilter(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-none font-mono text-xs"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Rentang Tanggal:
                  </span>
                  <Input
                    type="date"
                    aria-label="Tanggal mulai"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-auto rounded-none text-xs font-mono"
                  />
                  <span className="text-xs text-muted-foreground">s/d</span>
                  <Input
                    type="date"
                    aria-label="Tanggal akhir"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(1);
                    }}
                    className="w-auto rounded-none text-xs font-mono"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleResetFilters} className="rounded-none">
                    Reset Filter
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void loadFilteredLogs(page)} className="rounded-none">
                    <RefreshCw size={13} aria-hidden="true" />
                    <span>Muat Ulang</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isBusy && items.length === 0 ? (
            <Card className="p-6 space-y-3 rounded-none">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-none" />
              ))}
            </Card>
          ) : logsError ? (
            <Card className="rounded-none border-destructive/40">
              <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <p className="text-sm text-destructive m-0">{logsError}</p>
                <Button type="button" variant="outline" onClick={() => void loadFilteredLogs(page)} className="rounded-none">
                  <RefreshCw size={14} aria-hidden="true" />
                  <span>Coba Lagi</span>
                </Button>
              </CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Card className="border-dashed border-border-strong rounded-none">
              <CardContent className="p-10 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-none border border-border bg-background flex items-center justify-center mb-3">
                  <History className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} aria-hidden="true" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground m-0">
                  Tidak Ada Catatan Audit yang Cocok
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 mb-0 max-w-md">
                  Sesuaikan filter kategori, tingkat keparahan, atau rentang tanggal untuk menelusuri aktivitas lainnya.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="hidden md:block overflow-hidden rounded-none">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Waktu</TableHead>
                      <TableHead>Kategori &amp; Severity</TableHead>
                      <TableHead>Aktor &amp; Peran</TableHead>
                      <TableHead>Aksi &amp; Target</TableHead>
                      <TableHead className="text-right">IP &amp; Tindakan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((log) => {
                      const isBlocked = Boolean(log.ipAddress && blockedSet.has(log.ipAddress));
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                            {formatAuditTimestamp(log.createdAt)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-start gap-1">
                              <Badge variant={getSeverityBadgeVariant(log.severity)} className="rounded-none font-mono text-[10px]">
                                {log.severity || 'INFO'}
                              </Badge>
                              <span className="font-mono text-[10px] text-muted-foreground">
                                {log.category || 'OPERATIONAL'} ({log.statusCode ?? 200})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="block text-xs font-semibold text-foreground">{log.actorName}</span>
                            <Badge variant="outline" className="rounded-none font-mono text-[10px] mt-1">
                              {log.actorRole}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getActionBadgeVariant(log.action)} className="rounded-none font-mono text-[10px] mb-1">
                              {log.action}
                            </Badge>
                            <span className="block font-mono text-xs font-semibold text-foreground">
                              {log.targetResource}
                            </span>
                            {log.details && (
                              <span className="block text-xs text-muted-foreground mt-0.5 max-w-md">
                                {log.details}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-1.5">
                              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                                {log.ipAddress || '-'}
                              </span>
                              {log.ipAddress && (
                                isBlocked ? (
                                  <Badge variant="destructive" className="rounded-none font-mono text-[10px]">
                                    TERBLOKIR
                                  </Badge>
                                ) : (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickBlockFromRow(log.ipAddress)}
                                    className="rounded-none h-7 px-2 text-[11px]"
                                  >
                                    Blokir IP
                                  </Button>
                                )
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>

              <div className="grid grid-cols-1 gap-3.5 md:hidden">
                {items.map((log) => (
                  <Card key={log.id} className="p-4 space-y-2.5 rounded-none">
                    <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                      <div className="flex items-center gap-1.5">
                        <Badge variant={getSeverityBadgeVariant(log.severity)} className="rounded-none font-mono text-[10px]">
                          {log.severity || 'INFO'}
                        </Badge>
                        <Badge variant={getActionBadgeVariant(log.action)} className="rounded-none font-mono text-[10px]">
                          {log.action}
                        </Badge>
                      </div>
                      <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                        {formatAuditTimestamp(log.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="font-mono text-xs font-semibold text-foreground block break-all">
                        {log.targetResource}
                      </span>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1 mb-0 leading-relaxed">
                          {log.details}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-medium text-foreground truncate">{log.actorName}</span>
                        <Badge variant="outline" className="rounded-none font-mono text-[10px] shrink-0">
                          {log.actorRole}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {log.ipAddress || '-'}
                        </span>
                        {log.ipAddress && !blockedSet.has(log.ipAddress) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickBlockFromRow(log.ipAddress)}
                            className="rounded-none min-h-[36px] text-[11px]"
                          >
                            Blokir
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground font-mono">
                  Menampilkan halaman {page} dari {totalPages} (total {total} catatan)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="rounded-none min-h-[36px]"
                  >
                    <ChevronLeft size={14} aria-hidden="true" />
                    <span>Sebelumnya</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="rounded-none min-h-[36px]"
                  >
                    <span>Berikutnya</span>
                    <ChevronRight size={14} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
