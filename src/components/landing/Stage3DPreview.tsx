import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Compass, Eye, Layers, Maximize2, Minimize2, RefreshCw, RotateCcw } from 'lucide-react';
import type { TicketCategory } from './data';
import {
  getBalconyCameraPose,
  getOverviewCameraPose,
  getSeatViewCameraPose,
  getZoneViewCameraPose,
  projectSeatsTo3D,
  STAGE_FOCUS_TARGET,
  type CameraPose,
  type Seat2DInput,
} from '../../lib/stage3d-coords';
import { createHallTextures, createWarmHallEnvironment, type HallTextureSet } from '../../lib/stage3d-textures';
import { Stage3DSoftwareFallback } from './Stage3DSoftwareFallback';

export type Stage3DSeatInput = Seat2DInput;

export interface Stage3DPreviewProps {
  venue: string;
  seats: Stage3DSeatInput[];
  categories: TicketCategory[];
  tierColors: Record<string, string>;
  selectedCategoryId: string;
  selectedSeats: string[];
  onSelectSeat?: (seatCode: string) => void;
  onFallbackTo2D?: () => void;
}

type CameraMode = 'overview' | 'seat' | 'stage' | 'balcony';

function disposeObject3D(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh || obj instanceof THREE.InstancedMesh || obj instanceof THREE.Line) {
      obj.geometry?.dispose();
      const mat = obj.material;
      if (Array.isArray(mat)) {
        mat.forEach((m) => m.dispose());
      } else if (mat) {
        mat.dispose();
      }
    }
  });
}

function buildGrandPiano(ebonyMat: THREE.Material, ivoryMat: THREE.Material, brassMat: THREE.Material): THREE.Group {
  const piano = new THREE.Group();

  // Badan melengkung khas concert grand piano
  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-0.78, -1.25);
  bodyShape.lineTo(0.78, -1.25);
  bodyShape.lineTo(0.78, 0.25);
  bodyShape.bezierCurveTo(0.78, 0.72, 0.32, 0.78, 0.12, 1.15);
  bodyShape.bezierCurveTo(-0.18, 1.48, -0.78, 1.25, -0.78, 0.7);
  bodyShape.closePath();

  const bodyGeo = new THREE.ExtrudeGeometry(bodyShape, {
    depth: 0.34,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, ebonyMat);
  body.position.y = 1.06;
  body.castShadow = true;
  body.receiveShadow = true;
  piano.add(body);

  // Tutup grand piano terbuka menyamping
  const lidGeo = new THREE.ExtrudeGeometry(bodyShape, { depth: 0.04, bevelEnabled: false });
  lidGeo.rotateX(Math.PI / 2);
  const lid = new THREE.Mesh(lidGeo, ebonyMat);
  lid.position.set(-0.74, 1.09, 0);
  lid.rotation.z = -0.52;
  lid.castShadow = true;
  piano.add(lid);

  const propStick = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.82, 8), brassMat);
  propStick.position.set(0.32, 1.38, -0.1);
  propStick.rotation.z = 0.22;
  piano.add(propStick);

  // Tuts piano gading
  const keys = new THREE.Mesh(new THREE.BoxGeometry(1.36, 0.05, 0.24), ivoryMat);
  keys.position.set(0, 0.85, -1.28);
  piano.add(keys);

  // 3 kaki piano + bangku pianis
  [
    [-0.62, -1.05],
    [0.62, -1.05],
    [-0.28, 0.92],
  ].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.032, 0.72, 10), ebonyMat);
    leg.position.set(lx, 0.36, lz);
    leg.castShadow = true;
    piano.add(leg);
  });

  const bench = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.1, 0.38), ebonyMat);
  bench.position.set(0, 0.52, -1.78);
  piano.add(bench);

  return piano;
}

