import React, { useMemo, useState } from 'react';
import { Plus, Search, Edit, Trash2, Tag, Power } from 'lucide-react';
import { formatIDR, type PromotionItem } from '../landing/data';
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

interface PromosPanelProps {
  promos: PromotionItem[];
  isLoading?: boolean;
  onAddPromo: () => void;
  onEditPromo: (promo: PromotionItem) => void;
  onToggleActive: (id: string) => void;
  onDeletePromo: (id: string, code: string) => void;
}

type PromoStatusKey = 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'UPCOMING' | 'EXHAUSTED';

function getPromoStatus(promo: PromotionItem): { key: PromoStatusKey; label: string; style: string } {
  const now = Date.now();
  const validFrom = new Date(promo.validFrom).getTime();
  const validUntil = new Date(promo.validUntil).getTime();

  if (!promo.isActive) {
    return {
      key: 'INACTIVE',
      label: 'NONAKTIF',
      style: 'border-border bg-secondary text-muted-foreground',
    };
  }
  if (promo.remainingQuota <= 0) {
    return {
      key: 'EXHAUSTED',
      label: 'KUOTA HABIS',
      style: 'border-[#C81E1E]/40 bg-[#C81E1E]/10 text-[#C81E1E] dark:text-rose-300',
    };
  }
  if (!Number.isNaN(validUntil) && now > validUntil) {
    return {
      key: 'EXPIRED',
      label: 'KEDALUWARSA',
      style: 'border-[#8A5A00]/40 bg-[#8A5A00]/10 text-[#8A5A00] dark:text-amber-300',
    };
  }
  if (!Number.isNaN(validFrom) && now < validFrom) {
    return {
      key: 'UPCOMING',
      label: 'TERJADWAL',
      style: 'border-border-strong bg-background text-foreground',
    };
  }
  return {
    key: 'ACTIVE',
    label: 'AKTIF',
    style: 'border-[#156E3F]/40 bg-[#156E3F]/10 text-[#156E3F] dark:text-emerald-300',
  };
}

function formatDiscountSummary(promo: PromotionItem): string {
  if (promo.discountType === 'PERCENTAGE') {
    const base = `${promo.discountValue}%`;
    return promo.maxDiscount > 0 ? `${base} (Maks ${formatIDR(promo.maxDiscount)})` : base;
  }
  return formatIDR(promo.discountValue);
}

