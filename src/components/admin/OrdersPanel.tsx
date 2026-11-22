import React from 'react';
import { Search, Download, CheckCircle2, Lock } from 'lucide-react';
import type { AdminRole, OrderRecord } from '../landing/data';
import { formatIDR } from '../landing/data';
import { StatusBadge } from './ui';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

interface OrdersPanelProps {
  orders: OrderRecord[];
  role?: AdminRole;
  isLoading?: boolean;
  checkingInCode?: string | null;
  search: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onUpdateStatus: (orderId: string, status: string) => void;
  onManualCheckIn?: (order: OrderRecord) => void;
  onExportCSV: () => void;
}

const isCheckInEligible = (status: string): boolean => {
  const normalized = (status || '').toUpperCase().trim();
  return normalized === 'ISSUED' || normalized === 'VERIFIED' || normalized === 'REMINDED';
};

const ORDER_STATUS_OPTIONS = [
  'ISSUED',
  'CHECKED_IN',
  'REFUND_REQUESTED',
  'REFUNDED',
  'CANCELLED',
] as const;

export const OrdersPanel: React.FC<OrdersPanelProps> = ({
  orders,
  role = 'ADMIN',
  isLoading,
  checkingInCode,
  search,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onUpdateStatus,
  onManualCheckIn,
  onExportCSV,
}) => {
  const isPetugas = role === 'PETUGAS';
  const selectValue = statusFilter || 'ALL';

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card>
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={16}
                strokeWidth={1.7}
                className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <Input
                type="text"
                aria-label="Cari kode pesanan, nama, atau email"
                placeholder="Cari kode pesanan, nama, atau email..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={selectValue}
              onValueChange={(val) => onStatusFilterChange(val === 'ALL' ? '' : val)}
            >
              <SelectTrigger aria-label="Filter status pesanan" className="sm:w-52">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Semua Status</SelectItem>
                {ORDER_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isPetugas && (
            <Button
              type="button"
              variant="outline"
              onClick={onExportCSV}
              className="shrink-0"
            >
              <Download size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>Ekspor CSV</span>
            </Button>
          )}
        </CardContent>
      </Card>

      {isLoading && orders.length === 0 ? (
        <Card className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </Card>
      ) : (
        <>
          <Card className="hidden md:block overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Kode Order</TableHead>
                  <TableHead>Konser &amp; Kategori</TableHead>
                  <TableHead>Pemegang Tiket</TableHead>
                  <TableHead>Jumlah</TableHead>
                  <TableHead>Total Bayar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    {isPetugas ? 'Aksi Gate' : 'Aksi & Status'}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length > 0 ? (
                  orders.map((ord) => {
                    const canCheckIn = !!onManualCheckIn && isCheckInEligible(ord.status);
                    const isChecking = checkingInCode === ord.orderCode;

                    return (
                      <TableRow key={ord.id}>
                        <TableCell className="font-mono text-xs font-semibold">
                          {ord.orderCode}
                        </TableCell>
                        <TableCell>
                          <span className="block font-medium text-sm text-foreground">
                            {ord.eventTitle}
                          </span>
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {ord.categoryName}
                            {ord.seatNumbers ? ` · Kursi ${ord.seatNumbers}` : ''}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="block font-medium text-xs text-foreground">
                            {ord.userName}
                          </span>
                          <span className="block text-xs text-muted-foreground mt-0.5">
                            {ord.userEmail}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs tabular-nums">
                          {ord.quantity}x Tiket
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold tabular-nums">
                          {formatIDR(ord.totalPrice)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={ord.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            {canCheckIn && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => onManualCheckIn(ord)}
                                disabled={isChecking}
                                aria-label={`Check-in manual tiket ${ord.orderCode}`}
                                className="border-[#156E3F]/35 bg-[#156E3F]/10 text-[#156E3F] hover:bg-[#156E3F]/20 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300"
                              >
                                <CheckCircle2 size={14} aria-hidden="true" />
                                <span>{isChecking ? 'Memproses...' : 'Check-in Manual'}</span>
                              </Button>
                            )}

                            {isPetugas ? (
                              !canCheckIn && (
                                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Lock size={12} aria-hidden="true" />
                                  <span>
                                    {ord.status.toUpperCase() === 'CHECKED_IN'
                                      ? 'Sudah Masuk'
                                      : 'Read-Only'}
                                  </span>
                                </span>
                              )
                            ) : (
                              <Select
                                value={ord.status}
                                onValueChange={(val) => onUpdateStatus(ord.id, val)}
                              >
                                <SelectTrigger
                                  aria-label={`Ubah status pesanan ${ord.orderCode}`}
                                  className="min-h-[40px] w-[164px] text-xs"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ORDER_STATUS_OPTIONS.map((status) => (
                                    <SelectItem key={status} value={status} className="text-xs">
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                      {search || statusFilter
                        ? 'Tidak ada pesanan yang cocok dengan filter pencarian.'
                        : 'Belum ada pesanan tiket yang masuk.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>

          <div className="block md:hidden space-y-4">
            {orders.length > 0 ? (
              orders.map((ord) => {
                const canCheckIn = !!onManualCheckIn && isCheckInEligible(ord.status);
                const isChecking = checkingInCode === ord.orderCode;

                return (
                  <Card key={ord.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-center gap-2 border-b border-border pb-2.5">
                      <span className="text-xs font-mono font-semibold text-foreground">
                        {ord.orderCode}
                      </span>
                      <StatusBadge status={ord.status} />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-foreground m-0">{ord.eventTitle}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 m-0 tabular-nums">
                        {ord.categoryName} &middot; {ord.quantity}x Tiket
                        {ord.seatNumbers ? ` · Kursi ${ord.seatNumbers}` : ''}
                      </p>
                    </div>

                    <div className="flex justify-between items-center gap-3 text-xs pt-1">
                      <div className="min-w-0">
                        <span className="text-foreground block font-medium truncate">
                          {ord.userName}
                        </span>
                        <span className="text-xs text-muted-foreground block truncate">
                          {ord.userEmail}
                        </span>
                      </div>
                      <span className="font-mono text-sm text-foreground font-semibold shrink-0 tabular-nums">
                        {formatIDR(ord.totalPrice)}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-border flex flex-wrap justify-between items-center gap-3">
                      {canCheckIn && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => onManualCheckIn(ord)}
                          disabled={isChecking}
                          aria-label={`Check-in manual tiket ${ord.orderCode}`}
                          className="flex-1 border-[#156E3F]/35 bg-[#156E3F]/10 text-[#156E3F] hover:bg-[#156E3F]/20 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300"
                        >
                          <CheckCircle2 size={15} aria-hidden="true" />
                          <span>{isChecking ? 'Memproses...' : 'Check-in Manual'}</span>
                        </Button>
                      )}

                      {isPetugas ? (
                        !canCheckIn && (
                          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Lock size={13} aria-hidden="true" />
                            <span>
                              {ord.status.toUpperCase() === 'CHECKED_IN'
                                ? 'Tiket sudah masuk gate'
                                : 'Status read-only untuk petugas gate'}
                            </span>
                          </span>
                        )
                      ) : (
                        <div className="flex items-center justify-between gap-2 flex-1">
                          <span className="text-xs text-muted-foreground font-medium shrink-0">
                            Status:
                          </span>
                          <Select
                            value={ord.status}
                            onValueChange={(val) => onUpdateStatus(ord.id, val)}
                          >
                            <SelectTrigger
                              aria-label={`Ubah status pesanan ${ord.orderCode}`}
                              className="flex-1 text-xs"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ORDER_STATUS_OPTIONS.map((status) => (
                                <SelectItem key={status} value={status} className="text-xs">
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="text-center py-10 px-4 text-muted-foreground text-sm">
                {search || statusFilter
                  ? 'Tidak ada data pesanan yang cocok dengan filter.'
                  : 'Belum ada pesanan tiket yang masuk.'}
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
};