function buildRealisticAulaSimfonia(hallDepth: number, textures: HallTextureSet): THREE.Group {
  const hall = new THREE.Group();

  const walnutMat = new THREE.MeshStandardMaterial({
    map: textures.walnutWallMap,
    bumpMap: textures.walnutWallBump,
    bumpScale: 0.06,
    roughness: 0.68,
    metalness: 0.05,
  });
  const walnutDarkMat = new THREE.MeshStandardMaterial({
    color: 0x3f291a,
    roughness: 0.76,
    metalness: 0.04,
  });
  const stageOakMat = new THREE.MeshStandardMaterial({
    map: textures.oakFloorMap,
    bumpMap: textures.oakFloorBump,
    bumpScale: 0.035,
    roughness: 0.44,
    metalness: 0.06,
  });
  const riserOakMat = new THREE.MeshStandardMaterial({
    map: textures.oakFloorMap,
    bumpMap: textures.oakFloorBump,
    bumpScale: 0.03,
    color: 0xe6d3b8,
    roughness: 0.52,
    metalness: 0.05,
  });
  const flutedMarbleMat = new THREE.MeshStandardMaterial({
    map: textures.flutedColumnMap,
    bumpMap: textures.flutedColumnBump,
    bumpScale: 0.045,
    roughness: 0.42,
    metalness: 0.04,
  });
  const ivoryTrimMat = new THREE.MeshStandardMaterial({
    color: 0xeee9df,
    roughness: 0.48,
    metalness: 0.04,
  });
  const crimsonNicheMat = new THREE.MeshStandardMaterial({
    color: 0x6b2229,
    bumpMap: textures.velvetBump,
    bumpScale: 0.02,
    roughness: 0.85,
    metalness: 0.02,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd8b25c,
    roughness: 0.24,
    metalness: 0.82,
  });
  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xc27744,
    roughness: 0.28,
    metalness: 0.78,
  });
  const organPipeMat = new THREE.MeshStandardMaterial({
    map: textures.organPipesMap,
    roughness: 0.22,
    metalness: 0.84,
  });
  const ebonyMat = new THREE.MeshStandardMaterial({
    color: 0x161616,
    roughness: 0.18,
    metalness: 0.15,
  });
  const darkAcousticMat = new THREE.MeshStandardMaterial({
    color: 0x202226,
    roughness: 0.82,
    metalness: 0.06,
  });
  const choirSeatMat = new THREE.MeshStandardMaterial({
    color: 0x5c3428,
    roughness: 0.65,
    metalness: 0.05,
  });
  const warmGlowMat = new THREE.MeshStandardMaterial({
    color: 0xfff5dc,
    emissive: 0xffd894,
    emissiveIntensity: 1.5,
    roughness: 0.3,
  });
  const ceilingMat = new THREE.MeshStandardMaterial({
    map: textures.cofferedCeilingMap,
    emissiveMap: textures.cofferedCeilingEmissive,
    emissive: new THREE.Color(0xffdfa8),
    emissiveIntensity: 0.95,
    roughness: 0.72,
    side: THREE.FrontSide,
  });

  const hallHalfW = 13.0;
  const backZ = Math.max(15.5, hallDepth + 3.4);
  const apseCenterZ = -1.2;
  const wallStartZ = apseCenterZ;
  const wallLen = backZ - wallStartZ;
  const wallCenterZ = (backZ + wallStartZ) / 2;

  // Lantai utama hall
  const mainFloor = new THREE.Mesh(
    new THREE.BoxGeometry(hallHalfW * 2 + 0.6, 0.4, wallLen + hallHalfW + 2),
    walnutDarkMat
  );
  mainFloor.position.set(0, -0.22, (backZ + (apseCenterZ - hallHalfW)) / 2);
  mainFloor.receiveShadow = true;
  hall.add(mainFloor);

  // Panggung orkestra kayu ek melengkung ke depan (khas Aula Simfonia Jakarta)
  const stageShape = new THREE.Shape();
  stageShape.moveTo(-10.8, -6.2);
  stageShape.lineTo(10.8, -6.2);
  stageShape.lineTo(10.8, -1.6);
  stageShape.quadraticCurveTo(0, 1.05, -10.8, -1.6);
  stageShape.closePath();

  const stageGeo = new THREE.ExtrudeGeometry(stageShape, {
    depth: 0.72,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 2,
  });
  stageGeo.rotateX(Math.PI / 2);
  const stageMesh = new THREE.Mesh(stageGeo, stageOakMat);
  stageMesh.position.set(0, 0.72, 0);
  stageMesh.receiveShadow = true;
  stageMesh.castShadow = true;
  hall.add(stageMesh);

  // Lis kuningan halus pada bibir panggung + footlight
  const apronCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-10.75, 0.74, -1.6),
    new THREE.Vector3(0, 0.74, 1.02),
    new THREE.Vector3(10.75, 0.74, -1.6)
  );
  const apronRail = new THREE.Mesh(new THREE.TubeGeometry(apronCurve, 40, 0.035, 8, false), goldMat);
  hall.add(apronRail);

  // 4 undakan kayu melengkung bertingkat untuk formasi orkestra (sesuai foto referensi)
  for (let step = 0; step < 4; step++) {
    const outerR = 10.6 - step * 0.72;
    const innerR = outerR - 0.85;
    const riserShape = new THREE.Shape();
    const segments = 24;
    const startAng = Math.PI * 1.12;
    const endAng = Math.PI * 1.88;

    for (let i = 0; i <= segments; i++) {
      const a = startAng + (i / segments) * (endAng - startAng);
      const px = Math.cos(a) * outerR;
      const py = Math.sin(a) * (outerR * 0.56) - 1.25;
      if (i === 0) riserShape.moveTo(px, py);
      else riserShape.lineTo(px, py);
    }
    for (let i = segments; i >= 0; i--) {
      const a = startAng + (i / segments) * (endAng - startAng);
      const px = Math.cos(a) * innerR;
      const py = Math.sin(a) * (innerR * 0.56) - 1.25;
      riserShape.lineTo(px, py);
    }
    riserShape.closePath();

    const stepH = 0.2 * (4 - step);
    const riserGeo = new THREE.ExtrudeGeometry(riserShape, { depth: stepH, bevelEnabled: false });
    riserGeo.rotateX(Math.PI / 2);
    const riserMesh = new THREE.Mesh(riserGeo, riserOakMat);
    riserMesh.position.set(0, 0.72 + stepH, 0.35);
    riserMesh.receiveShadow = true;
    riserMesh.castShadow = true;
    hall.add(riserMesh);
  }

  // Podium konduktor dengan rel pengaman kuningan
  const podium = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.24, 0.95), walnutMat);
  podium.position.set(0, 0.84, -0.55);
  podium.castShadow = true;
  podium.receiveShadow = true;
  hall.add(podium);

  const conductorStand = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.04), ebonyMat);
  conductorStand.position.set(0, 1.56, -0.95);
  conductorStand.rotation.x = -0.45;
  hall.add(conductorStand);

  const conductorPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.72, 8), ebonyMat);
  conductorPole.position.set(0, 1.22, -0.95);
  hall.add(conductorPole);

  // Concert Grand Piano di sisi kiri-tengah panggung
  const grandPiano = buildGrandPiano(ebonyMat, ivoryTrimMat, goldMat);
  grandPiano.position.set(-2.35, 0.72, -1.95);
  grandPiano.rotation.y = 0.42;
  hall.add(grandPiano);

  // 4 Timpani tembaga di undakan belakang (terlihat pada foto referensi 1)
  [-1.25, -0.42, 0.42, 1.25].forEach((tx, idx) => {
    const r = 0.32 + (idx % 2) * 0.05;
    const kettle = new THREE.Mesh(
      new THREE.SphereGeometry(r, 14, 10, 0, Math.PI * 2, Math.PI * 0.32, Math.PI * 0.68),
      copperMat
    );
    kettle.position.set(tx, 1.78, -5.05);
    kettle.castShadow = true;
    hall.add(kettle);

    const head = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.96, r * 0.96, 0.04, 14), ivoryTrimMat);
    head.position.set(tx, 1.94, -5.05);
    hall.add(head);
  });

  // Formasi kursi musisi & stand partitur putih (InstancedMesh agar ringan)
  const standCount = 24;
  const standHeadGeo = new THREE.BoxGeometry(0.42, 0.3, 0.03);
  const sheetGeo = new THREE.PlaneGeometry(0.36, 0.24);
  const standPoleGeo = new THREE.CylinderGeometry(0.018, 0.024, 0.76, 6);
  const orchChairGeo = new THREE.BoxGeometry(0.44, 0.42, 0.42);

  const sheetMat = new THREE.MeshStandardMaterial({ color: 0xf7f5ee, roughness: 0.9 });
  const navyCushionMat = new THREE.MeshStandardMaterial({ color: 0x25324c, roughness: 0.75 });

  const standHeads = new THREE.InstancedMesh(standHeadGeo, ebonyMat, standCount);
  const standSheets = new THREE.InstancedMesh(sheetGeo, sheetMat, standCount);
  const standPoles = new THREE.InstancedMesh(standPoleGeo, ebonyMat, standCount);
  const orchChairs = new THREE.InstancedMesh(orchChairGeo, navyCushionMat, standCount);

  const dummy = new THREE.Object3D();
  for (let i = 0; i < standCount; i++) {
    const ring = i < 10 ? 0 : 1;
    const idxInRing = ring === 0 ? i : i - 10;
    const totalInRing = ring === 0 ? 10 : 14;
    const angle = Math.PI * (0.12 + (idxInRing / (totalInRing - 1)) * 0.76);
    const radius = ring === 0 ? 3.55 : 5.75;
    const sx = Math.cos(angle) * radius;
    const sz = -0.8 - Math.sin(angle) * (radius * 0.54);
    const sy = ring === 0 ? 0.74 : 1.06;

    // Hindari tumpang tindih dengan grand piano
    const isPianoOverlap = sx < -1.1 && sx > -3.5 && sz < -0.9 && sz > -3.2;
    const scale = isPianoOverlap ? 0 : 1;

    dummy.scale.set(scale, scale, scale);
    dummy.position.set(sx, sy + 0.74, sz);
    dummy.rotation.set(-0.42, -angle + Math.PI / 2, 0);
    dummy.updateMatrix();
    standHeads.setMatrixAt(i, dummy.matrix);

    dummy.position.set(sx, sy + 0.75, sz + 0.02);
    dummy.updateMatrix();
    standSheets.setMatrixAt(i, dummy.matrix);

    dummy.position.set(sx, sy + 0.38, sz);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    standPoles.setMatrixAt(i, dummy.matrix);

    const cx = Math.cos(angle) * (radius + 0.65);
    const cz = -0.8 - Math.sin(angle) * ((radius + 0.65) * 0.54);
    dummy.position.set(cx, sy + 0.24, cz);
    dummy.rotation.set(0, -angle + Math.PI / 2, 0);
    dummy.updateMatrix();
    orchChairs.setMatrixAt(i, dummy.matrix);
  }
  standHeads.instanceMatrix.needsUpdate = true;
  standSheets.instanceMatrix.needsUpdate = true;
  standPoles.instanceMatrix.needsUpdate = true;
  orchChairs.instanceMatrix.needsUpdate = true;
  hall.add(standHeads, standSheets, standPoles, orchChairs);

  // Dinding apse melengkung belakang panggung menyatu mulus dengan dinding samping (radius = hallHalfW)
  const apseRadius = hallHalfW;

  const apseWall = new THREE.Mesh(
    new THREE.CylinderGeometry(apseRadius, apseRadius, 10.6, 48, 1, true, Math.PI * 0.5, Math.PI),
    walnutMat
  );
  apseWall.position.set(0, 5.1, apseCenterZ);
  apseWall.material.side = THREE.DoubleSide;
  hall.add(apseWall);

  // Cornice gading melengkung menyambung ke dinding samping
  const apseCornice = new THREE.Mesh(
    new THREE.CylinderGeometry(apseRadius - 0.15, apseRadius - 0.15, 0.36, 48, 1, true, Math.PI * 0.5, Math.PI),
    ivoryTrimMat
  );
  apseCornice.position.set(0, 10.15, apseCenterZ);
  apseCornice.material.side = THREE.DoubleSide;
  hall.add(apseCornice);

  // Balkon paduan suara melengkung menyatu dengan balkon samping
  const choirParapet = new THREE.Mesh(
    new THREE.CylinderGeometry(10.35, 10.35, 1.05, 40, 1, true, Math.PI * 0.5, Math.PI),
    walnutMat
  );
  choirParapet.position.set(0, 3.92, apseCenterZ);
  choirParapet.material.side = THREE.DoubleSide;
  hall.add(choirParapet);

  const choirTrim = new THREE.Mesh(
    new THREE.CylinderGeometry(10.28, 10.28, 0.15, 40, 1, true, Math.PI * 0.5, Math.PI),
    ivoryTrimMat
  );
  choirTrim.position.set(0, 4.5, apseCenterZ);
  choirTrim.material.side = THREE.DoubleSide;
  hall.add(choirTrim);

  // Lantai balkon paduan suara
  const choirFloorGeo = new THREE.RingGeometry(10.32, apseRadius, 40, 1, 0, Math.PI);
  choirFloorGeo.rotateX(-Math.PI / 2);
  const choirFloor = new THREE.Mesh(choirFloorGeo, walnutDarkMat);
  choirFloor.position.set(0, 3.45, apseCenterZ);
  hall.add(choirFloor);

  // Kursi paduan suara di atas balkon belakang panggung (2 baris melengkung)
  const choirChairGeo = new THREE.BoxGeometry(0.55, 0.55, 0.45);
  const choirCount = 48;
  const choirSeats = new THREE.InstancedMesh(choirChairGeo, choirSeatMat, choirCount);
  for (let i = 0; i < choirCount; i++) {
    const row = i < 24 ? 0 : 1;
    const idx = i % 24;
    const ang = Math.PI * (0.58 + (idx / 23) * 0.84);
    const rad = 11.1 + row * 0.72;
    dummy.scale.set(1, 1, 1);
    dummy.position.set(Math.sin(ang) * rad, 3.75 + row * 0.3, apseCenterZ + Math.cos(ang) * rad);
    dummy.rotation.set(0, ang + Math.PI, 0);
    dummy.updateMatrix();
    choirSeats.setMatrixAt(i, dummy.matrix);
  }
  choirSeats.instanceMatrix.needsUpdate = true;
  hall.add(choirSeats);

  // PIPA ORGAN CASAVANT IKONIK (45 pipa bertingkat simetris + 2 menara emas besar)
  const organBackdrop = new THREE.Mesh(
    new THREE.CylinderGeometry(12.45, 12.45, 4.6, 32, 1, true, Math.PI * 0.78, Math.PI * 0.44),
    walnutDarkMat
  );
  organBackdrop.position.set(0, 7.25, apseCenterZ);
  organBackdrop.material.side = THREE.DoubleSide;
  hall.add(organBackdrop);

  const organLedge = new THREE.Mesh(
    new THREE.CylinderGeometry(11.95, 12.25, 0.55, 32, 1, true, Math.PI * 0.76, Math.PI * 0.48),
    ivoryTrimMat
  );
  organLedge.position.set(0, 4.95, apseCenterZ);
  organLedge.material.side = THREE.DoubleSide;
  hall.add(organLedge);

  const pipeCount = 45;
  const pipeGeo = new THREE.CylinderGeometry(0.08, 0.072, 1, 10);
  const pipes = new THREE.InstancedMesh(pipeGeo, organPipeMat, pipeCount);
  for (let i = 0; i < pipeCount; i++) {
    const t = i / (pipeCount - 1);
    const ang = Math.PI * (0.8 + t * 0.4);
    const distFromCenter = Math.abs(t - 0.5) * 2;
    const wave = Math.abs(Math.sin(distFromCenter * Math.PI * 1.35));
    const h = 2.05 + distFromCenter * 1.5 + wave * 1.1;
    const rad = 12.1;
    dummy.position.set(Math.sin(ang) * rad, 5.2 + h / 2, apseCenterZ + Math.cos(ang) * rad);
    dummy.rotation.set(0, 0, 0);
    dummy.scale.set(1, h, 1);
    dummy.updateMatrix();
    pipes.setMatrixAt(i, dummy.matrix);
  }
  pipes.instanceMatrix.needsUpdate = true;
  hall.add(pipes);

  // Dua menara pipa organ emas raksasa di kiri & kanan
  [-5.25, 5.25].forEach((tx) => {
    const towerGroup = new THREE.Group();
    const tz = apseCenterZ - 10.6;

    const corbel = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.48, 1.5, 14), walnutMat);
    corbel.position.set(tx, 4.85, tz);
    towerGroup.add(corbel);

    const midFrame = new THREE.Mesh(new THREE.CylinderGeometry(0.96, 0.96, 0.25, 14), goldMat);
    midFrame.position.set(tx, 5.65, tz);
    towerGroup.add(midFrame);

    for (let p = 0; p < 7; p++) {
      const a = -0.9 + (p / 6) * 1.8;
      const gp = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.1, 3.65, 10), goldMat);
      gp.position.set(tx + Math.sin(a) * 0.68, 7.55, tz + Math.cos(a) * 0.68);
      towerGroup.add(gp);
    }

    const crown = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 0.94, 0.72, 14), walnutMat);
    crown.position.set(tx, 9.6, tz);
    towerGroup.add(crown);

    const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.32, 0.55, 10), goldMat);
    finial.position.set(tx, 10.2, tz);
    towerGroup.add(finial);

    hall.add(towerGroup);
  });

  // Panel layar akustik hitam gantung di tengah organ
  const acousticScreen = new THREE.Mesh(new THREE.BoxGeometry(3.8, 2.3, 0.14), darkAcousticMat);
  acousticScreen.position.set(0, 6.95, apseCenterZ - 11.0);
  hall.add(acousticScreen);

  // Medali potret komponis oval di bawah organ
  [-3.3, -1.95, 1.95, 3.3].forEach((mx) => {
    const frame = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.08, 16), goldMat);
    frame.rotation.x = Math.PI / 2;
    frame.scale.set(0.82, 1, 1.12);
    frame.position.set(mx, 4.95, apseCenterZ - 11.45);
    hall.add(frame);

    const portrait = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 16), ebonyMat);
    portrait.rotation.x = Math.PI / 2;
    portrait.scale.set(0.82, 1, 1.12);
    portrait.position.set(mx, 4.95, apseCenterZ - 11.42);
    hall.add(portrait);
  });

  // DINDING SAMPING, BALKON SAMPING, PILAR KORINTUS PUTIH & CERUK PATUNG EMAS
  [-1, 1].forEach((side) => {
    const wx = side * hallHalfW;

    const lowerWall = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.3, wallLen), walnutMat);
    lowerWall.position.set(wx, 2.0, wallCenterZ);
    lowerWall.receiveShadow = true;
    hall.add(lowerWall);

    const upperWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6.2, wallLen), walnutMat);
    upperWall.position.set(wx, 7.2, wallCenterZ);
    hall.add(upperWall);

    // Cornice gading sepanjang bagian atas dinding
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.36, wallLen), ivoryTrimMat);
    cornice.position.set(wx - side * 0.3, 10.15, wallCenterZ);
    hall.add(cornice);

    // Balkon samping menyambung langsung dari balkon paduan suara (z = wallStartZ)
    const balcLen = wallLen;
    const balcZ = wallCenterZ;

    const balconyFloor = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.36, balcLen), walnutMat);
    balconyFloor.position.set(wx - side * 1.4, 3.45, balcZ);
    balconyFloor.castShadow = true;
    hall.add(balconyFloor);

    const balconyFront = new THREE.Mesh(new THREE.BoxGeometry(0.26, 1.05, balcLen), walnutMat);
    balconyFront.position.set(wx - side * 2.68, 3.92, balcZ);
    hall.add(balconyFront);

    const balconyRail = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.15, balcLen), ivoryTrimMat);
    balconyRail.position.set(wx - side * 2.68, 4.5, balcZ);
    hall.add(balconyRail);

    // Kursi balkon samping (baris pendek)
    const sideBalcSeats = new THREE.InstancedMesh(choirChairGeo, choirSeatMat, 14);
    for (let s = 0; s < 14; s++) {
      const sz = wallStartZ + 1.0 + s * ((balcLen - 2.2) / 13);
      dummy.scale.set(0.95, 0.95, 0.95);
      dummy.position.set(wx - side * 1.55, 3.92, sz);
      dummy.rotation.set(0, side > 0 ? -Math.PI / 2 : Math.PI / 2, 0);
      dummy.updateMatrix();
      sideBalcSeats.setMatrixAt(s, dummy.matrix);
    }
    sideBalcSeats.instanceMatrix.needsUpdate = true;
    hall.add(sideBalcSeats);

    // Deretan Pilar Putih Klasik & Ceruk Merah Marun + Patung Emas (foto 2 & 3)
    const bayCount = 5;
    const baySpan = (wallLen - 1.4) / (bayCount - 1);
    for (let b = 0; b < bayCount; b++) {
      const bz = wallStartZ + 0.7 + b * baySpan;

      const colBase = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.42, 0.86), ivoryTrimMat);
      colBase.position.set(wx - side * 0.45, 4.7, bz);
      hall.add(colBase);

      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 4.9, 14), flutedMarbleMat);
      column.position.set(wx - side * 0.45, 7.35, bz);
      hall.add(column);

      const capital = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.36, 0.92), ivoryTrimMat);
      capital.position.set(wx - side * 0.45, 9.9, bz);
      hall.add(capital);

      if (b < bayCount - 1) {
        const nicheZ = bz + baySpan / 2;

        // Bingkai putih + ceruk merah marun
        const nicheFrame = new THREE.Mesh(new THREE.BoxGeometry(0.24, 3.4, 1.75), ivoryTrimMat);
        nicheFrame.position.set(wx - side * 0.22, 7.25, nicheZ);
        hall.add(nicheFrame);

        const nicheInner = new THREE.Mesh(new THREE.BoxGeometry(0.26, 3.0, 1.4), crimsonNicheMat);
        nicheInner.position.set(wx - side * 0.24, 7.28, nicheZ);
        hall.add(nicheInner);

        // Alas patung + patung emas klasik
        const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.9, 0.96), ivoryTrimMat);
        plinth.position.set(wx - side * 0.42, 5.95, nicheZ);
        hall.add(plinth);

        const statueBody = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.24, 1.25, 10), goldMat);
        statueBody.position.set(wx - side * 0.44, 7.05, nicheZ);
        hall.add(statueBody);

        const statueHead = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 10), goldMat);
        statueHead.position.set(wx - side * 0.44, 7.82, nicheZ);
        hall.add(statueHead);
      }
    }
  });

  // DINDING BELAKANG & BALKON BELAKANG (FrontSide menghadap ke dalam agar tidak menghalangi kamera orbit)
  const backWallMat = walnutMat.clone();
  backWallMat.side = THREE.FrontSide;
  const backWallPlane = new THREE.Mesh(new THREE.PlaneGeometry(hallHalfW * 2, 10.6), backWallMat);
  backWallPlane.position.set(0, 5.1, backZ);
  backWallPlane.rotation.y = Math.PI;
  hall.add(backWallPlane);

  const rearBalcony = new THREE.Mesh(new THREE.BoxGeometry(hallHalfW * 2 - 0.6, 1.0, 2.6), walnutMat);
  rearBalcony.position.set(0, 4.15, backZ - 1.35);
  hall.add(rearBalcony);

  const rearBalconyTrim = new THREE.Mesh(new THREE.BoxGeometry(hallHalfW * 2 - 0.6, 0.16, 0.28), ivoryTrimMat);
  rearBalconyTrim.position.set(0, 4.72, backZ - 2.65);
  hall.add(rearBalconyTrim);

  // LANGIT-LANGIT COFFERED BELAH KETUPAT (hanya terlihat dari dalam hall; tembus pandang dari atas!)
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(hallHalfW * 2, wallLen + hallHalfW + 1),
    ceilingMat
  );
  ceiling.position.set(0, 10.35, (backZ + (apseCenterZ - hallHalfW)) / 2);
  ceiling.rotation.x = Math.PI / 2;
  hall.add(ceiling);

  // Lingkaran lampu downlight hangat mengelilingi langit-langit panggung (foto 1)
  for (let i = 0; i < 9; i++) {
    const a = Math.PI * (0.66 + (i / 8) * 0.68);
    const lx = Math.sin(a) * 10.6;
    const lz = apseCenterZ + Math.cos(a) * 10.6;
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.1, 14), warmGlowMat);
    lamp.position.set(lx, 10.22, lz);
    hall.add(lamp);
  }

  return hall;
}

