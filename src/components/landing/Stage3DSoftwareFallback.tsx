import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Compass, Eye, Layers, Maximize2, Minimize2, RotateCcw } from 'lucide-react';
import type { TicketCategory } from './data';
import {
  getBalconyCameraPose,
  getOverviewCameraPose,
  getSeatViewCameraPose,
  getZoneViewCameraPose,
  STAGE_FOCUS_TARGET,
  type CameraPose,
  type Seat3DPoint,
} from '../../lib/stage3d-coords';

type CameraMode = 'overview' | 'seat' | 'stage' | 'balcony';

interface Stage3DSoftwareFallbackProps {
  venue: string;
  projectedSeats: Seat3DPoint[];
  categories: TicketCategory[];
  tierColors: Record<string, string>;
  selectedCategoryId: string;
  selectedSeats: string[];
  onSelectSeat?: (seatCode: string) => void;
}

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

interface ProjectedPoint {
  sx: number;
  sy: number;
  depth: number;
  scale: number;
}

function projectPoint(
  p: Vec3,
  camPos: Vec3,
  camTarget: Vec3,
  width: number,
  height: number,
  fovDeg = 50
): ProjectedPoint | null {
  const fx = camTarget.x - camPos.x;
  const fy = camTarget.y - camPos.y;
  const fz = camTarget.z - camPos.z;
  const fLen = Math.hypot(fx, fy, fz) || 1;
  const forward = { x: fx / fLen, y: fy / fLen, z: fz / fLen };

  let rx = -forward.z;
  let ry = 0;
  let rz = forward.x;
  const rLen = Math.hypot(rx, ry, rz) || 1;
  rx /= rLen;
  ry /= rLen;
  rz /= rLen;

  const ux = ry * forward.z - rz * forward.y;
  const uy = rz * forward.x - rx * forward.z;
  const uz = rx * forward.y - ry * forward.x;

  const dx = p.x - camPos.x;
  const dy = p.y - camPos.y;
  const dz = p.z - camPos.z;

  const cx = dx * rx + dy * ry + dz * rz;
  const cy = dx * ux + dy * uy + dz * uz;
  const cz = dx * forward.x + dy * forward.y + dz * forward.z;

  if (cz <= 0.35) return null;

  const f = (height / 2) / Math.tan((fovDeg * Math.PI) / 360);
  const sx = width / 2 + (cx * f) / cz;
  const sy = height / 2 - (cy * f) / cz;
  return { sx, sy, depth: cz, scale: f / cz };
}

