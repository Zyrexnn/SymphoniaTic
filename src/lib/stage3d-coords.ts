export interface Seat2DInput {
  seatCode: string;
  rowLabel: string;
  seatNumber: number;
  x: number;
  y: number;
  categoryId: string;
  status: 'AVAILABLE' | 'BOOKED';
}

export interface Seat3DPoint {
  seatCode: string;
  rowLabel: string;
  seatNumber: number;
  categoryId: string;
  status: 'AVAILABLE' | 'BOOKED';
  x3d: number;
  y3d: number;
  z3d: number;
  rowIndex: number;
}

export interface CameraPose {
  position: [number, number, number];
  target: [number, number, number];
}

export const DEFAULT_STAGE_CX = 260;
export const DEFAULT_STAGE_CY = 46;
export const COORD_SCALE = 0.055;
export const ROW_ELEVATION_STEP = 0.24;
export const EYE_HEIGHT_ABOVE_SEAT = 1.15;
export const STAGE_FOCUS_TARGET: [number, number, number] = [0, 2.1, -3.2];

export function getRowIndex(rowLabel: string): number {
  const normalized = rowLabel.trim().toUpperCase();
  if (!normalized) return 0;

  if (normalized.length === 1) {
    const code = normalized.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return code - 65;
    }
    return 0;
  }

  if (normalized.startsWith('R')) {
    const extraNum = Number.parseInt(normalized.slice(1), 10);
    if (Number.isFinite(extraNum) && extraNum >= 1) {
      return 25 + extraNum;
    }
  }

  return 0;
}

export function projectSeatsTo3D(
  seats: ReadonlyArray<Seat2DInput>,
  stageCx: number = DEFAULT_STAGE_CX,
  stageCy: number = DEFAULT_STAGE_CY
): Seat3DPoint[] {
  return seats.map((seat) => {
    const rowIndex = getRowIndex(seat.rowLabel);
    const x3d = (seat.x - stageCx) * COORD_SCALE;
    const z3d = (seat.y - stageCy) * COORD_SCALE;
    const y3d = rowIndex * ROW_ELEVATION_STEP;

    return {
      seatCode: seat.seatCode,
      rowLabel: seat.rowLabel,
      seatNumber: seat.seatNumber,
      categoryId: seat.categoryId,
      status: seat.status,
      x3d,
      y3d,
      z3d,
      rowIndex,
    };
  });
}

export function getOverviewCameraPose(points: ReadonlyArray<Seat3DPoint>): CameraPose {
  if (points.length === 0) {
    return {
      position: [8.5, 13.5, 19.5],
      target: [0, 2.2, 1.2],
    };
  }

  let maxZ = 8;
  let maxY = 1;
  for (const p of points) {
    if (Number.isFinite(p.z3d) && p.z3d > maxZ) maxZ = p.z3d;
    if (Number.isFinite(p.y3d) && p.y3d > maxY) maxY = p.y3d;
  }

  const clampedMaxZ = Math.min(Math.max(maxZ, 8), 34);
  const clampedMaxY = Math.min(Math.max(maxY, 1), 10);

  return {
    position: [7.8, clampedMaxY + 10.2, clampedMaxZ + 9.2],
    target: [0, 2.2, clampedMaxZ * 0.12],
  };
}

export function getBalconyCameraPose(points: ReadonlyArray<Seat3DPoint>): CameraPose {
  let maxZ = 14;
  for (const p of points) {
    if (Number.isFinite(p.z3d) && p.z3d > maxZ) maxZ = p.z3d;
  }
  const clampedMaxZ = Math.min(Math.max(maxZ, 12), 34);
  return {
    position: [0, 6.2, clampedMaxZ + 1.6],
    target: [0, 2.2, -3.5],
  };
}

export function getSeatViewCameraPose(seat: Seat3DPoint): CameraPose {
  return {
    position: [seat.x3d, seat.y3d + EYE_HEIGHT_ABOVE_SEAT, seat.z3d],
    target: [...STAGE_FOCUS_TARGET],
  };
}

export function getZoneViewCameraPose(
  points: ReadonlyArray<Seat3DPoint>,
  categoryId: string
): CameraPose {
  const zoneSeats = points.filter((p) => p.categoryId === categoryId);
  if (zoneSeats.length === 0) {
    return getOverviewCameraPose(points);
  }

  const preferred = zoneSeats.filter((p) => p.status === 'AVAILABLE');
  const pool = preferred.length > 0 ? preferred : zoneSeats;

  const sorted = [...pool].sort((a, b) => {
    const scoreA = a.z3d + Math.abs(a.x3d) * 0.65;
    const scoreB = b.z3d + Math.abs(b.x3d) * 0.65;
    return scoreA - scoreB;
  });

  return getSeatViewCameraPose(sorted[0]);
}
