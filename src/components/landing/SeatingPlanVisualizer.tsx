import React, { useMemo, useState } from 'react';
import type { TicketCategory } from './data';
import { formatIDR } from './data';

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

interface SeatNode {
  id: string;
  rowIdx: number;
  rowLabel: string;
  colIdx: number;
  seatNum: number;
  x: number;
  y: number;
  dist: number;
  tierIndex: number;
}

const STAGE_CX = 230;
const STAGE_CY = 308;
const STAGE_RADIUS = 80;
const STAGE_CLEARANCE = 96;
const ROW_LABELS = ['K', 'J', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];

function buildHallSeats(tierCount: number): SeatNode[] {
  const safeTiers = Math.max(1, tierCount);
  const rawNodes: Omit<SeatNode, 'tierIndex'>[] = [];

  for (let rowIdx = 0; rowIdx < 11; rowIdx++) {
    const y = 32 + rowIdx * 26;
    const rowLabel = ROW_LABELS[rowIdx] || String(rowIdx + 1);
    let seatCounter = 0;

    for (let colIdx = 0; colIdx < 14; colIdx++) {
      const x =
        colIdx < 7
          ? 209 - (6 - colIdx) * 26
          : 251 + (colIdx - 7) * 26;
      const dist = Math.hypot(x - STAGE_CX, y - STAGE_CY);

      if (dist < STAGE_CLEARANCE) continue;

      seatCounter += 1;
      rawNodes.push({
        id: `${rowLabel}-${seatCounter}`,
        rowIdx,
        rowLabel,
        colIdx,
        seatNum: seatCounter,
        x,
        y,
        dist,
      });
    }
  }

  if (safeTiers === 1) {
    return rawNodes.map((n) => ({ ...n, tierIndex: 0 }));
  }

  if (safeTiers === 2) {
    return rawNodes.map((n) => ({
      ...n,
      tierIndex: n.rowIdx >= 5 && n.dist <= 168 ? 0 : 1,
    }));
  }

  if (safeTiers === 3) {
    return rawNodes.map((n) => {
      if (n.rowIdx >= 6 && n.dist <= 145) return { ...n, tierIndex: 0 };
      if (n.rowIdx >= 4) return { ...n, tierIndex: 1 };
      return { ...n, tierIndex: 2 };
    });
  }

  // Group symmetric seat pairs by distance-weighted row score for 4+ dynamic tiers
  const scored = rawNodes.map((n) => ({
    id: n.id,
    score: n.dist + (10 - n.rowIdx) * 8,
  }));
  const uniqueScores = Array.from(new Set(scored.map((s) => Math.round(s.score)))).sort((a, b) => a - b);
  const scoreToTier = new Map<number, number>();
  uniqueScores.forEach((sc, idx) => {
    const t = Math.min(safeTiers - 1, Math.floor((idx * safeTiers) / uniqueScores.length));
    scoreToTier.set(sc, t);
  });

  return rawNodes.map((n) => {
    const key = Math.round(n.dist + (10 - n.rowIdx) * 8);
    return {
      ...n,
      tierIndex: scoreToTier.get(key) ?? safeTiers - 1,
    };
  });
}

export function getCategoryTierMap(categories: TicketCategory[]): Map<string, { tierIndex: number; style: ZoneVisualStyle }> {
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
  venue: string;
  categories: TicketCategory[];
  selectedCategoryId: string;
  quantity?: number;
  onSelectCategory: (category: TicketCategory) => void;
  compact?: boolean;
}