function createRobustWebGLRenderer(): THREE.WebGLRenderer | null {
  const attempts: THREE.WebGLRendererParameters[] = [
    { antialias: true, powerPreference: 'high-performance', alpha: false },
    { antialias: true, powerPreference: 'default' },
    { antialias: false, failIfMajorPerformanceCaveat: false, powerPreference: 'low-power' },
  ];

  for (const opts of attempts) {
    try {
      return new THREE.WebGLRenderer(opts);
    } catch {
      // Coba konfigurasi WebGL berikutnya sebelum fallback ke Canvas 2D
    }
  }
  return null;
}

export const Stage3DPreview: React.FC<Stage3DPreviewProps> = ({
  venue,
  seats,
  categories,
  tierColors,
  selectedCategoryId,
  selectedSeats,
  onSelectSeat,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cameraMode, setCameraMode] = useState<CameraMode>('overview');
  const [useSoftwareFallback, setUseSoftwareFallback] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [activeSeatInfo, setActiveSeatInfo] = useState<string | null>(null);

  useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  const projectedSeats = useMemo(() => projectSeatsTo3D(seats), [seats]);
  const selectedSeatSet = useMemo(() => new Set(selectedSeats), [selectedSeats]);

  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  const desiredPose = useMemo<CameraPose>(() => {
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

  const targetPoseRef = useRef<CameraPose>(desiredPose);
  const isLerpingRef = useRef<boolean>(false);
  const onSelectSeatRef = useRef(onSelectSeat);
  onSelectSeatRef.current = onSelectSeat;

  useEffect(() => {
    targetPoseRef.current = desiredPose;
    isLerpingRef.current = true;
  }, [desiredPose]);

  const seatMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const backPadMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const beaconGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (useSoftwareFallback) return;
    const container = containerRef.current;
    if (!container) return;

    setIsSceneReady(false);
    let disposed = false;
    let initRafId = 0;
    let cleanupScene: (() => void) | null = null;

    initRafId = window.requestAnimationFrame(() => {
      if (disposed) return;

      const renderer = createRobustWebGLRenderer();
      if (!renderer) {
        setUseSoftwareFallback(true);
        return;
      }

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(container.clientWidth || 520, container.clientHeight || 380);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.12;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      container.innerHTML = '';
      container.appendChild(renderer.domElement);
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x161210);
      scene.fog = new THREE.Fog(0x161210, 34, 62);

      const textures = createHallTextures();
      const envTexture = createWarmHallEnvironment(renderer);
      scene.environment = envTexture;

      const aspect = (container.clientWidth || 520) / Math.max(1, container.clientHeight || 380);
      const camera = new THREE.PerspectiveCamera(48, aspect, 0.1, 110);
      const initialPose = targetPoseRef.current;
      camera.position.set(...initialPose.position);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.075;
      controls.maxPolarAngle = Math.PI / 2.02;
      controls.minDistance = 2.2;
      controls.maxDistance = 38;
      controls.target.set(...initialPose.target);
      controls.update();

      const stopLerpOnDrag = () => {
        isLerpingRef.current = false;
      };
      controls.addEventListener('start', stopLerpOnDrag);

      // Tata cahaya hangat gedung konser (key + fill + organ uplight + stage spotlight)
      const hemiLight = new THREE.HemisphereLight(0xfff1d6, 0x3b2618, 0.85);
      scene.add(hemiLight);

      const stageKey = new THREE.DirectionalLight(0xffedd0, 1.55);
      stageKey.position.set(5, 16, 6);
      stageKey.castShadow = true;
      stageKey.shadow.mapSize.width = 1024;
      stageKey.shadow.mapSize.height = 1024;
      stageKey.shadow.camera.near = 2;
      stageKey.shadow.camera.far = 42;
      stageKey.shadow.camera.left = -14;
      stageKey.shadow.camera.right = 14;
      stageKey.shadow.camera.top = 14;
      stageKey.shadow.camera.bottom = -14;
      stageKey.shadow.bias = -0.0005;
      scene.add(stageKey);

      const stageSpot = new THREE.PointLight(0xffdca0, 26, 26, 1.4);
      stageSpot.position.set(0, 7.2, -2.5);
      scene.add(stageSpot);

      const organWash = new THREE.PointLight(0xffe6ba, 20, 22, 1.45);
      organWash.position.set(0, 7.6, -7.2);
      scene.add(organWash);

      const hallFill = new THREE.PointLight(0xffdfb8, 12, 32, 1.6);
      hallFill.position.set(0, 8.2, 10.5);
      scene.add(hallFill);

      const maxSeatZ = projectedSeats.reduce((m, s) => Math.max(m, s.z3d), 10);
      const hallArch = buildRealisticAulaSimfonia(maxSeatZ, textures);
      scene.add(hallArch);

      // Undakan lantai penonton & lampu tangga lorong tengah hangat
      const rowSet = new Map<number, number>();
      projectedSeats.forEach((s) => {
        const prev = rowSet.get(s.rowIndex);
        if (prev === undefined || s.z3d > prev) {
          rowSet.set(s.rowIndex, s.z3d);
        }
      });

      const tierFloorMat = new THREE.MeshStandardMaterial({
        color: 0x3c271a,
        roughness: 0.86,
      });
      const stepGlowMat = new THREE.MeshBasicMaterial({ color: 0xf4cf7b });

      rowSet.forEach((zPos, rIdx) => {
        const riserH = Math.max(0.18, rIdx * 0.24 + 0.18);
        const stepFloor = new THREE.Mesh(new THREE.BoxGeometry(20.6, riserH, 1.56), tierFloorMat);
        stepFloor.position.set(0, riserH / 2 - 0.18, zPos);
        stepFloor.receiveShadow = true;
        scene.add(stepFloor);

        // Strip lampu langkah lorong tengah (khas foto 2)
        const aisleStrip = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.03, 0.06), stepGlowMat);
        aisleStrip.position.set(0, riserH - 0.17, zPos - 0.76);
        scene.add(aisleStrip);
      });

      // Kursi konser realistis berlapis (cangkang kayu walnut + bantalan & sandaran beludru + sandaran tangan)
      const count = Math.max(1, projectedSeats.length);
      const cushionGeo = new THREE.BoxGeometry(0.84, 0.24, 0.68);
      const backPadGeo = new THREE.BoxGeometry(0.8, 0.56, 0.1);
      const woodShellGeo = new THREE.BoxGeometry(0.9, 0.64, 0.08);
      const armGeo = new THREE.BoxGeometry(0.1, 0.22, 0.56);

      const velvetMat = new THREE.MeshStandardMaterial({
        bumpMap: textures.velvetBump,
        bumpScale: 0.025,
        roughness: 0.78,
        metalness: 0.04,
      });
      const chairWoodMat = new THREE.MeshStandardMaterial({
        color: 0x5c3720,
        roughness: 0.55,
        metalness: 0.08,
      });

      const seatMesh = new THREE.InstancedMesh(cushionGeo, velvetMat, count);
      const backPadMesh = new THREE.InstancedMesh(backPadGeo, velvetMat, count);
      const woodShellMesh = new THREE.InstancedMesh(woodShellGeo, chairWoodMat, count);
      const armMesh = new THREE.InstancedMesh(armGeo, chairWoodMat, count * 2);

      seatMesh.receiveShadow = true;
      backPadMesh.castShadow = true;
      woodShellMesh.castShadow = true;

      const dummy = new THREE.Object3D();
      projectedSeats.forEach((seat, idx) => {
        dummy.scale.set(1, 1, 1);

        // Dudukan beludru
        dummy.position.set(seat.x3d, seat.y3d + 0.28, seat.z3d);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        seatMesh.setMatrixAt(idx, dummy.matrix);

        // Bantalan sandaran beludru sedikit miring
        dummy.position.set(seat.x3d, seat.y3d + 0.58, seat.z3d + 0.27);
        dummy.rotation.set(0.12, 0, 0);
        dummy.updateMatrix();
        backPadMesh.setMatrixAt(idx, dummy.matrix);

        // Cangkang kayu melengkung di belakang sandaran
        dummy.position.set(seat.x3d, seat.y3d + 0.6, seat.z3d + 0.34);
        dummy.rotation.set(0.12, 0, 0);
        dummy.updateMatrix();
        woodShellMesh.setMatrixAt(idx, dummy.matrix);

        // Sandaran tangan kiri & kanan
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(seat.x3d - 0.44, seat.y3d + 0.42, seat.z3d + 0.04);
        dummy.updateMatrix();
        armMesh.setMatrixAt(idx * 2, dummy.matrix);

        dummy.position.set(seat.x3d + 0.44, seat.y3d + 0.42, seat.z3d + 0.04);
        dummy.updateMatrix();
        armMesh.setMatrixAt(idx * 2 + 1, dummy.matrix);
      });

      if (projectedSeats.length === 0) {
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        seatMesh.setMatrixAt(0, dummy.matrix);
        backPadMesh.setMatrixAt(0, dummy.matrix);
        woodShellMesh.setMatrixAt(0, dummy.matrix);
        armMesh.setMatrixAt(0, dummy.matrix);
        armMesh.setMatrixAt(1, dummy.matrix);
      }

      seatMesh.instanceMatrix.needsUpdate = true;
      backPadMesh.instanceMatrix.needsUpdate = true;
      woodShellMesh.instanceMatrix.needsUpdate = true;
      armMesh.instanceMatrix.needsUpdate = true;
      scene.add(seatMesh, backPadMesh, woodShellMesh, armMesh);

      seatMeshRef.current = seatMesh;
      backPadMeshRef.current = backPadMesh;

      const beaconGroup = new THREE.Group();
      scene.add(beaconGroup);
      beaconGroupRef.current = beaconGroup;

      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      let pointerDownPos = { x: 0, y: 0 };

      const handlePointerDown = (e: PointerEvent) => {
        pointerDownPos = { x: e.clientX, y: e.clientY };
      };

      const handlePointerUp = (e: PointerEvent) => {
        const moved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
        if (moved > 6 || projectedSeats.length === 0) return;

        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        const hits = raycaster.intersectObjects([seatMesh, backPadMesh, woodShellMesh], false);
        if (hits.length > 0 && typeof hits[0].instanceId === 'number') {
          const seat = projectedSeats[hits[0].instanceId];
          if (seat) {
            const catName = categoryNameMap.get(seat.categoryId) || '';
            setActiveSeatInfo(
              `Kursi ${seat.seatCode} • ${catName} • ${seat.status === 'BOOKED' ? 'Terisi' : 'Tersedia'}`
            );
            if (onSelectSeatRef.current) {
              onSelectSeatRef.current(seat.seatCode);
            }
          }
        }
      };

      const handleContextLost = (e: Event) => {
        e.preventDefault();
        setUseSoftwareFallback(true);
      };

      renderer.domElement.addEventListener('pointerdown', handlePointerDown);
      renderer.domElement.addEventListener('pointerup', handlePointerUp);
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost);

      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const w = Math.max(1, entry.contentRect.width);
        const h = Math.max(1, entry.contentRect.height);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      });
      resizeObserver.observe(container);

      const desiredPosVec = new THREE.Vector3();
      const desiredTargetVec = new THREE.Vector3();
      let rafId = 0;
      let firstFrameDone = false;

      const animate = () => {
        rafId = window.requestAnimationFrame(animate);
        if (isLerpingRef.current) {
          desiredPosVec.set(...targetPoseRef.current.position);
          desiredTargetVec.set(...targetPoseRef.current.target);
          camera.position.lerp(desiredPosVec, 0.085);
          controls.target.lerp(desiredTargetVec, 0.085);
          if (
            camera.position.distanceTo(desiredPosVec) < 0.04 &&
            controls.target.distanceTo(desiredTargetVec) < 0.04
          ) {
            camera.position.copy(desiredPosVec);
            controls.target.copy(desiredTargetVec);
            isLerpingRef.current = false;
          }
        }
        controls.update();
        renderer.render(scene, camera);
        if (!firstFrameDone) {
          firstFrameDone = true;
          setIsSceneReady(true);
        }
      };
      animate();

      cleanupScene = () => {
        window.cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        controls.removeEventListener('start', stopLerpOnDrag);
        controls.dispose();
        renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
        renderer.domElement.removeEventListener('pointerup', handlePointerUp);
        renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
        disposeObject3D(scene);
        textures.dispose();
        envTexture.dispose();
        renderer.dispose();
        seatMeshRef.current = null;
        backPadMeshRef.current = null;
        beaconGroupRef.current = null;
      };
    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(initRafId);
      if (cleanupScene) cleanupScene();
    };
  }, [projectedSeats, categoryNameMap, useSoftwareFallback]);

  // Sinkronkan warna zona dan penanda kursi terpilih secara real-time
  useEffect(() => {
    const seatMesh = seatMeshRef.current;
    const backPadMesh = backPadMeshRef.current;
    const beaconGroup = beaconGroupRef.current;
    if (!seatMesh || !backPadMesh || projectedSeats.length === 0) return;

    const color = new THREE.Color();
    const mutedMix = new THREE.Color(0x4a3931);

    projectedSeats.forEach((seat, idx) => {
      const isBooked = seat.status === 'BOOKED';
      const isSelectedSeat = selectedSeatSet.has(seat.seatCode);
      const isActiveZone = seat.categoryId === selectedCategoryId;

      if (isBooked) {
        color.set(0x524c47);
      } else if (isSelectedSeat) {
        color.set(0xd4ff2a);
      } else {
        const hex = tierColors[seat.categoryId] || '#3E5668';
        color.set(hex);
        if (!isActiveZone) {
          color.lerp(mutedMix, 0.56);
        }
      }

      seatMesh.setColorAt(idx, color);
      backPadMesh.setColorAt(idx, color);
    });

    if (seatMesh.instanceColor) seatMesh.instanceColor.needsUpdate = true;
    if (backPadMesh.instanceColor) backPadMesh.instanceColor.needsUpdate = true;

    if (beaconGroup) {
      while (beaconGroup.children.length > 0) {
        const child = beaconGroup.children.pop();
        if (child) disposeObject3D(child);
      }
      const pinMat = new THREE.MeshBasicMaterial({ color: 0xd4ff2a });
      const ringGeo = new THREE.RingGeometry(0.46, 0.56, 20);
      ringGeo.rotateX(-Math.PI / 2);

      projectedSeats.forEach((seat) => {
        if (!selectedSeatSet.has(seat.seatCode)) return;
        const pin = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), pinMat.clone());
        pin.position.set(seat.x3d, seat.y3d + 1.45, seat.z3d);
        beaconGroup.add(pin);

        const ring = new THREE.Mesh(ringGeo.clone(), pinMat.clone());
        ring.position.set(seat.x3d, seat.y3d + 0.04, seat.z3d);
        beaconGroup.add(ring);
      });
      ringGeo.dispose();
      pinMat.dispose();
    }
  }, [projectedSeats, selectedCategoryId, selectedSeatSet, tierColors, isSceneReady]);

  if (useSoftwareFallback) {
    return (
      <Stage3DSoftwareFallback
        venue={venue}
        projectedSeats={projectedSeats}
        categories={categories}
        tierColors={tierColors}
        selectedCategoryId={selectedCategoryId}
        selectedSeats={selectedSeats}
        onSelectSeat={onSelectSeat}
      />
    );
  }

  const activeCategoryName =
    categories.find((c) => c.id === selectedCategoryId)?.name || categories[0]?.name || 'Zona';

  const cameraModeSubtitle: Record<CameraMode, string> = {
    overview: 'Tampak Maket 3/4',
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
            onClick={() => {
              setCameraMode('stage');
              isLerpingRef.current = true;
            }}
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
            onClick={() => {
              setCameraMode('balcony');
              isLerpingRef.current = true;
            }}
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
        <div
          ref={containerRef}
          className={isFullscreen ? 'w-full h-full touch-none' : 'w-full h-[340px] sm:h-[430px] touch-none'}
          role="application"
          aria-label={`Pratinjau 3D panggung orkestra ${venue}`}
        />

        {!isSceneReady && (
          <div className="absolute inset-0 bg-[#161210] flex flex-col items-center justify-center gap-2.5 text-[#F4F3EF] z-10">
            <RefreshCw className="w-5 h-5 animate-spin text-[#D4FF2A]" aria-hidden="true" />
            <span className="text-xs font-semibold tracking-wide">
              Mempersiapkan tekstur &amp; panggung 3D...
            </span>
          </div>
        )}

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

export default Stage3DPreview;
