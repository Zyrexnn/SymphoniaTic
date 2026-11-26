import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Box,
  Grid2x2,
  Map as MapIcon,
  RefreshCw,
  RotateCcw,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { SeatItem, TicketCategory } from './data';
import { formatIDR, getEventSeatsAPI } from './data';

const Stage3DPreview = lazy(() => import('./Stage3DPreview'));

export interface ZoneVisualStyle {
  color: string;
  zoneLabel: string;
  viewNote: string;
}

const TIER_PALETTE: ZoneVisualStyle[] = [
  {
    color: '#8C3B4A',
    zoneLabel: 'Zona Depan Panggung',
    viewNote: 'Jarak terdekat menghadap langsung ke panggung orkestra.',
  },
  {
    color: '#2B6E68',
    zoneLabel: 'Zona Tengah Hall',
    viewNote: 'Posisi seimbang dengan akustik dan pandangan menyeluruh.',
  },
  {
    color: '#3E5668',
    zoneLabel: 'Zona Belakang & Balkon',
    viewNote: 'Panorama luas mencakup seluruh formasi orkestra dan panggung.',
  },
  {
    color: '#6E5A38',
    zoneLabel: 'Zona Sayap Atas',
    viewNote: 'Area duduk bertingkat dengan sudut pandang elevasi.',
  },
];

interface PositionedSeat {
  seatCode: string;
  rowLabel: string;
  seatNumber: number;
  x: number;
  y: number;
  dist: number;
  colIdx: number;
  categoryId: string;
  status: 'AVAILABLE' | 'BOOKED';
}

interface SlotCoord {
  seatCode: string;
  rowLabel: string;
  seatNumber: number;
  x: number;
  y: number;
  dist: number;
  colIdx: number;
}

const SVG_WIDTH = 520;
const STAGE_CX = 260;
const STAGE_CY = 46;
const STANDARD_ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
const FIRST_ROW_Y = 126;
const ROW_STEP = 28;
const SEAT_W = 24;
const SEAT_H = 20;

function rowLabelForExtraIndex(extraIdx: number): string {
  const code = 'L'.charCodeAt(0) + extraIdx;
  if (code <= 'Z'.charCodeAt(0)) {
    return String.fromCharCode(code);
  }
  return `R${code - 'Z'.charCodeAt(0)}`;
}

function getColumnX(colIdx: number): number {
  // 14 kursi per baris: 7 di sayap kiri, lorong tengah 36px, 7 di sayap kanan
  return colIdx < 7 ? 230 - (6 - colIdx) * 28 : 290 + (colIdx - 7) * 28;
}

function buildSlotCoordinateLookup(extraRowCount: number): {
  byCode: Map<string, SlotCoord>;
  rowHeaders: { label: string; y: number }[];
} {
  const byCode = new Map<string, SlotCoord>();
  const rowHeaders: { label: string; y: number }[] = [];

  const allLabels = [
    ...STANDARD_ROW_LABELS,
    ...Array.from({ length: extraRowCount }, (_, idx) => rowLabelForExtraIndex(idx)),
  ];

  for (let rowIdx = 0; rowIdx < allLabels.length; rowIdx++) {
    const y = FIRST_ROW_Y + rowIdx * ROW_STEP;
    const rowLabel = allLabels[rowIdx];
    rowHeaders.push({ label: rowLabel, y });

    for (let colIdx = 0; colIdx < 14; colIdx++) {
      const x = getColumnX(colIdx);
      const dist = Math.hypot(x - STAGE_CX, y - STAGE_CY);
      const seatNumber = colIdx + 1;
      const seatCode = `${rowLabel}-${seatNumber}`;
      byCode.set(seatCode, {
        seatCode,
        rowLabel,
        seatNumber,
        x,
        y,
        dist,
        colIdx,
      });
    }
  }

  return { byCode, rowHeaders };
}

function buildFallbackHallSeats(categories: TicketCategory[]): PositionedSeat[] {
  const sorted = [...categories].sort((a, b) => b.price - a.price);
  if (sorted.length === 0) return [];

  const totalQuota = sorted.reduce((acc, c) => acc + Math.max(0, c.quota || 0), 0);
  const maxStandardSlots = STANDARD_ROW_LABELS.length * 14;
  const extraRows = totalQuota > maxStandardSlots ? Math.ceil((totalQuota - maxStandardSlots) / 14) : 0;
  const { byCode } = buildSlotCoordinateLookup(extraRows);

  const slots = Array.from(byCode.values()).sort((a, b) => {
    const scoreA = a.dist + (a.y - STAGE_CY) * 0.35;
    const scoreB = b.dist + (b.y - STAGE_CY) * 0.35;
    if (Math.abs(scoreA - scoreB) > 0.5) return scoreA - scoreB;
    return Math.abs(a.x - STAGE_CX) - Math.abs(b.x - STAGE_CX) || a.colIdx - b.colIdx;
  });

  const result: PositionedSeat[] = [];
  let cursor = 0;

  sorted.forEach((cat) => {
    const quota = Math.max(0, cat.quota || 0);
    const rem = typeof cat.remainingQuota === 'number' ? Math.max(0, cat.remainingQuota) : quota;
    const bookedCount = Math.max(0, quota - rem);

    for (let i = 0; i < quota && cursor < slots.length; i++) {
      const slot = slots[cursor++];
      result.push({
        ...slot,
        categoryId: cat.id,
        status: i < bookedCount ? 'BOOKED' : 'AVAILABLE',
      });
    }
  });

  return result;
}

