import React, { useMemo, useState } from 'react';
import { Search, Download, History } from 'lucide-react';
import type { AuditLogItem } from '../landing/data';
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
}

function formatAuditTimestamp(iso: string): string {
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
  if (up.includes('DELETE') || up.includes('REJECT')) return 'destructive';
  if (up.includes('CREATE') || up.includes('CHECKIN') || up.includes('APPROVE')) return 'success';
  if (up.includes('RESET') || up.includes('TOGGLE') || up.includes('UPDATE')) return 'warning';
  if (up === 'ADMIN_LOGIN') return 'default';
  return 'secondary';
}

export const AuditLogsPanel: React.FC<AuditLogsPanelProps> = ({ logs, isLoading }) => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const distinctActions = useMemo(() => {
    const set = new Set<string>();
    for (const l of logs) {
      if (l.action) set.add(l.action);
    }
    return Array.from(set).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return logs.filter((entry) => {
      const matchAction = actionFilter === 'ALL' || entry.action === actionFilter;
      const matchQuery =
        !q ||
        entry.actorName.toLowerCase().includes(q) ||
        entry.action.toLowerCase().includes(q) ||
        entry.targetResource.toLowerCase().includes(q) ||
        entry.details.toLowerCase().includes(q) ||
        entry.ipAddress.toLowerCase().includes(q);
      return matchAction && matchQuery;
    });
  }, [logs, actionFilter, search]);

  const handleExportAuditCSV = () => {
    if (filteredLogs.length === 0) return;
    const headers = ['Waktu', 'ID Aktor', 'Nama Aktor', 'Peran', 'Aksi', 'Target Resource', 'Detail', 'Alamat IP'];
    const rows = filteredLogs.map((l) =>
      [
        `"${formatAuditTimestamp(l.createdAt)}"`,
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

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card>
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-base font-semibold text-card-foreground tracking-tight m-0">
              Log Audit Aktivitas Operasional &amp; Keamanan
            </h2>
            <p className="text-xs text-muted-foreground mt-1 m-0 leading-relaxed">
              Rekam jejak kronologis setiap perubahan data konser, persetujuan refund, transaksi promo, dan manajemen staf.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleExportAuditCSV}
            disabled={filteredLogs.length === 0}
            className="shrink-0"
          >
            <Download size={15} strokeWidth={1.7} aria-hidden="true" />
            <span>Ekspor Audit CSV</span>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={16}
              strokeWidth={1.7}
              className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <Input
              type="text"
              aria-label="Cari aktor, resource, detail, atau IP"
              placeholder="Cari aktor, resource, detail perubahan, atau IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger aria-label="Filter jenis aksi audit" className="sm:w-56">
              <SelectValue placeholder="Semua Jenis Aksi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Jenis Aksi</SelectItem>
              {distinctActions.map((act) => (
                <SelectItem key={act} value={act}>
                  {act}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading && logs.length === 0 ? (
        <Card className="p-6 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </Card>
      ) : filteredLogs.length === 0 ? (
        <Card className="border-dashed border-border-strong">
          <CardContent className="p-10 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-none border border-border bg-background flex items-center justify-center mb-3">
              <History className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} aria-hidden="true" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground m-0">
              Belum Ada Catatan Audit
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5 mb-0 max-w-md">
              Aktivitas operasional staf dan perubahan sistem akan otomatis terekam di halaman ini secara kronologis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="hidden md:block overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Waktu</TableHead>
                  <TableHead>Aktor &amp; Peran</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead>Target &amp; Rincian</TableHead>
                  <TableHead className="text-right">IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap tabular-nums">
                      {formatAuditTimestamp(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <span className="block text-xs font-semibold text-foreground">{log.actorName}</span>
                      <Badge variant="outline" className="font-mono text-[10px] mt-1">
                        {log.actorRole}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getActionBadgeVariant(log.action)} className="font-mono text-[10px]">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="block font-mono text-xs font-semibold text-foreground">
                        {log.targetResource}
                      </span>
                      {log.details && (
                        <span className="block text-xs text-muted-foreground mt-0.5 max-w-md">
                          {log.details}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground tabular-nums">
                      {log.ipAddress || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="grid grid-cols-1 gap-3.5 md:hidden">
            {filteredLogs.map((log) => (
              <Card key={log.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
                  <Badge variant={getActionBadgeVariant(log.action)} className="font-mono text-[10px]">
                    {log.action}
                  </Badge>
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
                <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-foreground truncate">{log.actorName}</span>
                    <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                      {log.actorRole}
                    </Badge>
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                    {log.ipAddress || '-'}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