function formatShortDate(iso: string): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const PromosPanel: React.FC<PromosPanelProps> = ({
  promos,
  isLoading,
  onAddPromo,
  onEditPromo,
  onToggleActive,
  onDeletePromo,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const stats = useMemo(() => {
    let activeCount = 0;
    let totalUsed = 0;
    for (const p of promos) {
      if (getPromoStatus(p).key === 'ACTIVE') activeCount++;
      totalUsed += p.usedCount || 0;
    }
    return { total: promos.length, activeCount, totalUsed };
  }, [promos]);

  const filteredPromos = useMemo(() => {
    const q = search.trim().toLowerCase();
    return promos.filter((p) => {
      const matchQuery =
        !q || p.code.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
      const st = getPromoStatus(p).key;
      const matchStatus = statusFilter === 'ALL' || st === statusFilter;
      return matchQuery && matchStatus;
    });
  }, [promos, search, statusFilter]);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <Card>
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-base font-semibold text-card-foreground tracking-tight m-0">
              Manajemen Kode Promo &amp; Voucher Anggota
            </h2>
            <p className="text-xs text-muted-foreground mt-1 m-0 leading-relaxed">
              Buat kode diskon kustom, atur kuota penukaran, masa berlaku, dan target pengguna secara dinamis.
            </p>
          </div>
          <Button type="button" onClick={onAddPromo} className="shrink-0">
            <Plus size={16} strokeWidth={2} aria-hidden="true" />
            <span>Buat Promo Baru</span>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Total Kode Promo
          </span>
          <span className="font-display text-3xl font-extrabold text-foreground tabular-nums block mt-1">
            {stats.total}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Promo Aktif Saat Ini
          </span>
          <span className="font-display text-3xl font-extrabold text-[#156E3F] dark:text-[#D4FF2A] tabular-nums block mt-1">
            {stats.activeCount}
          </span>
        </Card>
        <Card className="p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
            Total Penukaran Tercatat
          </span>
          <span className="font-display text-3xl font-extrabold text-foreground tabular-nums block mt-1">
            {stats.totalUsed}
          </span>
        </Card>
      </div>

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
              aria-label="Cari kode atau deskripsi promo"
              placeholder="Cari kode promo atau deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger aria-label="Filter status promo" className="sm:w-48">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="ACTIVE">AKTIF</SelectItem>
              <SelectItem value="INACTIVE">NONAKTIF</SelectItem>
              <SelectItem value="UPCOMING">TERJADWAL</SelectItem>
              <SelectItem value="EXPIRED">KEDALUWARSA</SelectItem>
              <SelectItem value="EXHAUSTED">KUOTA HABIS</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading && promos.length === 0 ? (
        <Card className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </Card>
      ) : filteredPromos.length === 0 ? (
        <Card className="border-dashed border-border-strong">
          <CardContent className="p-10 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-none border border-border bg-background flex items-center justify-center mb-3">
              <Tag className="w-6 h-6 text-muted-foreground" strokeWidth={1.6} aria-hidden="true" />
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground m-0">
              {promos.length === 0 ? 'Belum Ada Kode Promo' : 'Promo Tidak Ditemukan'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1.5 mb-5 max-w-md">
              {promos.length === 0
                ? 'Buat kode promo kustom pertama untuk mendorong pendaftaran anggota dan pembelian tiket konser.'
                : 'Tidak ada kode promo yang cocok dengan kata kunci atau filter status saat ini.'}
            </p>
            {promos.length === 0 && (
              <Button type="button" onClick={onAddPromo}>
                <Plus size={16} aria-hidden="true" />
                <span>Buat Promo Pertama</span>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="hidden md:block overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Kode Promo</TableHead>
                  <TableHead>Potongan</TableHead>
                  <TableHead>Min. Order</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Kuota</TableHead>
                  <TableHead>Berlaku</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromos.map((promo) => {
                  const st = getPromoStatus(promo);
                  return (
                    <TableRow key={promo.id}>
                      <TableCell>
                        <span className="font-mono font-bold text-foreground block">{promo.code}</span>
                        {promo.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1 max-w-[240px] block">
                            {promo.description}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs font-semibold tabular-nums">
                        {formatDiscountSummary(promo)}
                      </TableCell>
                      <TableCell className="font-mono text-xs tabular-nums">
                        {promo.minOrderAmount > 0 ? formatIDR(promo.minOrderAmount) : 'Bebas'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={promo.isMemberOnly ? 'default' : 'outline'} className="text-[10px]">
                          {promo.isMemberOnly ? 'Anggota' : 'Publik'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs tabular-nums">
                        <span className="font-bold text-foreground">{promo.remainingQuota}</span>
                        <span className="text-muted-foreground"> / {promo.quota}</span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {formatShortDate(promo.validFrom)} - {formatShortDate(promo.validUntil)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase border rounded-none ${st.style}`}
                        >
                          {st.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => onToggleActive(promo.id)}
                            title={promo.isActive ? 'Nonaktifkan Promo' : 'Aktifkan Promo'}
                            aria-label={promo.isActive ? `Nonaktifkan ${promo.code}` : `Aktifkan ${promo.code}`}
                          >
                            <Power className="w-3.5 h-3.5" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => onEditPromo(promo)}
                            title="Edit Promo"
                            aria-label={`Edit ${promo.code}`}
                          >
                            <Edit className="w-3.5 h-3.5" aria-hidden="true" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="outline"
                            onClick={() => onDeletePromo(promo.id, promo.code)}
                            title="Hapus Promo"
                            aria-label={`Hapus ${promo.code}`}
                            className="text-[#C81E1E] hover:bg-[#C81E1E] hover:text-white hover:border-[#C81E1E]"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredPromos.map((promo) => {
              const st = getPromoStatus(promo);
              return (
                <Card key={promo.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="font-mono text-base font-bold text-foreground block">
                        {promo.code}
                      </span>
                      {promo.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 mb-0">
                          {promo.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold uppercase border rounded-none shrink-0 ${st.style}`}
                    >
                      {st.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-y border-border py-2.5">
                    <div>
                      <span className="text-muted-foreground block">Potongan</span>
                      <span className="font-mono font-bold text-foreground">
                        {formatDiscountSummary(promo)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Sisa Kuota</span>
                      <span className="font-mono font-bold text-foreground">
                        {promo.remainingQuota} / {promo.quota}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Min. Order</span>
                      <span className="font-mono text-foreground">
                        {promo.minOrderAmount > 0 ? formatIDR(promo.minOrderAmount) : 'Bebas'}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Target</span>
                      <span className="font-bold text-foreground">
                        {promo.isMemberOnly ? 'Anggota Login' : 'Publik'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onToggleActive(promo.id)}
                      className="flex-1 min-h-[44px]"
                    >
                      <Power className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{promo.isActive ? 'Nonaktifkan' : 'Aktifkan'}</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onEditPromo(promo)}
                      className="min-h-[44px]"
                    >
                      <Edit className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onDeletePromo(promo.id, promo.code)}
                      className="min-h-[44px] text-[#C81E1E]"
                      aria-label={`Hapus ${promo.code}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