export function pickBestAdjacentSeats(
  seats: SeatItem[],
  categoryId: string,
  quantity: number
): string[] {
  const target = Math.max(1, quantity);
  const available = seats.filter((s) => s.categoryId === categoryId && s.status === 'AVAILABLE');
  if (available.length === 0) return [];
  if (available.length <= target) return available.map((s) => s.seatCode);

  const { byCode } = buildSlotCoordinateLookup(8);
  const byRow = new Map<string, { seat: SeatItem; coord: SlotCoord }[]>();

  available.forEach((seat) => {
    const coord = byCode.get(seat.seatCode) || {
      seatCode: seat.seatCode,
      rowLabel: seat.rowLabel,
      seatNumber: seat.seatNumber,
      x: STAGE_CX,
      y: FIRST_ROW_Y + 60,
      dist: 150,
      colIdx: seat.seatNumber,
    };
    const list = byRow.get(seat.rowLabel) || [];
    list.push({ seat, coord });
    byRow.set(seat.rowLabel, list);
  });

  let bestGroup: { codes: string[]; score: number } | null = null;
  byRow.forEach((rowItems) => {
    rowItems.sort((a, b) => a.seat.seatNumber - b.seat.seatNumber);
    for (let i = 0; i <= rowItems.length - target; i++) {
      const windowItems = rowItems.slice(i, i + target);
      const isContiguous = windowItems.every(
        (item, idx) => idx === 0 || item.seat.seatNumber === windowItems[idx - 1].seat.seatNumber + 1
      );
      const avgDist =
        windowItems.reduce((sum, item) => sum + item.coord.dist + Math.abs(item.coord.x - STAGE_CX) * 0.4, 0) /
        target;
      const penalty = isContiguous ? 0 : 120;
      const totalScore = avgDist + penalty;
      if (!bestGroup || totalScore < bestGroup.score) {
        bestGroup = {
          codes: windowItems.map((item) => item.seat.seatCode),
          score: totalScore,
        };
      }
    }
  });

  if (bestGroup) {
    return (bestGroup as { codes: string[]; score: number }).codes;
  }

  return available
    .map((seat) => ({
      seat,
      coord: byCode.get(seat.seatCode),
    }))
    .sort((a, b) => (a.coord?.dist ?? 999) - (b.coord?.dist ?? 999))
    .slice(0, target)
    .map((item) => item.seat.seatCode);
}

export function getCategoryTierMap(
  categories: TicketCategory[]
): Map<string, { tierIndex: number; style: ZoneVisualStyle }> {
  const sorted = [...categories].sort((a, b) => b.price - a.price);
  const map = new Map<string, { tierIndex: number; style: ZoneVisualStyle }>();
  sorted.forEach((cat, idx) => {
    const style = TIER_PALETTE[Math.min(idx, TIER_PALETTE.length - 1)];
    map.set(cat.id, { tierIndex: idx, style });
  });
  return map;
}

function getRemaining(cat: TicketCategory): number {
  if (typeof cat.remainingQuota === 'number') return Math.max(0, cat.remainingQuota);
  if (typeof cat.quota === 'number') return Math.max(0, cat.quota);
  return 0;
}

interface SeatingPlanVisualizerProps {
  eventId?: string;
  venue: string;
  categories: TicketCategory[];
  selectedCategoryId: string;
  quantity?: number;
  eventSeats?: SeatItem[];
  seatsLoading?: boolean;
  seatsError?: string;
  selectedSeats?: string[];
  onSelectCategory: (category: TicketCategory) => void;
  onSelectSeats?: (seatCodes: string[]) => void;
  onRetrySeats?: () => void;
  compact?: boolean;
}

