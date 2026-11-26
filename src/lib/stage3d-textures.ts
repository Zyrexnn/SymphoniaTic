import * as THREE from 'three';

export interface HallTextureSet {
  oakFloorMap: THREE.CanvasTexture;
  oakFloorBump: THREE.CanvasTexture;
  walnutWallMap: THREE.CanvasTexture;
  walnutWallBump: THREE.CanvasTexture;
  flutedColumnMap: THREE.CanvasTexture;
  flutedColumnBump: THREE.CanvasTexture;
  cofferedCeilingMap: THREE.CanvasTexture;
  cofferedCeilingEmissive: THREE.CanvasTexture;
  organPipesMap: THREE.CanvasTexture;
  velvetBump: THREE.CanvasTexture;
  dispose: () => void;
}

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context unavailable');
  }
  return [canvas, ctx];
}

function configureRepeat(
  tex: THREE.CanvasTexture,
  repeatX: number,
  repeatY: number,
  isColor = true
): THREE.CanvasTexture {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 4;
  if (isColor) {
    tex.colorSpace = THREE.SRGBColorSpace;
  }
  tex.needsUpdate = true;
  return tex;
}

function createOakParquetTextures(): [THREE.CanvasTexture, THREE.CanvasTexture] {
  const [c, ctx] = makeCanvas(512, 512);
  const [bc, bctx] = makeCanvas(512, 512);

  ctx.fillStyle = '#C9A474';
  ctx.fillRect(0, 0, 512, 512);
  bctx.fillStyle = '#909090';
  bctx.fillRect(0, 0, 512, 512);

  const plankRows = 16;
  const plankH = 512 / plankRows;

  for (let row = 0; row < plankRows; row++) {
    const y = row * plankH;
    const cols = 4;
    const offset = (row % 2) * 64 + ((row * 37) % 48);

    for (let col = -1; col <= cols; col++) {
      const plankW = 128;
      const x = col * plankW + offset;
      const shade = ((row * 17 + col * 31) % 21) - 10;
      const r = Math.min(255, Math.max(0, 202 + shade));
      const g = Math.min(255, Math.max(0, 165 + Math.round(shade * 0.85)));
      const b = Math.min(255, Math.max(0, 118 + Math.round(shade * 0.7)));

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, plankW - 1, plankH - 1);

      // Serat kayu halus memanjang
      for (let grain = 0; grain < 6; grain++) {
        const gy = y + ((grain + 0.5) * plankH) / 6;
        ctx.strokeStyle = grain % 2 === 0 ? 'rgba(110, 74, 38, 0.14)' : 'rgba(245, 224, 190, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, gy);
        ctx.bezierCurveTo(
          x + plankW * 0.35,
          gy + ((row + grain) % 3) - 1,
          x + plankW * 0.7,
          gy - (((row + grain) % 3) - 1),
          x + plankW,
          gy
        );
        ctx.stroke();
      }

      // Garis sambungan papan untuk bump map
      ctx.strokeStyle = 'rgba(72, 46, 22, 0.38)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, plankW - 1, plankH - 1);

      bctx.fillStyle = `rgb(${136 + shade},${136 + shade},${136 + shade})`;
      bctx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);
      bctx.strokeStyle = '#383838';
      bctx.lineWidth = 1.5;
      bctx.strokeRect(x + 0.5, y + 0.5, plankW - 1, plankH - 1);
    }
  }

  return [
    configureRepeat(new THREE.CanvasTexture(c), 4, 3, true),
    configureRepeat(new THREE.CanvasTexture(bc), 4, 3, false),
  ];
}

