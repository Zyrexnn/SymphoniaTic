import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import type { TicketCategory, SeatItem } from './data';
import { formatIDR, getEventSeatsAPI } from './data';

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

const STAGE_CX = 230;
const STAGE_CY = 308;
const STAGE_RADIUS = 80;
const STAGE_CLEARANCE = 96;
const STANDARD_ROW_LABELS = ['K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];

function rowLabelForExtraIndex(extraIdx: number): string {
  const code = 'L'.charCodeAt(0) + extraIdx;
  if (code <= 'Z'.charCodeAt(0)) {
    return String.fromCharCode(code);
  }
  return `R${code - 'Z'.charCodeAt(0)}`;
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

function buildSlotCoordinateLookup(extraRowCount: number): {
  byCode: Map<string, SlotCoord>;
  rowHeaders: { label: string; y: number }[];
} {
  const byCode = new Map<string, SlotCoord>();
  const rowHeaders: { label: string; y: number }[] = [];

  for (let rowIdx = 0; rowIdx < STANDARD_ROW_LABELS.length; rowIdx++) {
    const y = 32 + rowIdx * 26;
    const rowLabel = STANDARD_ROW_LABELS[rowIdx];
    rowHeaders.push({ label: rowLabel, y });
    let seatCounter = 0;

    for (let colIdx = 0; colIdx < 14; colIdx++) {
      const x = colIdx < 7 ? 209 - (6 - colIdx) * 26 : 251 + (colIdx - 7) * 26;
      const dist = Math.hypot(x - STAGE_CX, y - STAGE_CY);
      if (dist < STAGE_CLEARANCE) continue;

      seatCounter += 1;
      const seatCode = `${rowLabel}-${seatCounter}`;
      byCode.set(seatCode, {
        seatCode,
        rowLabel,
        seatNumber: seatCounter,
        x,
        y,
        dist,
        colIdx,
      });
    }
  }

  for (let extraIdx = 0; extraIdx < extraRowCount; extraIdx++) {
    const y = 32 - (extraIdx + 1) * 26;
    const rowLabel = rowLabelForExtraIndex(extraIdx);
    rowHeaders.unshift({ label: rowLabel, y });

    for (let colIdx = 0; colIdx < 14; colIdx++) {
      const x = colIdx < 7 ? 209 - (6 - colIdx) * 26 : 251 + (colIdx - 7) * 26;
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
  const extraRows = totalQuota > 138 ? Math.ceil((totalQuota - 138) / 14) : 0;
  const { byCode } = buildSlotCoordinateLookup(extraRows);

  const slots = Array.from(byCode.values()).sort((a, b) => {
    const scoreA = a.dist + (STAGE_CY - a.y) * 0.38;
    const scoreB = b.dist + (STAGE_CY - b.y) * 0.38;
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
      y: 150,
      dist: 150,
      colIdx: seat.seatNumber,
    };
    const list = byRow.get(seat.rowLabel) || [];
    list.push({ seat, coord });
    byRow.set(seat.rowLabel, list);
  });

  // Prioritaskan deretan kursi berdampingan dalam satu baris dengan jarak terdekat ke tengah panggung
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

  const extraRowCount = useMemo(() => {
    if (!resolvedBackendSeats || resolvedBackendSeats.length === 0) {
      const totalQuota = categories.reduce((acc, c) => acc + Math.max(0, c.quota || 0), 0);
      return totalQuota > 138 ? Math.ceil((totalQuota - 138) / 14) : 0;
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
          x: 42 + ((s.seatNumber - 1) % 14) * 26,
          y: 32,
          dist: 200,
          colIdx: (s.seatNumber - 1) % 14,
          categoryId: s.categoryId,
          status: s.status,
        };
      });
    }
    return buildFallbackHallSeats(categories);
  }, [resolvedBackendSeats, slotLookup, categories]);

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

  const extraTopSpace = extraRowCount * 26;
  const viewBoxTop = -extraTopSpace;
  const viewBoxHeight = 326 + extraTopSpace;

  const hoveredSeatCategory = hoveredSeat ? categoryMap.get(hoveredSeat.categoryId) : null;

  return (
    <div className="rounded-none border border-[#DFDDD6] bg-white p-3.5 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DFDDD6] pb-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#141413] block">
            • Denah Tempat Duduk
          </span>
          <span className="text-xs text-[#52514D] block mt-0.5 truncate max-w-[260px] sm:max-w-none">
            {venue}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#52514D] bg-[#F4F3EF] border border-[#DFDDD6] rounded-none px-2.5 py-1">
              <RefreshCw className="w-3 h-3 animate-spin text-[#141413]" aria-hidden="true" />
              <span>Memuat kursi...</span>
            </span>
          )}
          {isSelectionMode ? (
            <button
              type="button"
              onClick={handleAutoPick}
              disabled={isLoading || getRemaining(categoryMap.get(selectedCategoryId) || sortedCategories[0]) <= 0}
              className="min-h-[36px] inline-flex items-center gap-1.5 text-[11px] font-bold text-[#141413] bg-[#D4FF2A] hover:bg-[#C2EE1A] border border-[#141413] rounded-none px-2.5 py-1 transition-colors disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#141413]" aria-hidden="true" />
              <span>Pilih Otomatis ({quantity}x)</span>
            </button>
          ) : (
            <span className="text-[11px] font-medium text-[#52514D] bg-[#F4F3EF] border border-[#DFDDD6] rounded-none px-2.5 py-1">
              Klik zona atau kursi untuk melihat posisi
            </span>
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
              className="text-xs font-semibold underline shrink-0"
            >
              Coba Lagi
            </button>
          )}
        </div>
      )}

      <div className="w-full overflow-hidden">
        <svg
          viewBox={`0 ${viewBoxTop} 460 ${viewBoxHeight}`}
          role="img"
          aria-label={`Denah kursi konser ${venue} dengan panggung setengah lingkaran di bagian bawah`}
          className={`w-full h-auto mx-auto block select-none ${compact ? 'max-w-[420px]' : 'max-w-[480px]'}`}
        >
          <rect
            x="10"
            y={8 - extraTopSpace}
            width="440"
            height={310 + extraTopSpace}
            rx="0"
            fill="#F4F3EF"
            stroke="#DFDDD6"
            strokeWidth="1.2"
          />

          <text
            x="230"
            y={20 - extraTopSpace}
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="700"
            letterSpacing="1.6"
            fill="#52514D"
          >
            AREA BELAKANG / BALKON
          </text>

          {rowHeaders.map((row) => (
            <text
              key={row.label}
              x="25"
              y={row.y + 3}
              textAnchor="middle"
              fontSize="9"
              fontWeight="700"
              fill="#52514D"
            >
              {row.label}
            </text>
          ))}

          <line
            x1="230"
            y1={28 - extraTopSpace}
            x2="230"
            y2="218"
            stroke="#DFDDD6"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />

          <path
            d={`M ${STAGE_CX - STAGE_RADIUS} ${STAGE_CY} A ${STAGE_RADIUS} ${STAGE_RADIUS} 0 0 1 ${STAGE_CX + STAGE_RADIUS} ${STAGE_CY} Z`}
            fill="#141413"
            stroke="#141413"
            strokeWidth="1.5"
          />
          <text
            x={STAGE_CX}
            y={STAGE_CY - 22}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            letterSpacing="1.4"
            fill="#D4FF2A"
          >
            PANGGUNG
          </text>
          <text
            x={STAGE_CX}
            y={STAGE_CY - 9}
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="600"
            letterSpacing="1"
            fill="#F4F3EF"
          >
            STAGE
          </text>

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
              strokeLinecap="round"
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

            let fill = style.color;
            let stroke = style.color;
            let strokeWidth = 1;
            let opacity = isCatSelected || isCatHovered ? 1 : 0.42;

            if (isBooked) {
              fill = '#EAE8E1';
              stroke = '#6E6D68';
              strokeWidth = 1.1;
              opacity = 0.72;
            } else if (isSelectedSeat) {
              fill = '#D4FF2A';
              stroke = '#141413';
              strokeWidth = 2;
              opacity = 1;
            }

            return (
              <g
                key={seat.seatCode}
                role="button"
                tabIndex={isBooked ? -1 : 0}
                aria-label={`Kursi ${seat.seatCode}, ${cat.name}, ${isBooked ? 'Sudah dipesan' : isSelectedSeat ? 'Dipilih' : 'Tersedia'}`}
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
                style={{ cursor: isBooked ? 'not-allowed' : 'pointer', outline: 'none' }}
              >
                <circle cx={seat.x} cy={seat.y} r={12} fill="transparent" />
                <circle
                  cx={seat.x}
                  cy={seat.y}
                  r={isSelectedSeat ? 9.4 : 8.2}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                />
                {isSelectedSeat && <circle cx={seat.x} cy={seat.y} r={2.8} fill="#141413" />}
                {isBooked && (
                  <line
                    x1={seat.x - 3.5}
                    y1={seat.y - 3.5}
                    x2={seat.x + 3.5}
                    y2={seat.y + 3.5}
                    stroke="#6E6D68"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {hoveredSeat && hoveredSeatCategory && (
        <div className="text-center text-xs font-medium text-[#141413] bg-[#F4F3EF] border border-[#DFDDD6] rounded-none px-3 py-1.5">
          Kursi <span className="font-mono font-bold">{hoveredSeat.seatCode}</span> &middot;{' '}
          <span>{hoveredSeatCategory.name}</span> &middot;{' '}
          <span className={hoveredSeat.status === 'BOOKED' ? 'text-[#C81E1E]' : 'text-[#156E3F]'}>
            {hoveredSeat.status === 'BOOKED' ? 'Sudah Terisi' : 'Tersedia'}
          </span>
        </div>
      )}

      <div className="flex flex-wrap gap-2 justify-center" role="group" aria-label="Pilih zona kategori tempat duduk">
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
              className={`min-h-[44px] inline-flex items-center gap-2 px-3 py-2 rounded-none border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
                isSoldOut
                  ? 'bg-[#EAE8E1] border-[#DFDDD6] text-[#6E6D68] opacity-75'
                  : isSelected
                  ? 'bg-[#D4FF2A] border-[#141413] text-[#141413] font-bold'
                  : 'bg-[#F4F3EF] border-[#DFDDD6] text-[#141413] hover:border-[#141413]'
              }`}
            >
              <span
                className="w-3 h-3 rounded-none shrink-0 border"
                style={{
                  backgroundColor: isSoldOut ? '#EAE8E1' : color,
                  borderColor: isSoldOut ? '#6E6D68' : '#141413',
                }}
                aria-hidden="true"
              />
              <span className="truncate max-w-[140px] sm:max-w-none">{cat.name}</span>
              <span className="tabular-nums font-bold text-[#141413]">
                {formatIDR(cat.price)}
              </span>
              {isSoldOut && (
                <span className="text-[10px] font-mono font-bold text-[#C81E1E] uppercase">
                  Habis
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] text-[#52514D]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#D4FF2A] border-2 border-[#141413] inline-block" aria-hidden="true" />
          <span>
            {isSelectionMode
              ? `Kursi Dipilih (${selectedSeats.length}/${quantity})`
              : 'Zona Dipilih'}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#2B6E68] inline-block" aria-hidden="true" />
          <span>Kursi Tersedia</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#EAE8E1] border border-[#6E6D68] inline-block" aria-hidden="true" />
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
                      className="inline-flex items-center gap-1 min-h-[32px] px-2.5 py-1 rounded-none bg-[#141413] text-[#D4FF2A] font-mono text-xs font-bold hover:bg-[#2A2A28] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
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