export const SeatingPlanVisualizer: React.FC<SeatingPlanVisualizerProps> = ({
  venue,
  categories,
  selectedCategoryId,
  quantity = 1,
  onSelectCategory,
  compact = false,
}) => {
  const [hoveredCatId, setHoveredCatId] = useState<string | null>(null);
  const [anchorSeatId, setAnchorSeatId] = useState<string | null>(null);
  const [soldOutNotice, setSoldOutNotice] = useState<string | null>(null);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => b.price - a.price),
    [categories]
  );

  const tierMap = useMemo(() => getCategoryTierMap(categories), [categories]);

  const seats = useMemo(
    () => buildHallSeats(sortedCategories.length),
    [sortedCategories.length]
  );

  const seatStateMap = useMemo(() => {
    const byTier = new Map<number, SeatNode[]>();
    seats.forEach((s) => {
      const list = byTier.get(s.tierIndex) || [];
      list.push(s);
      byTier.set(s.tierIndex, list);
    });

    const soldIds = new Set<string>();
    sortedCategories.forEach((cat, tierIdx) => {
      const tierSeats = byTier.get(tierIdx) || [];
      if (tierSeats.length === 0) return;

      const rem = getRemaining(cat);
      const totalQuota = Math.max(cat.quota || 0, rem);

      if (rem <= 0) {
        tierSeats.forEach((s) => soldIds.add(s.id));
        return;
      }

      if (totalQuota > rem) {
        const soldRatio = (totalQuota - rem) / totalQuota;
        const maxSoldVisual = Math.max(0, tierSeats.length - Math.min(rem, tierSeats.length));
        const visualSoldCount = Math.min(maxSoldVisual, Math.round(tierSeats.length * soldRatio));

        // Fill sold seats deterministically from front-center outward to reflect real occupancy
        const orderedForOccupancy = [...tierSeats].sort((a, b) => a.dist - b.dist || a.colIdx - b.colIdx);
        for (let i = 0; i < visualSoldCount; i++) {
          soldIds.add(orderedForOccupancy[i].id);
        }
      }
    });

    return { byTier, soldIds };
  }, [seats, sortedCategories]);

  const previewSeatIds = useMemo(() => {
    const activeTier = tierMap.get(selectedCategoryId)?.tierIndex;
    if (activeTier === undefined) return new Set<string>();

    const tierSeats = seatStateMap.byTier.get(activeTier) || [];
    const availableSeats = tierSeats.filter((s) => !seatStateMap.soldIds.has(s.id));
    if (availableSeats.length === 0) return new Set<string>();

    const targetCount = Math.max(1, Math.min(quantity, availableSeats.length));

    let ordered: SeatNode[];
    const anchor = anchorSeatId ? availableSeats.find((s) => s.id === anchorSeatId) : null;
    if (anchor) {
      ordered = [...availableSeats].sort((a, b) => {
        const sameRowA = a.rowIdx === anchor.rowIdx ? 0 : 1;
        const sameRowB = b.rowIdx === anchor.rowIdx ? 0 : 1;
        if (sameRowA !== sameRowB) return sameRowA - sameRowB;
        return Math.hypot(a.x - anchor.x, a.y - anchor.y) - Math.hypot(b.x - anchor.x, b.y - anchor.y);
      });
    } else {
      ordered = [...availableSeats].sort((a, b) => {
        const centerDiffA = Math.abs(a.x - STAGE_CX) + a.dist * 0.4;
        const centerDiffB = Math.abs(b.x - STAGE_CX) + b.dist * 0.4;
        return centerDiffA - centerDiffB;
      });
    }

    return new Set(ordered.slice(0, targetCount).map((s) => s.id));
  }, [tierMap, selectedCategoryId, seatStateMap, quantity, anchorSeatId]);

  const previewRowSummary = useMemo(() => {
    if (previewSeatIds.size === 0) return null;
    const chosen = seats.filter((s) => previewSeatIds.has(s.id));
    if (chosen.length === 0) return null;
    const rows = Array.from(new Set(chosen.map((s) => s.rowLabel))).join(', ');
    return `Baris ${rows} (${chosen.length} kursi)`;
  }, [previewSeatIds, seats]);

  const inspectedCat = useMemo(() => {
    const targetId = hoveredCatId || selectedCategoryId;
    return categories.find((c) => c.id === targetId) || sortedCategories[0] || null;
  }, [hoveredCatId, selectedCategoryId, categories, sortedCategories]);

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-[#E4DFD3] bg-[#FAF8F4] p-6 text-center">
        <p className="text-sm font-semibold text-[#171614] m-0">Denah Kursi Belum Tersedia</p>
        <p className="text-xs text-[#5C5850] mt-1 mb-0">
          Kategori tempat duduk untuk pertunjukan ini belum dikonfigurasi.
        </p>
      </div>
    );
  }

  const handleSeatInteraction = (seat: SeatNode) => {
    const cat = sortedCategories[seat.tierIndex];
    if (!cat) return;
    const rem = getRemaining(cat);
    if (rem <= 0) {
      setSoldOutNotice(`Kategori "${cat.name}" telah habis terjual. Silakan pilih zona lain yang masih tersedia.`);
      return;
    }
    setSoldOutNotice(null);
    setAnchorSeatId(seat.id);
    onSelectCategory(cat);
  };

  const handleLegendClick = (cat: TicketCategory) => {
    const rem = getRemaining(cat);
    if (rem <= 0) {
      setSoldOutNotice(`Kategori "${cat.name}" telah habis terjual. Silakan pilih zona lain yang masih tersedia.`);
      return;
    }
    setSoldOutNotice(null);
    setAnchorSeatId(null);
    onSelectCategory(cat);
  };

  const inspectedMeta = inspectedCat ? tierMap.get(inspectedCat.id) : null;
  const inspectedRem = inspectedCat ? getRemaining(inspectedCat) : 0;

  return (
    <div className="rounded-xl border border-[#E4DFD3] bg-[#FAF8F4] p-3.5 sm:p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E4DFD3] pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#171614] block">
            Denah Tempat Duduk
          </span>
          <span className="text-xs text-[#5C5850] block mt-0.5 truncate max-w-[260px] sm:max-w-none">
            {venue}
          </span>
        </div>
        <span className="text-[11px] font-medium text-[#5C5850] bg-white border border-[#E4DFD3] rounded-md px-2.5 py-1">
          Klik zona atau kursi untuk pratinjau
        </span>
      </div>

      <div className="w-full overflow-hidden">
        <svg
          viewBox="0 0 460 326"
          role="img"
          aria-label={`Denah kursi konser ${venue} dengan panggung setengah lingkaran di bagian bawah`}
          className={`w-full h-auto mx-auto block select-none ${compact ? 'max-w-[420px]' : 'max-w-[480px]'}`}
        >
          <rect
            x="10"
            y="8"
            width="440"
            height="310"
            rx="12"
            fill="#FFFFFF"
            stroke="#E4DFD3"
            strokeWidth="1.2"
          />

          <text
            x="230"
            y="22"
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="600"
            letterSpacing="1.6"
            fill="#6B665D"
          >
            AREA BELAKANG / BALKON
          </text>

          {ROW_LABELS.map((label, idx) => (
            <text
              key={label}
              x="25"
              y={35 + idx * 26}
              textAnchor="middle"
              fontSize="9"
              fontWeight="600"
              fill="#6B665D"
            >
              {label}
            </text>
          ))}

          <line
            x1="230"
            y1="28"
            x2="230"
            y2="218"
            stroke="#ECE8DF"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />

          <path
            d={`M ${STAGE_CX - STAGE_RADIUS} ${STAGE_CY} A ${STAGE_RADIUS} ${STAGE_RADIUS} 0 0 1 ${STAGE_CX + STAGE_RADIUS} ${STAGE_CY} Z`}
            fill="#ECE8DF"
            stroke="#CFC9BC"
            strokeWidth="1.5"
          />
          <text
            x={STAGE_CX}
            y={STAGE_CY - 22}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            letterSpacing="1.4"
            fill="#171614"
          >
            PANGGUNG
          </text>
          <text
            x={STAGE_CX}
            y={STAGE_CY - 9}
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="500"
            letterSpacing="1"
            fill="#5C5850"
          >
            STAGE
          </text>

          {seats.map((seat) => {
            const cat = sortedCategories[seat.tierIndex];
            if (!cat) return null;

            const style = tierMap.get(cat.id)?.style || TIER_PALETTE[0];
            const isSoldOutSeat = seatStateMap.soldIds.has(seat.id);
            const isCatSelected = cat.id === selectedCategoryId;
            const isCatHovered = cat.id === hoveredCatId;
            const isPreviewSeat = previewSeatIds.has(seat.id);

            let fill = style.color;
            let stroke = style.color;
            let strokeWidth = 1;
            let opacity = isCatSelected || isCatHovered ? 1 : 0.42;

            if (isSoldOutSeat) {
              fill = '#ECE8DF';
              stroke = '#857F74';
              strokeWidth = 1.1;
              opacity = 0.72;
            } else if (isPreviewSeat) {
              fill = '#C93018';
              stroke = '#171614';
              strokeWidth = 2;
              opacity = 1;
            }

            return (
              <g
                key={seat.id}
                onClick={() => handleSeatInteraction(seat)}
                onMouseEnter={() => setHoveredCatId(cat.id)}
                onMouseLeave={() => setHoveredCatId(null)}
                style={{ cursor: isSoldOutSeat ? 'not-allowed' : 'pointer' }}
              >
                <circle cx={seat.x} cy={seat.y} r={12} fill="transparent" />
                <circle
                  cx={seat.x}
                  cy={seat.y}
                  r={isPreviewSeat ? 9.2 : 8.2}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  opacity={opacity}
                />
                {isPreviewSeat && (
                  <circle cx={seat.x} cy={seat.y} r={2.6} fill="#FFFFFF" />
                )}
                {isSoldOutSeat && (
                  <line
                    x1={seat.x - 3.5}
                    y1={seat.y - 3.5}
                    x2={seat.x + 3.5}
                    y2={seat.y + 3.5}
                    stroke="#857F74"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

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
              className={`min-h-[44px] inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] ${
                isSoldOut
                  ? 'bg-[#ECE8DF] border-[#E4DFD3] text-[#6B665D] opacity-75'
                  : isSelected
                  ? 'bg-white border-2 border-[#171614] text-[#171614] font-semibold'
                  : 'bg-white/80 border-[#CFC9BC] text-[#171614] hover:border-[#171614]'
              }`}
            >
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 border"
                style={{
                  backgroundColor: isSoldOut ? '#ECE8DF' : color,
                  borderColor: isSoldOut ? '#857F74' : color,
                }}
                aria-hidden="true"
              />
              <span className="truncate max-w-[140px] sm:max-w-none">{cat.name}</span>
              <span className="tabular-nums font-semibold text-[#171614]">
                {formatIDR(cat.price)}
              </span>
              {isSoldOut && (
                <span className="text-[10px] font-mono font-bold text-[#B91C1C] uppercase">
                  Habis
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] text-[#5C5850]">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#C93018] border-2 border-[#171614] inline-block" aria-hidden="true" />
          <span>Pratinjau Kursi Dipilih ({quantity}x)</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#2B6E68] inline-block" aria-hidden="true" />
          <span>Zona Tersedia</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ECE8DF] border border-[#857F74] inline-block" aria-hidden="true" />
          <span>Terisi / Habis</span>
        </span>
      </div>

      {soldOutNotice && (
        <div
          role="status"
          className="rounded-lg border border-[#B91C1C]/30 bg-[#B91C1C]/10 px-3.5 py-2.5 text-xs font-medium text-[#B91C1C]"
        >
          {soldOutNotice}
        </div>
      )}

      {inspectedCat && inspectedMeta && (
        <div className="rounded-lg border border-[#E4DFD3] bg-white p-3.5 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: inspectedMeta.style.color }}
                aria-hidden="true"
              />
              <span className="text-xs font-semibold text-[#171614] truncate">
                {inspectedCat.name}
              </span>
              <span className="text-[11px] font-medium text-[#5C5850] bg-[#F6F4EE] border border-[#E4DFD3] rounded px-2 py-0.5">
                {inspectedMeta.style.zoneLabel}
              </span>
            </div>
            <span className="text-xs font-semibold tabular-nums text-[#171614]">
              {inspectedRem > 0 ? `Sisa ${inspectedRem} kursi` : 'Kuota habis'}
            </span>
          </div>

          <p className="text-xs text-[#5C5850] m-0 leading-relaxed">
            {inspectedMeta.style.viewNote}
            {inspectedCat.id === selectedCategoryId && previewRowSummary && inspectedRem > 0 && (
              <span className="text-[#171614] font-medium">
                {' '}Estimasi posisi pratinjau: {previewRowSummary}.
              </span>
            )}
          </p>

          <p className="text-[11px] text-[#6B665D] m-0">
            Denah ini memberikan referensi letak zona terhadap panggung. Penempatan kursi final mengikuti kategori tiket saat check-in.
          </p>
        </div>
      )}
    </div>
  );
};