function createWalnutPanelTextures(): [THREE.CanvasTexture, THREE.CanvasTexture] {
  const [c, ctx] = makeCanvas(512, 512);
  const [bc, bctx] = makeCanvas(512, 512);

  ctx.fillStyle = '#5B3D27';
  ctx.fillRect(0, 0, 512, 512);
  bctx.fillStyle = '#888888';
  bctx.fillRect(0, 0, 512, 512);

  // Panel kayu akustik horizontal khas Aula Simfonia Jakarta
  const slats = 24;
  const slatH = 512 / slats;
  for (let i = 0; i < slats; i++) {
    const y = i * slatH;
    const variance = ((i * 29) % 19) - 9;
    const r = Math.min(255, Math.max(0, 102 + variance));
    const g = Math.min(255, Math.max(0, 70 + Math.round(variance * 0.7)));
    const b = Math.min(255, Math.max(0, 46 + Math.round(variance * 0.5)));

    const grad = ctx.createLinearGradient(0, y, 0, y + slatH);
    grad.addColorStop(0, `rgb(${r + 10},${g + 8},${b + 6})`);
    grad.addColorStop(0.5, `rgb(${r},${g},${b})`);
    grad.addColorStop(1, `rgb(${Math.max(0, r - 18)},${Math.max(0, g - 14)},${Math.max(0, b - 10)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, 512, slatH - 1.5);

    ctx.fillStyle = '#2A1A10';
    ctx.fillRect(0, y + slatH - 1.8, 512, 1.8);

    // Sambungan vertikal halus
    const seamX = ((i * 173) % 440) + 36;
    ctx.fillStyle = 'rgba(36, 22, 12, 0.35)';
    ctx.fillRect(seamX, y, 1.5, slatH);

    bctx.fillStyle = '#B8B8B8';
    bctx.fillRect(0, y, 512, slatH - 2);
    bctx.fillStyle = '#252525';
    bctx.fillRect(0, y + slatH - 2, 512, 2);
  }

  return [
    configureRepeat(new THREE.CanvasTexture(c), 3, 2, true),
    configureRepeat(new THREE.CanvasTexture(bc), 3, 2, false),
  ];
}

function createFlutedColumnTextures(): [THREE.CanvasTexture, THREE.CanvasTexture] {
  const [c, ctx] = makeCanvas(256, 256);
  const [bc, bctx] = makeCanvas(256, 256);

  const flutes = 16;
  const fluteW = 256 / flutes;

  for (let i = 0; i < flutes; i++) {
    const x = i * fluteW;
    const grad = ctx.createLinearGradient(x, 0, x + fluteW, 0);
    grad.addColorStop(0, '#F5F1E8');
    grad.addColorStop(0.25, '#DDD6C7');
    grad.addColorStop(0.5, '#CFC6B4');
    grad.addColorStop(0.75, '#E2DBCE');
    grad.addColorStop(1, '#F5F1E8');
    ctx.fillStyle = grad;
    ctx.fillRect(x, 0, fluteW, 256);

    const bgrad = bctx.createLinearGradient(x, 0, x + fluteW, 0);
    bgrad.addColorStop(0, '#FFFFFF');
    bgrad.addColorStop(0.5, '#404040');
    bgrad.addColorStop(1, '#FFFFFF');
    bctx.fillStyle = bgrad;
    bctx.fillRect(x, 0, fluteW, 256);
  }

  return [
    configureRepeat(new THREE.CanvasTexture(c), 1, 1, true),
    configureRepeat(new THREE.CanvasTexture(bc), 1, 1, false),
  ];
}

function createCofferedCeilingTextures(): [THREE.CanvasTexture, THREE.CanvasTexture] {
  const [c, ctx] = makeCanvas(512, 512);
  const [ec, ectx] = makeCanvas(512, 512);

  // Langit-langit coffered belah ketupat (diamond coffered) khas Aula Simfonia Jakarta
  ctx.fillStyle = '#3B281E';
  ctx.fillRect(0, 0, 512, 512);
  ectx.fillStyle = '#000000';
  ectx.fillRect(0, 0, 512, 512);

  const step = 128;
  for (let gy = -step; gy <= 512 + step; gy += step) {
    for (let gx = -step; gx <= 512 + step; gx += step) {
      const cx = gx;
      const cy = gy;
      const half = step * 0.42;

      // Bingkai balok kayu krem/coklat
      ctx.beginPath();
      ctx.moveTo(cx, cy - half);
      ctx.lineTo(cx + half, cy);
      ctx.lineTo(cx, cy + half);
      ctx.lineTo(cx - half, cy);
      ctx.closePath();
      ctx.fillStyle = '#5E4230';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#C9B99F';
      ctx.stroke();

      // Panel skylight bercahaya hangat di tengah belah ketupat
      const inner = half * 0.62;
      ctx.beginPath();
      ctx.moveTo(cx, cy - inner);
      ctx.lineTo(cx + inner, cy);
      ctx.lineTo(cx, cy + inner);
      ctx.lineTo(cx - inner, cy);
      ctx.closePath();
      const lightGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, inner);
      lightGrad.addColorStop(0, '#FFF8E7');
      lightGrad.addColorStop(0.7, '#F0DEC0');
      lightGrad.addColorStop(1, '#B89B74');
      ctx.fillStyle = lightGrad;
      ctx.fill();

      ectx.beginPath();
      ectx.moveTo(cx, cy - inner);
      ectx.lineTo(cx + inner, cy);
      ectx.lineTo(cx, cy + inner);
      ectx.lineTo(cx - inner, cy);
      ectx.closePath();
      const emGrad = ectx.createRadialGradient(cx, cy, 2, cx, cy, inner);
      emGrad.addColorStop(0, '#FFECC7');
      emGrad.addColorStop(0.65, '#8A6E45');
      emGrad.addColorStop(1, '#120D08');
      ectx.fillStyle = emGrad;
      ectx.fill();
    }
  }

  return [
    configureRepeat(new THREE.CanvasTexture(c), 4, 5, true),
    configureRepeat(new THREE.CanvasTexture(ec), 4, 5, true),
  ];
}

function createOrganPipesTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(256, 256);
  const grad = ctx.createLinearGradient(0, 0, 256, 0);
  grad.addColorStop(0, '#A5ACB4');
  grad.addColorStop(0.25, '#EEF2F6');
  grad.addColorStop(0.5, '#C5CCD4');
  grad.addColorStop(0.78, '#F6F8FA');
  grad.addColorStop(1, '#8C949E');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Bibir pipa organ (mouth) di bagian bawah
  ctx.fillStyle = '#383C42';
  ctx.fillRect(0, 206, 256, 12);
  ctx.fillStyle = '#707780';
  ctx.fillRect(0, 218, 256, 38);

  return configureRepeat(new THREE.CanvasTexture(c), 1, 1, true);
}

function createVelvetBumpTexture(): THREE.CanvasTexture {
  const [c, ctx] = makeCanvas(128, 128);
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 128, 128);

  for (let y = 0; y < 128; y += 2) {
    for (let x = 0; x < 128; x += 2) {
      const n = ((x * 37 + y * 59) % 40) + 108;
      ctx.fillStyle = `rgb(${n},${n},${n})`;
      ctx.fillRect(x, y, 2, 2);
    }
  }
  return configureRepeat(new THREE.CanvasTexture(c), 2, 2, false);
}

export function createHallTextures(): HallTextureSet {
  const [oakFloorMap, oakFloorBump] = createOakParquetTextures();
  const [walnutWallMap, walnutWallBump] = createWalnutPanelTextures();
  const [flutedColumnMap, flutedColumnBump] = createFlutedColumnTextures();
  const [cofferedCeilingMap, cofferedCeilingEmissive] = createCofferedCeilingTextures();
  const organPipesMap = createOrganPipesTexture();
  const velvetBump = createVelvetBumpTexture();

  return {
    oakFloorMap,
    oakFloorBump,
    walnutWallMap,
    walnutWallBump,
    flutedColumnMap,
    flutedColumnBump,
    cofferedCeilingMap,
    cofferedCeilingEmissive,
    organPipesMap,
    velvetBump,
    dispose: () => {
      oakFloorMap.dispose();
      oakFloorBump.dispose();
      walnutWallMap.dispose();
      walnutWallBump.dispose();
      flutedColumnMap.dispose();
      flutedColumnBump.dispose();
      cofferedCeilingMap.dispose();
      cofferedCeilingEmissive.dispose();
      organPipesMap.dispose();
      velvetBump.dispose();
    },
  };
}

export function createWarmHallEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  envScene.background = new THREE.Color(0x2a1f18);

  const ceilingLight = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 22),
    new THREE.MeshBasicMaterial({ color: 0xffe8c2, side: THREE.DoubleSide })
  );
  ceilingLight.position.set(0, 10, 0);
  ceilingLight.rotation.x = Math.PI / 2;
  envScene.add(ceilingLight);

  const stageBounce = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 10),
    new THREE.MeshBasicMaterial({ color: 0xd9a86c, side: THREE.DoubleSide })
  );
  stageBounce.position.set(0, -4, -6);
  stageBounce.rotation.x = -Math.PI / 2;
  envScene.add(stageBounce);

  [-1, 1].forEach((side) => {
    const wallBounce = new THREE.Mesh(
      new THREE.PlaneGeometry(18, 8),
      new THREE.MeshBasicMaterial({ color: 0x8f6642, side: THREE.DoubleSide })
    );
    wallBounce.position.set(side * 10, 2, 0);
    wallBounce.rotation.y = -side * (Math.PI / 2);
    envScene.add(wallBounce);
  });

  const renderTarget = pmrem.fromScene(envScene, 0.04);
  envScene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      if (obj.material instanceof THREE.Material) obj.material.dispose();
    }
  });
  pmrem.dispose();
  return renderTarget.texture;
}