function drawPolygon3D(
  ctx: CanvasRenderingContext2D,
  pts: Vec3[],
  camPos: Vec3,
  camTarget: Vec3,
  w: number,
  h: number,
  fill: string | CanvasGradient,
  stroke?: string,
  lineWidth = 1
) {
  const projected: ProjectedPoint[] = [];
  for (const p of pts) {
    const pr = projectPoint(p, camPos, camTarget, w, h);
    if (!pr) return;
    projected.push(pr);
  }
  ctx.beginPath();
  ctx.moveTo(projected[0].sx, projected[0].sy);
  for (let i = 1; i < projected.length; i++) {
    ctx.lineTo(projected[i].sx, projected[i].sy);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

function drawLine3D(
  ctx: CanvasRenderingContext2D,
  a: Vec3,
  b: Vec3,
  camPos: Vec3,
  camTarget: Vec3,
  w: number,
  h: number,
  stroke: string,
  lineWidth = 1
) {
  const pa = projectPoint(a, camPos, camTarget, w, h);
  const pb = projectPoint(b, camPos, camTarget, w, h);
  if (!pa || !pb) return;
  ctx.beginPath();
  ctx.moveTo(pa.sx, pa.sy);
  ctx.lineTo(pb.sx, pb.sy);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
}

export const Stage3DSoftwareFallback: React.FC<Stage3DSoftwareFallbackProps> = ({
  venue,
  projectedSeats,
  categories,
  tierColors,
  selectedCategoryId,
  selectedSeats,
  onSelectSeat,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [canvasSizeTick, setCanvasSizeTick] = useState(0);
  const [activeSeatInfo, setActiveSeatInfo] = useState<string | null>(null);
  const [orbitOffset, setOrbitOffset] = useState<{ yaw: number; pitch: number; zoom: number }>({
    yaw: 0,
    pitch: 0,
    zoom: 1,
  });

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => {
      setCanvasSizeTick((t) => t + 1);
    });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  const selectedSeatSet = useMemo(() => new Set(selectedSeats), [selectedSeats]);
  const hitTargetsRef = useRef<{ seat: Seat3DPoint; sx: number; sy: number; r: number }[]>([]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const basePose = useMemo<CameraPose>(() => {
    if (cameraMode === 'overview') {
      return getOverviewCameraPose(projectedSeats);
    }
    if (cameraMode === 'balcony') {
      return getBalconyCameraPose(projectedSeats);
    }
    if (cameraMode === 'stage') {
      return {
        position: [0, 3.8, 10.6],
        target: [...STAGE_FOCUS_TARGET],
      };
    }
    const lastSelectedCode = selectedSeats[selectedSeats.length - 1];
    if (lastSelectedCode) {
      const targetSeat = projectedSeats.find((s) => s.seatCode === lastSelectedCode);
      if (targetSeat) {
        return getSeatViewCameraPose(targetSeat);
      }
    }
    return getZoneViewCameraPose(projectedSeats, selectedCategoryId);
  }, [cameraMode, projectedSeats, selectedSeats, selectedCategoryId]);

  useEffect(() => {
    setOrbitOffset({ yaw: 0, pitch: 0, zoom: 1 });
  }, [cameraMode, selectedCategoryId, selectedSeats]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.clientWidth || 520;
    const height = canvas.clientHeight || 380;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target: Vec3 = {
      x: basePose.target[0],
      y: basePose.target[1],
      z: basePose.target[2],
    };
    const relX = basePose.position[0] - target.x;
    const relY = basePose.position[1] - target.y;
    const relZ = basePose.position[2] - target.z;
    const baseDist = Math.hypot(relX, relY, relZ) || 1;
    const dist = Math.max(2.4, Math.min(36, baseDist * orbitOffset.zoom));

    const baseYaw = Math.atan2(relX, relZ);
    const basePitch = Math.asin(Math.max(-0.95, Math.min(0.95, relY / baseDist)));
    const yaw = baseYaw + orbitOffset.yaw;
    const pitch = Math.max(-0.12, Math.min(1.22, basePitch + orbitOffset.pitch));

    const camPos: Vec3 = {
      x: target.x + dist * Math.cos(pitch) * Math.sin(yaw),
      y: Math.max(0.75, target.y + dist * Math.sin(pitch)),
      z: target.z + dist * Math.cos(pitch) * Math.cos(yaw),
    };

    // Gradien suasana ruang konser hangat
    const bgGrad = ctx.createRadialGradient(width * 0.5, height * 0.25, 20, width * 0.5, height * 0.5, width * 0.85);
    bgGrad.addColorStop(0, '#2C2017');
    bgGrad.addColorStop(0.65, '#191411');
    bgGrad.addColorStop(1, '#100D0B');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const maxSeatZ = projectedSeats.reduce((m, s) => Math.max(m, s.z3d), 10);
    const floorBackZ = Math.max(15.5, maxSeatZ + 3.2);
    const hallHalfW = 12.6;

    // Langit-langit coffered belah ketupat (hanya saat kamera berada di dalam hall)
    if (camPos.y < 9.5) {
      drawPolygon3D(
        ctx,
        [
          { x: -hallHalfW, y: 10.2, z: -6.5 },
          { x: hallHalfW, y: 10.2, z: -6.5 },
          { x: hallHalfW, y: 10.2, z: floorBackZ },
          { x: -hallHalfW, y: 10.2, z: floorBackZ },
        ],
        camPos,
        target,
        width,
        height,
        '#3C291E',
        '#6E513A'
      );

      // Kisi belah ketupat bercahaya lembut
      for (let gz = -4; gz < floorBackZ; gz += 4.2) {
        for (let gx = -9; gx <= 9; gx += 4.5) {
          drawPolygon3D(
            ctx,
            [
              { x: gx, y: 10.16, z: gz - 1.3 },
              { x: gx + 1.5, y: 10.16, z: gz },
              { x: gx, y: 10.16, z: gz + 1.3 },
              { x: gx - 1.5, y: 10.16, z: gz },
            ],
            camPos,
            target,
            width,
            height,
            'rgba(255, 240, 208, 0.28)',
            'rgba(210, 185, 145, 0.5)',
            1
          );
        }
      }
    }

    // Lantai hall utama
    drawPolygon3D(
      ctx,
      [
        { x: -hallHalfW, y: -0.1, z: -6.5 },
        { x: hallHalfW, y: -0.1, z: -6.5 },
        { x: hallHalfW, y: -0.1, z: floorBackZ },
        { x: -hallHalfW, y: -0.1, z: floorBackZ },
      ],
      camPos,
      target,
      width,
      height,
      '#3B271A',
      '#5B3D27'
    );

    // Dinding apse belakang panggung (kayu walnut hangat)
    drawPolygon3D(
      ctx,
      [
        { x: -11.8, y: 0.65, z: -6.4 },
        { x: 11.8, y: 0.65, z: -6.4 },
        { x: 11.8, y: 10.1, z: -6.4 },
        { x: -11.8, y: 10.1, z: -6.4 },
      ],
      camPos,
      target,
      width,
      height,
      '#4E3422',
      '#785338'
    );

    // Dinding samping, balkon samping, pilar putih klasik & ceruk patung emas
    const sideOrder = camPos.x >= 0 ? [-1, 1] : [1, -1];
    sideOrder.forEach((side) => {
      const wx = side * hallHalfW;
      drawPolygon3D(
        ctx,
        [
          { x: wx, y: 0, z: -6.2 },
          { x: wx, y: 10.1, z: -6.2 },
          { x: wx, y: 10.1, z: floorBackZ },
          { x: wx, y: 0, z: floorBackZ },
        ],
        camPos,
        target,
        width,
        height,
        side === -1 ? '#573A26' : '#4B3220',
        '#785338'
      );

      // Cornice atas gading
      drawLine3D(
        ctx,
        { x: wx - side * 0.2, y: 9.95, z: -6.2 },
        { x: wx - side * 0.2, y: 9.95, z: floorBackZ },
        camPos,
        target,
        width,
        height,
        '#EAE5DA',
        2.5
      );

      // Deretan pilar putih klasik & ceruk merah marun berpatung emas
      const bays = 5;
      const span = (floorBackZ + 4) / bays;
      for (let b = 0; b <= bays; b++) {
        const bz = -4.2 + b * span;
        const pBot = projectPoint({ x: wx - side * 0.35, y: 4.5, z: bz }, camPos, target, width, height);
        const pTop = projectPoint({ x: wx - side * 0.35, y: 9.8, z: bz }, camPos, target, width, height);
        if (pBot && pTop) {
          ctx.beginPath();
          ctx.moveTo(pBot.sx, pBot.sy);
          ctx.lineTo(pTop.sx, pTop.sy);
          ctx.strokeStyle = '#ECE7DC';
          ctx.lineWidth = Math.max(3, 0.55 * pBot.scale);
          ctx.stroke();
        }
        if (b < bays) {
          const nz = bz + span * 0.5;
          drawPolygon3D(
            ctx,
            [
              { x: wx - side * 0.18, y: 5.7, z: nz - 0.7 },
              { x: wx - side * 0.18, y: 8.7, z: nz - 0.7 },
              { x: wx - side * 0.18, y: 8.7, z: nz + 0.7 },
              { x: wx - side * 0.18, y: 5.7, z: nz + 0.7 },
            ],
            camPos,
            target,
            width,
            height,
            '#6B2229',
            '#E6DFD2',
            1.2
          );
          const statBot = projectPoint({ x: wx - side * 0.3, y: 6.2, z: nz }, camPos, target, width, height);
          const statTop = projectPoint({ x: wx - side * 0.3, y: 7.9, z: nz }, camPos, target, width, height);
          if (statBot && statTop) {
            ctx.beginPath();
            ctx.moveTo(statBot.sx, statBot.sy);
            ctx.lineTo(statTop.sx, statTop.sy);
            ctx.strokeStyle = '#D8B25C';
            ctx.lineWidth = Math.max(2.5, 0.32 * statBot.scale);
            ctx.stroke();
          }
        }
      }

      // Balkon samping menjorok ke dalam
      const bxInner = wx - side * 2.5;
      drawPolygon3D(
        ctx,
        [
          { x: wx, y: 3.45, z: -3.5 },
          { x: bxInner, y: 3.45, z: -3.5 },
          { x: bxInner, y: 3.45, z: floorBackZ },
          { x: wx, y: 3.45, z: floorBackZ },
        ],
        camPos,
        target,
        width,
        height,
        '#6F4E37',
        '#9A7253'
      );
      drawPolygon3D(
        ctx,
        [
          { x: bxInner, y: 3.45, z: -3.5 },
          { x: bxInner, y: 4.42, z: -3.5 },
          { x: bxInner, y: 4.42, z: floorBackZ },
          { x: bxInner, y: 3.45, z: floorBackZ },
        ],
        camPos,
        target,
        width,
        height,
        '#5E3F2A',
        '#EEE9DF',
        1.5
      );
    });

    // Balkon paduan suara belakang panggung
    drawPolygon3D(
      ctx,
      [
        { x: -11.0, y: 2.25, z: -5.6 },
        { x: 11.0, y: 2.25, z: -5.6 },
        { x: 11.0, y: 3.35, z: -5.6 },
        { x: -11.0, y: 3.35, z: -5.6 },
      ],
      camPos,
      target,
      width,
      height,
      '#6A4932',
      '#EEE9DF',
      1.6
    );

    // Pipa Organ Casavant (31 pipa metalik simetris + 2 menara pipa emas besar)
    drawPolygon3D(
      ctx,
      [
        { x: -5.6, y: 4.9, z: -6.32 },
        { x: 5.6, y: 4.9, z: -6.32 },
        { x: 5.6, y: 9.4, z: -6.32 },
        { x: -5.6, y: 9.4, z: -6.32 },
      ],
      camPos,
      target,
      width,
      height,
      '#2B1D14',
      '#C9A34E'
    );

    for (let i = 0; i < 31; i++) {
      const t = i / 30;
      const px = (t - 0.5) * 9.8;
      const distC = Math.abs(t - 0.5) * 2;
      const h = 2.0 + distC * 1.45 + Math.abs(Math.sin(distC * Math.PI * 1.35)) * 1.05;
      const p1 = projectPoint({ x: px, y: 5.1, z: -6.18 }, camPos, target, width, height);
      const p2 = projectPoint({ x: px, y: 5.1 + h, z: -6.18 }, camPos, target, width, height);
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.strokeStyle = i % 2 === 0 ? '#E4E9EE' : '#B5BDC6';
        ctx.lineWidth = Math.max(1.4, 0.14 * p1.scale);
        ctx.stroke();
      }
    }

    // Dua menara pipa organ emas di kiri & kanan
    [-4.85, 4.85].forEach((tx) => {
      drawPolygon3D(
        ctx,
        [
          { x: tx - 0.82, y: 5.4, z: -5.9 },
          { x: tx + 0.82, y: 5.4, z: -5.9 },
          { x: tx + 0.82, y: 9.2, z: -5.9 },
          { x: tx - 0.82, y: 9.2, z: -5.9 },
        ],
        camPos,
        target,
        width,
        height,
        '#D4AE5A',
        '#7A5739',
        1.5
      );
      drawPolygon3D(
        ctx,
        [
          { x: tx - 0.95, y: 9.2, z: -5.9 },
          { x: tx + 0.95, y: 9.2, z: -5.9 },
          { x: tx + 0.65, y: 9.85, z: -5.9 },
          { x: tx - 0.65, y: 9.85, z: -5.9 },
        ],
        camPos,
        target,
        width,
        height,
        '#6D4B33',
        '#D8B25C'
      );
    });

    // Panel akustik tengah di depan organ
    drawPolygon3D(
      ctx,
      [
        { x: -1.85, y: 5.65, z: -5.85 },
        { x: 1.85, y: 5.65, z: -5.85 },
        { x: 1.85, y: 7.9, z: -5.85 },
        { x: -1.85, y: 7.9, z: -5.85 },
      ],
      camPos,
      target,
      width,
      height,
      '#202226',
      '#6E6D68',
      1.2
    );

    // Panggung orkestra kayu ek melengkung + garis papan parket
    const stagePts: Vec3[] = [
      { x: -10.8, y: 0.72, z: -5.8 },
      { x: 10.8, y: 0.72, z: -5.8 },
      { x: 10.8, y: 0.72, z: -1.6 },
    ];
    for (let i = 1; i <= 14; i++) {
      const t = i / 14;
      const x = 10.8 - t * 21.6;
      const z = -1.6 + Math.sin(t * Math.PI) * 1.9;
      stagePts.push({ x, y: 0.72, z });
    }
    const stageGrad = ctx.createLinearGradient(0, height * 0.25, 0, height * 0.7);
    stageGrad.addColorStop(0, '#D4B284');
    stageGrad.addColorStop(1, '#B99262');
    drawPolygon3D(ctx, stagePts, camPos, target, width, height, stageGrad, '#D8B25C', 1.8);

    // 4 undakan kayu orkestra bertingkat
    for (let step = 0; step < 4; step++) {
      const rW = 9.8 - step * 0.55;
      const zFront = -2.65 - step * 0.74;
      const zBack = zFront - 0.72;
      const yTop = 0.92 + step * 0.19;
      drawPolygon3D(
        ctx,
        [
          { x: -rW, y: yTop, z: zBack },
          { x: rW, y: yTop, z: zBack },
          { x: rW, y: yTop, z: zFront },
          { x: -rW, y: yTop, z: zFront },
        ],
        camPos,
        target,
        width,
        height,
        step % 2 === 0 ? '#C7A274' : '#BA9465',
        '#8F6C44',
        1
      );
    }

    // Podium konduktor & Concert Grand Piano
    drawPolygon3D(
      ctx,
      [
        { x: -0.58, y: 0.94, z: -1.0 },
        { x: 0.58, y: 0.94, z: -1.0 },
        { x: 0.58, y: 0.94, z: -0.25 },
        { x: -0.58, y: 0.94, z: -0.25 },
      ],
      camPos,
      target,
      width,
      height,
      '#6E4C34',
      '#D8B25C',
      1.2
    );
    drawPolygon3D(
      ctx,
      [
        { x: -2.9, y: 1.32, z: -2.75 },
        { x: -1.5, y: 1.32, z: -2.6 },
        { x: -1.7, y: 1.32, z: -1.05 },
        { x: -3.0, y: 1.32, z: -1.2 },
      ],
      camPos,
      target,
      width,
      height,
      '#181818',
      '#6E6D68',
      1.2
    );

    // Strip lampu tangga lorong tengah
    const uniqueRowZs = Array.from(new Set(projectedSeats.map((s) => `${s.rowIndex}:${s.z3d.toFixed(2)}`)));
    uniqueRowZs.forEach((key) => {
      const [rIdxStr, zStr] = key.split(':');
      const rIdx = Number(rIdxStr);
      const zVal = Number(zStr);
      const yStep = rIdx * 0.24 + 0.04;
      drawLine3D(
        ctx,
        { x: -0.68, y: yStep, z: zVal - 0.72 },
        { x: 0.68, y: yStep, z: zVal - 0.72 },
        camPos,
        target,
        width,
        height,
        'rgba(244, 207, 123, 0.75)',
        2
      );
    });

    // Kursi konser 3D berlapis (cangkang kayu + bantalan beludru) urut dari belakang ke depan
    const renderedSeats: {
      seat: Seat3DPoint;
      proj: ProjectedPoint;
      fill: string;
      trim: string;
      isSelected: boolean;
    }[] = [];

    for (const seat of projectedSeats) {
      const proj = projectPoint(
        { x: seat.x3d, y: seat.y3d + 0.42, z: seat.z3d },
        camPos,
        target,
        width,
        height
      );
      if (!proj) continue;

      const isBooked = seat.status === 'BOOKED';
      const isSelected = selectedSeatSet.has(seat.seatCode);
      const isActiveZone = seat.categoryId === selectedCategoryId;

      let fill = tierColors[seat.categoryId] || '#3E5668';
      let trim = '#5C3720';

      if (isBooked) {
        fill = '#524C47';
        trim = '#36322F';
      } else if (isSelected) {
        fill = '#D4FF2A';
        trim = '#141413';
      } else if (!isActiveZone) {
        fill = '#4F443E';
        trim = '#352A24';
      }

      renderedSeats.push({ seat, proj, fill, trim, isSelected });
    }

    renderedSeats.sort((a, b) => b.proj.depth - a.proj.depth);

    const hits: { seat: Seat3DPoint; sx: number; sy: number; r: number }[] = [];
    for (const item of renderedSeats) {
      const seatW = Math.max(5, Math.min(28, 0.84 * item.proj.scale));
      const seatH = Math.max(5, Math.min(26, 0.74 * item.proj.scale));
      const x0 = item.proj.sx - seatW / 2;
      const y0 = item.proj.sy - seatH / 2;

      // Cangkang kayu sandaran
      ctx.fillStyle = item.trim;
      ctx.fillRect(x0 - 1, y0 - 1, seatW + 2, seatH + 2);

      // Bantalan kursi
      ctx.fillStyle = item.fill;
      ctx.fillRect(x0, y0 + seatH * 0.22, seatW, seatH * 0.76);

      if (item.isSelected) {
        ctx.strokeStyle = '#141413';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(x0 - 1, y0 - 1, seatW + 2, seatH + 2);

        ctx.fillStyle = '#D4FF2A';
        ctx.beginPath();
        ctx.arc(item.proj.sx, y0 - 6, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }

      hits.push({
        seat: item.seat,
        sx: item.proj.sx,
        sy: item.proj.sy,
        r: Math.max(11, seatW * 0.72),
      });
    }

    hitTargetsRef.current = hits;
  }, [basePose, orbitOffset, projectedSeats, selectedCategoryId, selectedSeatSet, tierColors, canvasSizeTick]);

  const dragStateRef = useRef<{ active: boolean; x: number; y: number; moved: number }>({
    active: false,
    x: 0,
    y: 0,
    moved: 0,
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    dragStateRef.current = { active: true, x: e.clientX, y: e.clientY, moved: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!dragStateRef.current.active) return;
    const dx = e.clientX - dragStateRef.current.x;
    const dy = e.clientY - dragStateRef.current.y;
    dragStateRef.current.x = e.clientX;
    dragStateRef.current.y = e.clientY;
    dragStateRef.current.moved += Math.hypot(dx, dy);

    setOrbitOffset((prev) => ({
      ...prev,
      yaw: prev.yaw - dx * 0.007,
      pitch: Math.max(-0.5, Math.min(0.6, prev.pitch + dy * 0.005)),
    }));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const moved = dragStateRef.current.moved;
    dragStateRef.current.active = false;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    if (moved > 6) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    for (let i = hitTargetsRef.current.length - 1; i >= 0; i--) {
      const h = hitTargetsRef.current[i];
      if (Math.hypot(px - h.sx, py - h.sy) <= h.r) {
        const catName = categoryNameMap.get(h.seat.categoryId) || '';
        setActiveSeatInfo(
          `Kursi ${h.seat.seatCode} • ${catName} • ${h.seat.status === 'BOOKED' ? 'Terisi' : 'Tersedia'}`
        );
        if (onSelectSeat) {
          onSelectSeat(h.seat.seatCode);
        }
        break;
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setOrbitOffset((prev) => ({
      ...prev,
      zoom: Math.max(0.45, Math.min(1.6, prev.zoom + (e.deltaY > 0 ? 0.08 : -0.08))),
    }));
  };

  const activeCategoryName =
    categories.find((c) => c.id === selectedCategoryId)?.name || categories[0]?.name || 'Zona';

  const cameraModeSubtitle: Record<CameraMode, string> = {
    overview: 'Tampak Maket 3/4 (Canvas 3D)',
    seat:
      selectedSeats.length > 0
        ? `Sudut Pandang Kursi ${selectedSeats[selectedSeats.length - 1]}`
        : `Sudut Pandang ${activeCategoryName}`,
    stage: 'Tampak Simetris Panggung',
    balcony: 'Panorama Balkon Atas',
  };

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#141413] flex flex-col p-3 sm:p-4 gap-2.5'
          : 'space-y-2.5'
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F4F3EF] border border-[#DFDDD6] px-3 py-2 shrink-0">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Pilih sudut kamera 3D">
          <button
            type="button"
            onClick={() => setCameraMode('overview')}
            aria-pressed={cameraMode === 'overview'}
            className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
              cameraMode === 'overview'
                ? 'bg-[#D4FF2A] border-[#141413] text-[#141413] font-bold'
                : 'bg-white border-[#DFDDD6] text-[#141413] hover:border-[#141413]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Maket Hall</span>
          </button>
          <button
            type="button"
            onClick={() => setCameraMode('seat')}
            aria-pressed={cameraMode === 'seat'}
            className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
              cameraMode === 'seat'
                ? 'bg-[#D4FF2A] border-[#141413] text-[#141413] font-bold'
                : 'bg-white border-[#DFDDD6] text-[#141413] hover:border-[#141413]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {selectedSeats.length > 0
                ? `Kursi ${selectedSeats[selectedSeats.length - 1]}`
                : 'Pandangan Zona'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setCameraMode('stage')}
            aria-pressed={cameraMode === 'stage'}
            className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
              cameraMode === 'stage'
                ? 'bg-[#D4FF2A] border-[#141413] text-[#141413] font-bold'
                : 'bg-white border-[#DFDDD6] text-[#141413] hover:border-[#141413]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Panggung</span>
          </button>
          <button
            type="button"
            onClick={() => setCameraMode('balcony')}
            aria-pressed={cameraMode === 'balcony'}
            className={`min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] ${
              cameraMode === 'balcony'
                ? 'bg-[#D4FF2A] border-[#141413] text-[#141413] font-bold'
                : 'bg-white border-[#DFDDD6] text-[#141413] hover:border-[#141413]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Balkon</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsFullscreen((prev) => !prev)}
          aria-pressed={isFullscreen}
          aria-label={isFullscreen ? 'Keluar dari layar penuh' : 'Buka pratinjau 3D layar penuh'}
          className="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#141413] text-[#F4F3EF] hover:bg-[#2A2A28] border border-[#141413] rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4FF2A]"
        >
          {isFullscreen ? (
            <>
              <Minimize2 className="w-3.5 h-3.5 text-[#D4FF2A]" aria-hidden="true" />
              <span>Tutup</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5 text-[#D4FF2A]" aria-hidden="true" />
              <span>Layar Penuh</span>
            </>
          )}
        </button>
      </div>

      <div
        className={`relative w-full border border-[#DFDDD6] bg-[#161210] overflow-hidden ${
          isFullscreen ? 'flex-1 min-h-0' : ''
        }`}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          className={
            isFullscreen
              ? 'w-full h-full block cursor-grab active:cursor-grabbing touch-none'
              : 'w-full h-[340px] sm:h-[430px] block cursor-grab active:cursor-grabbing touch-none'
          }
          aria-label={`Pratinjau 3D panggung orkestra ${venue}`}
        />

        <div className="pointer-events-none absolute top-3 left-3 bg-[#141413]/85 border border-white/15 px-3 py-1.5 space-y-0.5">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#D4FF2A]">
            3D Concert Hall • {venue}
          </div>
          <div className="text-[11px] text-[#EAE8E1] font-medium">
            {cameraModeSubtitle[cameraMode]}
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
          {activeSeatInfo ? (
            <div className="bg-[#141413]/90 border border-[#D4FF2A]/50 px-3 py-1.5 text-[11px] font-semibold text-[#F4F3EF]">
              {activeSeatInfo}
            </div>
          ) : (
            <div />
          )}
          <div className="hidden sm:block bg-[#141413]/80 border border-white/10 px-2.5 py-1 text-[10px] text-[#EAE8E1]">
            Seret: Putar &middot; Gulir: Zoom &middot; Klik Kursi: Pilih
          </div>
        </div>
      </div>
    </div>
  );
};