export const SeatingPlanVisualizer: React.FC<SeatingPlanVisualizerProps> = ({
  eventId,
  venue,
  categories,
  selectedCategoryId,
  quantity = 1,
  eventSeats,
  seatsLoading = false,
  seatsError = '',
  selectedSeats = [],
  onSelectCategory,
  onSelectSeats,
  onRetrySeats,
  compact = false,
}) => {
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<PositionedSeat | null>(null);
  const [seatNotice, setSeatNotice] = useState<{ type: 'info' | 'warning'; text: string } | null>(null);
  const [internalSeats, setInternalSeats] = useState<SeatItem[] | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [viewMode, setViewMode] = useState<'map' | 'grid' | '3d'>('map');

  const isSelectionMode = typeof onSelectSeats === 'function';

  useEffect(() => {
    if (eventSeats !== undefined || !eventId) return;
    let active = true;
    setInternalLoading(true);
    getEventSeatsAPI(eventId)
      .then((res) => {
        if (active && res.success && Array.isArray(res.data)) {
          setInternalSeats(res.data);
        }
      })
      .catch(() => {
        // Fallback ke tata letak estimasi jika endpoint kursi tidak terjangkau
      })
      .finally(() => {
        if (active) setInternalLoading(false);
      });
    return () => {
      active = false;
    };
  }, [eventId, eventSeats]);

  const resolvedBackendSeats = eventSeats !== undefined ? eventSeats : internalSeats;
  const isLoading = seatsLoading || internalLoading;

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => b.price - a.price),
    [categories]
  );

  const categoryMap = useMemo(() => {
    const map = new Map<string, TicketCategory>();
    categories.forEach((c) => map.set(c.id, c));
    return map;
  }, [categories]);

  const tierMap = useMemo(() => getCategoryTierMap(categories), [categories]);

  const tierColors = useMemo(() => {
    const colors: Record<string, string> = {};
    tierMap.forEach((entry, id) => {
      colors[id] = entry.style.color;
    });
    return colors;
  }, [tierMap]);

  const extraRowCount = useMemo(() => {
    if (!resolvedBackendSeats || resolvedBackendSeats.length === 0) {
      const totalQuota = categories.reduce((acc, c) => acc + Math.max(0, c.quota || 0), 0);
      const maxStandard = STANDARD_ROW_LABELS.length * 14;
      return totalQuota > maxStandard ? Math.ceil((totalQuota - maxStandard) / 14) : 0;
    }
    let maxExtra = 0;
    resolvedBackendSeats.forEach((s) => {
      if (!STANDARD_ROW_LABELS.includes(s.rowLabel)) {
        const code = s.rowLabel.charCodeAt(0) - 'L'.charCodeAt(0) + 1;
        if (code > maxExtra && code < 20) maxExtra = code;
      }
    });
    return maxExtra;
  }, [resolvedBackendSeats, categories]);

  const { byCode: slotLookup, rowHeaders } = useMemo(
    () => buildSlotCoordinateLookup(extraRowCount),
    [extraRowCount]
  );

  const positionedSeats = useMemo<PositionedSeat[]>(() => {
    if (resolvedBackendSeats && resolvedBackendSeats.length > 0) {
      return resolvedBackendSeats.map((s) => {
        const coord = slotLookup.get(s.seatCode);
        if (coord) {
          return {
            ...coord,
            categoryId: s.categoryId,
            status: s.status,
          };
        }
        return {
          seatCode: s.seatCode,
          rowLabel: s.rowLabel,
          seatNumber: s.seatNumber,
          x: getColumnX((s.seatNumber - 1) % 14),
          y: FIRST_ROW_Y,
          dist: 200,
          colIdx: (s.seatNumber - 1) % 14,
          categoryId: s.categoryId,
          status: s.status,
        };
      });
    }
    return buildFallbackHallSeats(categories);
  }, [resolvedBackendSeats, slotLookup, categories]);

  // Hanya tampilkan baris yang benar-benar memiliki kursi agar kanvas tidak menyisakan ruang kosong
  const activeRowHeaders = useMemo(() => {
    const activeSet = new Set(positionedSeats.map((s) => s.rowLabel));
    const filtered = rowHeaders.filter((r) => activeSet.has(r.label));
    return filtered.length > 0 ? filtered : rowHeaders.slice(0, 5);
  }, [positionedSeats, rowHeaders]);

  const maxActiveY = useMemo(() => {
    if (positionedSeats.length === 0) return FIRST_ROW_Y + ROW_STEP * 4;
    return positionedSeats.reduce((max, s) => Math.max(max, s.y), FIRST_ROW_Y);
  }, [positionedSeats]);

  const selectedSeatSet = useMemo(() => new Set(selectedSeats), [selectedSeats]);

  const selectedGroupConnectors = useMemo(() => {
    if (selectedSeats.length < 2) return [];
    const selectedItems = positionedSeats
      .filter((s) => selectedSeatSet.has(s.seatCode))
      .sort((a, b) => a.rowLabel.localeCompare(b.rowLabel) || a.colIdx - b.colIdx);
    const lines: { key: string; x1: number; y1: number; x2: number; y2: number }[] = [];
    for (let i = 0; i < selectedItems.length - 1; i++) {
      const a = selectedItems[i];
      const b = selectedItems[i + 1];
      if (a.rowLabel === b.rowLabel && Math.abs(b.colIdx - a.colIdx) <= 1) {
        lines.push({ key: `${a.seatCode}-${b.seatCode}`, x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      }
    }
    return lines;
  }, [positionedSeats, selectedSeatSet, selectedSeats.length]);

  const inspectedCat = useMemo(() => {
    const targetId = hoveredCatId || selectedCategoryId;
    return categories.find((c) => c.id === targetId) || sortedCategories[0] || null;
  }, [hoveredCatId, selectedCategoryId, categories, sortedCategories]);

  // Kelompokkan kursi per baris untuk mode daftar ramah sentuhan di layar kecil
  const seatsByRowForActiveCat = useMemo(() => {
    const targetCatId = selectedCategoryId || sortedCategories[0]?.id;
    const filtered = positionedSeats
      .filter((s) => s.categoryId === targetCatId)
      .sort((a, b) => a.y - b.y || a.seatNumber - b.seatNumber);
    const groups = new Map<string, PositionedSeat[]>();
    filtered.forEach((seat) => {
      const arr = groups.get(seat.rowLabel) || [];
      arr.push(seat);
      groups.set(seat.rowLabel, arr);
    });
    return Array.from(groups.entries());
  }, [positionedSeats, selectedCategoryId, sortedCategories]);

  if (categories.length === 0) {
    return (
      <div className="rounded-none border border-[#DFDDD6] bg-white p-6 text-center">
        <p className="text-sm font-semibold text-[#141413] m-0">Denah Kursi Belum Tersedia</p>
        <p className="text-xs text-[#52514D] mt-1 mb-0">
          Kategori tempat duduk untuk pertunjukan ini belum dikonfigurasi.
        </p>
      </div>
    );
  }

  const handleSeatInteraction = (seat: PositionedSeat) => {
    const cat = categoryMap.get(seat.categoryId);
    if (!cat) return;

    if (seat.status === 'BOOKED') {
      setSeatNotice({
        type: 'warning',
        text: `Kursi ${seat.seatCode} sudah dipesan penonton lain. Silakan pilih kursi lain yang masih tersedia.`,
      });
      return;
    }

    const rem = getRemaining(cat);
    if (rem <= 0) {
      setSeatNotice({
        type: 'warning',
        text: `Kategori "${cat.name}" telah habis terjual. Silakan pilih zona lain yang masih tersedia.`,
      });
      return;
    }

    setSeatNotice(null);

    if (!isSelectionMode) {
      onSelectCategory(cat);
      setHoveredSeat(seat);
      return;
    }

    if (cat.id !== selectedCategoryId) {
      onSelectCategory(cat);
      const sourceList: SeatItem[] = positionedSeats.map((ps) => ({
        id: ps.seatCode,
        eventId: eventId || '',
        categoryId: ps.categoryId,
        seatCode: ps.seatCode,
        rowLabel: ps.rowLabel,
        seatNumber: ps.seatNumber,
        status: ps.status,
      }));
      if (quantity <= 1) {
        onSelectSeats([seat.seatCode]);
      } else {
        const autoFill = pickBestAdjacentSeats(
          sourceList.filter((s) => s.seatCode !== seat.seatCode),
          cat.id,
          quantity - 1
        );
        onSelectSeats([seat.seatCode, ...autoFill].slice(0, quantity));
      }
      return;
    }

    if (quantity <= 1) {
      onSelectSeats([seat.seatCode]);
      return;
    }

    if (selectedSeatSet.has(seat.seatCode)) {
      onSelectSeats(selectedSeats.filter((code) => code !== seat.seatCode));
      return;
    }

    if (selectedSeats.length < quantity) {
      onSelectSeats([...selectedSeats, seat.seatCode]);
    } else {
      const replaced = selectedSeats[0];
      onSelectSeats([...selectedSeats.slice(1), seat.seatCode]);
      setSeatNotice({
        type: 'info',
        text: `Kursi ${replaced} digantikan dengan kursi ${seat.seatCode}.`,
      });
    }
  };

  const handleLegendClick = (cat: TicketCategory) => {
    const rem = getRemaining(cat);
    if (rem <= 0) {
      setSeatNotice({
        type: 'warning',
        text: `Kategori "${cat.name}" telah habis terjual. Silakan pilih zona lain yang masih tersedia.`,
      });
      return;
    }
    setSeatNotice(null);
    setHoveredSeat(null);
    onSelectCategory(cat);
  };

  const handleAutoPick = () => {
    if (!onSelectSeats) return;
    setSeatNotice(null);
    const sourceList: SeatItem[] = positionedSeats.map((ps) => ({
      id: ps.seatCode,
      eventId: eventId || '',
      categoryId: ps.categoryId,
      seatCode: ps.seatCode,
      rowLabel: ps.rowLabel,
      seatNumber: ps.seatNumber,
      status: ps.status,
    }));
    const best = pickBestAdjacentSeats(sourceList, selectedCategoryId, quantity);
    if (best.length > 0) {
      onSelectSeats(best);
    }
  };

  const inspectedMeta = inspectedCat ? tierMap.get(inspectedCat.id) : null;
  const inspectedRem = inspectedCat ? getRemaining(inspectedCat) : 0;
  const hoveredSeatCategory = hoveredSeat ? categoryMap.get(hoveredSeat.categoryId) : null;

  const viewBoxHeight = Math.max(240, maxActiveY + 52);
  const hallFrameHeight = viewBoxHeight - 24;

  return (
    <div className="rounded-none border border-[#DFDDD6] bg-white p-3.5 sm:p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#DFDDD6] pb-3.5">
        <div className="min-w-0">
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#141413] block">
            • Denah Tempat Duduk
          </span>
          <span className="text-xs text-[#52514D] block mt-0.5 truncate">
            {venue}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isLoading && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#52514D] bg-[#F4F3EF] border border-[#DFDDD6] rounded-none px-2.5 py-1.5">
              <RefreshCw className="w-3 h-3 animate-spin text-[#141413]" aria-hidden="true" />
              <span>Memuat kursi...</span>
            </span>
          )}

          <div className="inline-flex border border-[#DFDDD6] bg-[#F4F3EF]" role="group" aria-label="Mode tampilan denah kursi">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              aria-pressed={viewMode === 'map'}
              className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
                viewMode === 'map'
                  ? 'bg-[#141413] text-[#D4FF2A]'
                  : 'bg-[#F4F3EF] text-[#141413] hover:bg-[#EAE8E1]'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Denah 2D</span>
            </button>
            {isSelectionMode && (
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
                className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-l border-[#DFDDD6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
                  viewMode === 'grid'
                    ? 'bg-[#141413] text-[#D4FF2A]'
                    : 'bg-[#F4F3EF] text-[#141413] hover:bg-[#EAE8E1]'
                }`}
              >
                <Grid2x2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Daftar</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              aria-pressed={viewMode === '3d'}
              className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border-l border-[#DFDDD6] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
                viewMode === '3d'
                  ? 'bg-[#141413] text-[#D4FF2A]'
                  : 'bg-[#F4F3EF] text-[#141413] hover:bg-[#EAE8E1]'
              }`}
            >
              <Box className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Preview 3D</span>
            </button>
          </div>

          {isSelectionMode && (
            <button
              type="button"
              onClick={handleAutoPick}
              disabled={isLoading || getRemaining(categoryMap.get(selectedCategoryId) || sortedCategories[0]) <= 0}
              className="min-h-[40px] inline-flex items-center gap-1.5 text-xs font-bold text-[#141413] bg-[#D4FF2A] hover:bg-[#C2EE1A] border border-[#141413] rounded-none px-3 py-1.5 transition-colors disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#141413]" aria-hidden="true" />
              <span>Pilih Otomatis ({quantity}x)</span>
            </button>
          )}
        </div>
      </div>

      {seatsError && (
        <div
          role="alert"
          className="rounded-none border border-[#C81E1E] bg-[#C81E1E]/10 px-3.5 py-2.5 text-xs text-[#C81E1E] flex items-center justify-between gap-3"
        >
          <span className="inline-flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{seatsError}</span>
          </span>
          {onRetrySeats && (
            <button
              type="button"
              onClick={onRetrySeats}
              className="text-xs font-semibold underline shrink-0 min-h-[36px] px-2"
            >
              Coba Lagi
            </button>
          )}
        </div>
      )}

      {viewMode === '3d' ? (
        <Suspense
          fallback={
            <div className="border border-[#DFDDD6] bg-[#F4F3EF] h-[340px] flex flex-col items-center justify-center gap-2 text-xs text-[#52514D]">
              <RefreshCw className="w-4 h-4 animate-spin text-[#141413]" aria-hidden="true" />
              <span>Memuat pratinjau panggung 3D...</span>
            </div>
          }
        >
          <Stage3DPreview
            venue={venue}
            seats={positionedSeats}
            categories={sortedCategories}
            tierColors={tierColors}
            selectedCategoryId={selectedCategoryId}
            selectedSeats={selectedSeats}
            onSelectSeat={(seatCode) => {
              const found = positionedSeats.find((s) => s.seatCode === seatCode);
              if (found) handleSeatInteraction(found);
            }}
            onFallbackTo2D={() => setViewMode('map')}
          />
        </Suspense>
      ) : viewMode === 'map' ? (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between gap-2 bg-[#F4F3EF] border border-[#DFDDD6] px-3 py-1.5">
            <span className="text-[11px] font-semibold text-[#52514D]">
              Panggung berada di sisi atas
            </span>
            <div className="flex items-center gap-1" role="group" aria-label="Kontrol perbesaran denah">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
                disabled={zoomLevel <= 1}
                aria-label="Perkecil denah"
                className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center border border-[#DFDDD6] bg-white text-[#141413] hover:border-[#141413] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
              >
                <ZoomOut className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span className="text-[11px] font-mono font-bold tabular-nums text-[#141413] px-2 min-w-[46px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(1.75, Number((z + 0.25).toFixed(2))))}
                disabled={zoomLevel >= 1.75}
                aria-label="Perbesar denah"
                className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center border border-[#DFDDD6] bg-white text-[#141413] hover:border-[#141413] disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
              >
                <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              {zoomLevel > 1 && (
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  aria-label="Reset ukuran denah"
                  className="min-h-[36px] px-2 inline-flex items-center gap-1 border border-[#DFDDD6] bg-white text-[11px] font-semibold text-[#141413] hover:border-[#141413] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
                >
                  <RotateCcw className="w-3 h-3" aria-hidden="true" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
            </div>
          </div>

          <div className="w-full overflow-x-auto border border-[#DFDDD6] bg-[#F4F3EF]">
            <div
              className="mx-auto transition-[width] duration-150"
              style={{
                width: `${zoomLevel * 100}%`,
                minWidth: zoomLevel > 1 ? `${Math.round(460 * zoomLevel)}px` : undefined,
              }}
            >
              <svg
                viewBox={`0 0 ${SVG_WIDTH} ${viewBoxHeight}`}
                role="img"
                aria-label={`Denah kursi konser ${venue} dengan panggung orkestra di bagian atas`}
                className={`w-full h-auto mx-auto block select-none ${
                  compact && zoomLevel === 1 ? 'max-w-[500px]' : 'max-w-[600px]'
                }`}
              >
                <rect
                  x="10"
                  y="10"
                  width={SVG_WIDTH - 20}
                  height={hallFrameHeight}
                  rx="0"
                  fill="#F4F3EF"
                  stroke="#DFDDD6"
                  strokeWidth="1.2"
                />

                {/* Panggung Orkestra di bagian atas */}
                <path
                  d={`M 90 16 L 430 16 L 430 62 Q ${STAGE_CX} 102 90 62 Z`}
                  fill="#141413"
                  stroke="#141413"
                  strokeWidth="1.5"
                />
                <path
                  d={`M 106 60 Q ${STAGE_CX} 92 414 60`}
                  fill="none"
                  stroke="#D4FF2A"
                  strokeWidth="1.2"
                  strokeOpacity="0.45"
                />
                <text
                  x={STAGE_CX}
                  y="42"
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight="800"
                  letterSpacing="2"
                  fill="#D4FF2A"
                >
                  PANGGUNG ORKESTRA
                </text>
                <text
                  x={STAGE_CX}
                  y="58"
                  textAnchor="middle"
                  fontSize="8.5"
                  fontWeight="600"
                  letterSpacing="1.2"
                  fill="#F4F3EF"
                >
                  STAGE • ARAH PANDANG PENONTON
                </text>

                {/* Penanda sayap & lorong tengah */}
                <text
                  x="146"
                  y="104"
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="700"
                  letterSpacing="1.2"
                  fill="#6E6D68"
                >
                  SAYAP KIRI
                </text>
                <text
                  x="374"
                  y="104"
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="700"
                  letterSpacing="1.2"
                  fill="#6E6D68"
                >
                  SAYAP KANAN
                </text>
                <line
                  x1={STAGE_CX}
                  y1="100"
                  x2={STAGE_CX}
                  y2={maxActiveY + 14}
                  stroke="#DFDDD6"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                />

                {/* Label baris di sisi kiri dan kanan agar mudah dipindai */}
                {activeRowHeaders.map((row) => (
                  <g key={row.label}>
                    <text
                      x="26"
                      y={row.y + 3.5}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="700"
                      fill="#52514D"
                    >
                      {row.label}
                    </text>
                    <text
                      x={SVG_WIDTH - 26}
                      y={row.y + 3.5}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="700"
                      fill="#52514D"
                    >
                      {row.label}
                    </text>
                  </g>
                ))}

                {selectedGroupConnectors.map((conn) => (
                  <line
                    key={conn.key}
                    x1={conn.x1}
                    y1={conn.y1}
                    x2={conn.x2}
                    y2={conn.y2}
                    stroke="#141413"
                    strokeWidth="6"
                    strokeOpacity="0.22"
                    strokeLinecap="square"
                  />
                ))}

                {positionedSeats.map((seat) => {
                  const cat = categoryMap.get(seat.categoryId);
                  if (!cat) return null;

                  const style = tierMap.get(cat.id)?.style || TIER_PALETTE[0];
                  const isBooked = seat.status === 'BOOKED';
                  const isCatSelected = cat.id === selectedCategoryId;
                  const isCatHovered = cat.id === hoveredCatId;
                  const isSelectedSeat = selectedSeatSet.has(seat.seatCode);
                  const isEmphasized = isCatSelected || isCatHovered;

                  let fill = style.color;
                  let stroke = style.color;
                  let strokeWidth = 1;
                  let opacity = isEmphasized ? 1 : 0.48;
                  let numberColor = '#FFFFFF';

                  if (isBooked) {
                    fill = '#EAE8E1';
                    stroke = '#6E6D68';
                    strokeWidth = 1;
                    opacity = 0.78;
                    numberColor = '#6E6D68';
                  } else if (isSelectedSeat) {
                    fill = '#D4FF2A';
                    stroke = '#141413';
                    strokeWidth = 2;
                    opacity = 1;
                    numberColor = '#141413';
                  }

                  const left = seat.x - SEAT_W / 2;
                  const top = seat.y - SEAT_H / 2;

                  return (
                    <g
                      key={seat.seatCode}
                      role="button"
                      tabIndex={isBooked ? -1 : 0}
                      aria-label={`Kursi ${seat.seatCode}, ${cat.name}, ${
                        isBooked ? 'Sudah dipesan' : isSelectedSeat ? 'Dipilih' : 'Tersedia'
                      }`}
                      onClick={() => handleSeatInteraction(seat)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSeatInteraction(seat);
                        }
                      }}
                      onMouseEnter={() => {
                        setHoveredCatId(cat.id);
                        setHoveredSeat(seat);
                      }}
                      onMouseLeave={() => {
                        setHoveredCatId(null);
                        setHoveredSeat(null);
                      }}
                      onFocus={() => {
                        setHoveredCatId(cat.id);
                        setHoveredSeat(seat);
                      }}
                      onBlur={() => {
                        setHoveredCatId(null);
                        setHoveredSeat(null);
                      }}
                      style={{ cursor: isBooked ? 'not-allowed' : 'pointer', outline: 'none' }}
                    >
                      <rect x={seat.x - 14} y={seat.y - 14} width={28} height={28} fill="transparent" />
                      <rect
                        x={left}
                        y={top}
                        width={SEAT_W}
                        height={SEAT_H}
                        rx="1.5"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        opacity={opacity}
                      />
                      {/* Garis sandaran kursi di sisi bawah (menjauhi panggung) */}
                      <line
                        x1={left + 3}
                        y1={top + SEAT_H - 3}
                        x2={left + SEAT_W - 3}
                        y2={top + SEAT_H - 3}
                        stroke={isSelectedSeat ? '#141413' : '#FFFFFF'}
                        strokeOpacity={isBooked ? 0.35 : isSelectedSeat ? 0.65 : 0.45}
                        strokeWidth="1.2"
                      />
                      {isBooked ? (
                        <line
                          x1={seat.x - 4}
                          y1={seat.y - 4}
                          x2={seat.x + 4}
                          y2={seat.y + 4}
                          stroke="#6E6D68"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                        />
                      ) : (
                        <text
                          x={seat.x}
                          y={seat.y + 2}
                          textAnchor="middle"
                          fontSize="7.5"
                          fontWeight={isSelectedSeat ? '800' : '700'}
                          fill={numberColor}
                          opacity={isEmphasized || isSelectedSeat ? 1 : 0.85}
                        >
                          {seat.seatNumber}
                        </text>
                      )}
                    </g>
                  );
                })}

                <text
                  x={STAGE_CX}
                  y={maxActiveY + 32}
                  textAnchor="middle"
                  fontSize="8.5"
                  fontWeight="700"
                  letterSpacing="1.6"
                  fill="#52514D"
                >
                  AREA BELAKANG / BALKON
                </text>
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-[#DFDDD6] bg-[#F4F3EF] p-3 sm:p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DFDDD6] pb-2">
            <span className="text-xs font-bold text-[#141413]">
              Daftar Kursi: {categoryMap.get(selectedCategoryId)?.name || sortedCategories[0]?.name}
            </span>
            <span className="text-[11px] text-[#52514D]">
              Ketuk nomor kursi untuk memilih ({selectedSeats.length}/{quantity})
            </span>
          </div>

          {seatsByRowForActiveCat.length === 0 ? (
            <p className="text-xs text-[#52514D] py-4 text-center m-0">
              Tidak ada kursi tersedia untuk kategori ini.
            </p>
          ) : (
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {seatsByRowForActiveCat.map(([rowLabel, rowSeats]) => (
                <div key={rowLabel} className="flex items-start gap-2.5">
                  <span className="w-8 shrink-0 min-h-[44px] inline-flex items-center justify-center bg-[#141413] text-[#F4F3EF] font-mono text-xs font-bold">
                    {rowLabel}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rowSeats.map((seat) => {
                      const isBooked = seat.status === 'BOOKED';
                      const isSelectedSeat = selectedSeatSet.has(seat.seatCode);
                      return (
                        <button
                          key={seat.seatCode}
                          type="button"
                          disabled={isBooked}
                          onClick={() => handleSeatInteraction(seat)}
                          aria-pressed={isSelectedSeat}
                          className={`min-h-[44px] min-w-[44px] px-2 font-mono text-xs font-bold border rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
                            isBooked
                              ? 'bg-[#EAE8E1] border-[#DFDDD6] text-[#6E6D68] line-through cursor-not-allowed'
                              : isSelectedSeat
                              ? 'bg-[#D4FF2A] border-[#141413] text-[#141413]'
                              : 'bg-white border-[#DFDDD6] text-[#141413] hover:border-[#141413]'
                          }`}
                        >
                          {seat.seatNumber}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bilah status tetap untuk mencegah pergeseran tata letak saat kursor melewati kursi */}
      <div className="min-h-[38px] flex items-center justify-center text-center text-xs font-medium text-[#141413] bg-[#F4F3EF] border border-[#DFDDD6] rounded-none px-3 py-1.5">
        {hoveredSeat && hoveredSeatCategory ? (
          <span>
            Kursi <span className="font-mono font-bold">{hoveredSeat.seatCode}</span> &middot;{' '}
            <span>{hoveredSeatCategory.name}</span> &middot;{' '}
            <span className={hoveredSeat.status === 'BOOKED' ? 'text-[#C81E1E] font-bold' : 'text-[#156E3F] font-bold'}>
              {hoveredSeat.status === 'BOOKED' ? 'Sudah Terisi' : 'Tersedia'}
            </span>
          </span>
        ) : (
          <span className="text-[#52514D]">
            {isSelectionMode
              ? 'Arahkan kursor atau ketuk kursi pada denah untuk memilih posisi Anda.'
              : 'Arahkan kursor atau ketuk kursi untuk melihat detail baris dan kategori.'}
          </span>
        )}
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#DFDDD6] border border-[#DFDDD6]"
        role="group"
        aria-label="Pilih zona kategori tempat duduk"
      >
        {sortedCategories.map((cat) => {
          const meta = tierMap.get(cat.id);
          const color = meta?.style.color || '#3E5668';
          const rem = getRemaining(cat);
          const isSoldOut = rem <= 0;
          const isSelected = cat.id === selectedCategoryId;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleLegendClick(cat)}
              onMouseEnter={() => setHoveredCatId(cat.id)}
              onMouseLeave={() => setHoveredCatId(null)}
              onFocus={() => setHoveredCatId(cat.id)}
              onBlur={() => setHoveredCatId(null)}
              aria-pressed={isSelected}
              aria-disabled={isSoldOut}
              className={`min-h-[52px] w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-none text-left text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#141413] ${
                isSoldOut
                  ? 'bg-[#EAE8E1] text-[#6E6D68] cursor-not-allowed'
                  : isSelected
                  ? 'bg-[#D4FF2A] text-[#141413] font-bold'
                  : 'bg-white text-[#141413] hover:bg-[#F4F3EF]'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-none shrink-0 border"
                  style={{
                    backgroundColor: isSoldOut ? '#EAE8E1' : color,
                    borderColor: isSoldOut ? '#6E6D68' : '#141413',
                  }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <span className="block truncate font-bold text-[#141413]">
                    {cat.name}
                  </span>
                  <span className="block text-[11px] tabular-nums text-[#52514D]">
                    {isSoldOut ? 'Kuota habis' : `Sisa ${rem} kursi`}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="block tabular-nums font-bold text-[#141413]">
                  {formatIDR(cat.price)}
                </span>
                {isSelected && !isSoldOut && (
                  <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#141413]">
                    Dipilih
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-[#52514D]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3 rounded-none bg-[#D4FF2A] border-2 border-[#141413] inline-block" aria-hidden="true" />
          <span>
            {isSelectionMode
              ? `Kursi Dipilih (${selectedSeats.length}/${quantity})`
              : 'Zona Dipilih'}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3 rounded-none bg-[#2B6E68] border border-[#141413] inline-block" aria-hidden="true" />
          <span>Kursi Tersedia</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3.5 h-3 rounded-none bg-[#EAE8E1] border border-[#6E6D68] inline-block" aria-hidden="true" />
          <span>Terisi / Terpesan</span>
        </span>
      </div>

      {seatNotice && (
        <div
          role="status"
          className={`rounded-none border px-3.5 py-2.5 text-xs font-medium ${
            seatNotice.type === 'info'
              ? 'border-[#141413] bg-[#F4F3EF] text-[#141413]'
              : 'border-[#C81E1E] bg-[#C81E1E]/10 text-[#C81E1E]'
          }`}
        >
          {seatNotice.text}
        </div>
      )}

      {inspectedCat && inspectedMeta && (
        <div className="rounded-none border border-[#DFDDD6] bg-[#F4F3EF] p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded-none shrink-0 border border-[#141413]"
                style={{ backgroundColor: inspectedMeta.style.color }}
                aria-hidden="true"
              />
              <span className="text-xs font-bold text-[#141413] truncate">
                {inspectedCat.name}
              </span>
              <span className="text-[11px] font-medium text-[#141413] bg-white border border-[#DFDDD6] rounded-none px-2 py-0.5">
                {inspectedMeta.style.zoneLabel}
              </span>
            </div>
            <span className="text-xs font-bold tabular-nums text-[#141413]">
              {inspectedRem > 0 ? `Sisa ${inspectedRem} kursi` : 'Kuota habis'}
            </span>
          </div>

          <p className="text-xs text-[#52514D] m-0 leading-relaxed">
            {inspectedMeta.style.viewNote}
          </p>

          {isSelectionMode && inspectedCat.id === selectedCategoryId && inspectedRem > 0 && (
            <div className="pt-2 border-t border-[#DFDDD6] flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-[#52514D]">Nomor Kursi:</span>
                {selectedSeats.length > 0 ? (
                  selectedSeats.map((code) => (
                    <button
                      type="button"
                      key={code}
                      onClick={() => {
                        if (onSelectSeats && quantity > 1) {
                          onSelectSeats(selectedSeats.filter((c) => c !== code));
                        }
                      }}
                      title={quantity > 1 ? `Hapus kursi ${code}` : `Kursi ${code}`}
                      className="inline-flex items-center gap-1 min-h-[36px] px-2.5 py-1 rounded-none bg-[#141413] text-[#D4FF2A] font-mono text-xs font-bold hover:bg-[#2A2A28] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
                    >
                      <span>{code}</span>
                      {quantity > 1 && <span aria-hidden="true" className="text-[11px] opacity-80">×</span>}
                    </button>
                  ))
                ) : (
                  <span className="text-xs font-medium text-[#8A5A00]">
                    Belum ada kursi dipilih
                  </span>
                )}
              </div>
              {selectedSeats.length < quantity && (
                <span className="text-[11px] font-bold text-[#C81E1E]">
                  Pilih {quantity - selectedSeats.length} kursi lagi pada denah
                </span>
              )}
            </div>
          )}

          <p className="text-[11px] text-[#6E6D68] m-0">
            {isSelectionMode
              ? 'Nomor kursi yang Anda pilih akan dikunci khusus untuk transaksi ini dan dicetak pada E-Ticket resmi.'
              : 'Ketersediaan kursi diperbarui secara langsung. Pemilihan nomor kursi dilakukan pada langkah reservasi tiket.'}
          </p>
        </div>
      )}
    </div>
  );
};
