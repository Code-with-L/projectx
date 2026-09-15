import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "../lib/scrollStore";

/**
 * Cherry blossom petal field. Four autiennes petals silhouettes —
 * notched sakura, round, slender, ruffled — V-folded and tumbling in the wind.
 */

const COUNT = 260;
const VARIANTS = 4;

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Deterministic PRNG so each layer decorrelates without Math.random collisions */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type ShapeBuilder = (s: THREE.Shape) => void;

const SHAPES: Array<{ build: ShapeBuilder; fold: number }> = [
  {
    // Notched sakura — the classic cleft tip, gently curved flanks
    fold: 1.1,
    build: (p) => {
      p.moveTo(0, -0.52);
      p.bezierCurveTo(0.3, -0.42, 0.38, -0.06, 0.3, 0.18);
      p.bezierCurveTo(0.26, 0.34, 0.12, 0.44, 0.06, 0.47);
      p.bezierCurveTo(0.03, 0.46, 0, 0.4, 0, 0.37);
      p.bezierCurveTo(0, 0.4, -0.03, 0.46, -0.06, 0.47);
      p.bezierCurveTo(-0.12, 0.44, -0.26, 0.34, -0.3, 0.18);
      p.bezierCurveTo(-0.38, -0.06, -0.3, -0.42, 0, -0.52);
    },
  },
  {
    // Round, plump — broad shoulders, shallow notch, fuller body
    fold: 0.7,
    build: (p) => {
      p.moveTo(0, -0.5);
      p.bezierCurveTo(0.3, -0.4, 0.4, 0, 0.36, 0.2);
      p.bezierCurveTo(0.32, 0.36, 0.2, 0.44, 0.12, 0.42);
      p.bezierCurveTo(0.06, 0.41, 0.015, 0.38, 0, 0.34);
      p.bezierCurveTo(-0.015, 0.38, -0.06, 0.41, -0.12, 0.42);
      p.bezierCurveTo(-0.2, 0.44, -0.32, 0.36, -0.36, 0.2);
      p.bezierCurveTo(-0.4, 0, -0.3, -0.4, 0, -0.5);
    },
  },
  {
    // Slender lanceolate — long thin, sharp apex
    fold: 1.4,
    build: (p) => {
      p.moveTo(0, -0.55);
      p.bezierCurveTo(0.14, -0.45, 0.2, -0.15, 0.18, 0.05);
      p.bezierCurveTo(0.16, 0.22, 0.12, 0.34, 0.07, 0.42);
      p.bezierCurveTo(0.035, 0.485, 0.008, 0.52, 0, 0.5);
      p.bezierCurveTo(-0.008, 0.52, -0.035, 0.485, -0.07, 0.42);
      p.bezierCurveTo(-0.12, 0.34, -0.16, 0.22, -0.18, 0.05);
      p.bezierCurveTo(-0.2, -0.15, -0.14, -0.45, 0, -0.55);
    },
  },
  {
    // Ruffled — wave-crested margins, undulating body
    fold: 1.0,
    build: (p) => {
      p.moveTo(0, -0.5);
      p.bezierCurveTo(0.27, -0.42, 0.35, -0.1, 0.31, 0.12);
      p.bezierCurveTo(0.28, 0.24, 0.22, 0.3, 0.16, 0.34);
      p.bezierCurveTo(0.12, 0.37, 0.07, 0.42, 0.05, 0.45);
      p.bezierCurveTo(0.025, 0.44, 0, 0.38, 0, 0.35);
      p.bezierCurveTo(0, 0.38, -0.025, 0.44, -0.05, 0.45);
      p.bezierCurveTo(-0.07, 0.42, -0.12, 0.37, -0.16, 0.34);
      p.bezierCurveTo(-0.22, 0.3, -0.28, 0.24, -0.31, 0.12);
      p.bezierCurveTo(-0.35, -0.1, -0.27, -0.42, 0, -0.5);
    },
  },
];

function createPetalGeometry(build: ShapeBuilder, foldStrength: number) {
  const shape = new THREE.Shape();
  build(shape);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.012,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.012,
    bevelSegments: 3,
    steps: 1,
  });
  geometry.rotateX(-Math.PI / 2);

  // V-fold: crease along the central spine so petals aren't flat plates
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const fold = x * foldStrength;
    pos.setY(i, y * Math.cos(fold) - z * Math.sin(fold));
    pos.setZ(i, y * Math.sin(fold) + z * Math.cos(fold));
  }

  geometry.computeVertexNormals();
  return geometry;
}

function createPetalTexture() {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const cx = size / 2;
  const cy = size * 0.55;

  // Base: warm blush center fading to near-white at edges
  const baseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.46);
  baseGrad.addColorStop(0, "#fdf0ed");
  baseGrad.addColorStop(0.35, "#f8dfe0");
  baseGrad.addColorStop(0.7, "#f3c8c9");
  baseGrad.addColorStop(1, "rgba(242, 195, 196, 0.88)");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, size, size);

  // Subtle warm glow at the base (near stem)
  const baseGlow = ctx.createRadialGradient(cx, cy + size * 0.25, 0, cx, cy + size * 0.25, size * 0.3);
  baseGlow.addColorStop(0, "rgba(230, 165, 165, 0.35)");
  baseGlow.addColorStop(1, "rgba(230, 165, 165, 0)");
  ctx.fillStyle = baseGlow;
  ctx.fillRect(0, 0, size, size);

  // Central midrib — slightly darker, warm pink
  ctx.strokeStyle = "rgba(215, 145, 150, 0.55)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.35);
  ctx.quadraticCurveTo(cx - 1, cy, cx, cy - size * 0.4);
  ctx.stroke();

  // Lateral veins — delicate branching outward from midrib
  ctx.lineWidth = 1.8;
  ctx.strokeStyle = "rgba(220, 155, 158, 0.35)";
  const veinAngles = [-0.6, -0.35, 0.1, 0.35, 0.6];
  for (const angle of veinAngles) {
    const startY = cy + size * (0.22 + angle * 0.18);
    const endX = cx + Math.sin(angle) * size * 0.28;
    const endY = startY - size * 0.2;
    ctx.beginPath();
    ctx.moveTo(cx, startY);
    ctx.quadraticCurveTo(cx + Math.sin(angle) * size * 0.12, startY - size * 0.08, endX, endY);
    ctx.stroke();
  }

  // Translucency effect — a faint white overlay that simulates backlight
  const translucent = ctx.createLinearGradient(cx, cy - size * 0.4, cx, cy + size * 0.35);
  translucent.addColorStop(0, "rgba(255, 255, 255, 0.22)");
  translucent.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
  translucent.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = translucent;
  ctx.fillRect(0, 0, size, size);

  // Subtle noise texture for petal surface grain
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 6;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type MouseRef = React.MutableRefObject<{ x: number; y: number }>;

interface PetalLayerProps {
  geometry: THREE.BufferGeometry;
  texture: THREE.Texture;
  count: number;
  seed: number;
  mouse: MouseRef;
}

function PetalLayer({ geometry, texture, count, seed, mouse }: PetalLayerProps) {
  const mesh = useRef<THREE.InstancedMesh>(null);

  const data = useMemo(() => {
    const rnd = mulberry32(seed * 2654435761);
    const u = new Float32Array(count);
    const phase = new Float32Array(count);
    const speed = new Float32Array(count);
    const size = new Float32Array(count);
    const layer = new Float32Array(count);
    const offX = new Float32Array(count);
    const offY = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      u[i] = rnd();
      phase[i] = (rnd() + seed) * Math.PI * 2;
      speed[i] = 0.02 + rnd() * 0.04;
      size[i] = 0.07 + rnd() * 0.11;
      layer[i] = rnd();
    }
    return { u, phase, speed, size, layer, offX, offY };
  }, [count, seed]);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const petalColor = useMemo(() => new THREE.Color(), []);

  useLayoutEffect(() => {
    const inst = mesh.current;
    if (!inst) return;
    for (let i = 0; i < count; i++) {
      const lay = data.layer[i];
      // Extreme layers (near/far) go paler — simulates depth-of-field blur
      const pale = 1 - Math.abs(lay - 0.5) * 2; // 0 at extremes, 1 at mid
      const sat = 0.32 + Math.random() * 0.2 - pale * 0.08;
      const lgt = 0.78 + Math.random() * 0.08 + (1 - pale) * 0.12;
      petalColor.setHSL(0.76 + Math.random() * 0.04, Math.max(0.1, sat), Math.min(0.95, lgt));
      inst.setColorAt(i, petalColor);
    }
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  }, [petalColor, data.layer, count]);

  useFrame((_state, delta) => {
    const inst = mesh.current;
    if (!inst) return;
    const { u, phase, speed, size, layer, offX, offY } = data;
    const d = Math.min(delta, 0.05);
    const boost = 1 + Math.min(2, Math.abs(scrollState.velocity) * 8);
    const px = mouse.current.x;
    const py = mouse.current.y;

    // Cursor dropped into world space (approx viewable rect of the field)
    const cursorX = px * 4.5;
    const cursorY = -py * 3;

    // Frame-rate independent easing factor for smooth push return
    const k = 1 - Math.exp(-d * 4);

    for (let i = 0; i < count; i++) {
      if (!REDUCED_MOTION) {
        u[i] = (u[i] + d * speed[i] * boost) % 1;
      }
      const p = u[i];
      const ph = phase[i];
      const lay = layer[i];

      // Corner stream: top-left → bottom-right, gentle sine sway per petal
      const baseX = -9 + p * 18 + Math.sin(p * Math.PI * 3 + ph) * (0.5 + lay);
      const baseY = 4.2 - p * 8.4 + Math.sin(p * Math.PI * 2 + ph * 1.7) * 0.45;
      const z = 1.6 - lay * 3.4 + Math.sin(p * Math.PI * 2.2 + ph) * (0.6 + lay * 0.8);

      // Local repel: only petals near the cursor get pushed aside
      const dx = baseX - cursorX;
      const dy = baseY - cursorY;
      const distSq = dx * dx + dy * dy;
      const radius = 0.35;
      let pushX = 0;
      let pushY = 0;
      if (distSq < radius * radius && distSq > 0.0001) {
        const dist = Math.sqrt(distSq);
        const inv = 1 / dist;
        const falloff = 1 - dist / radius;
        const push = falloff * falloff;
        pushX = dx * inv * push * 0.9 + -dy * inv * push * 0.5;
        pushY = dy * inv * push * 0.9 + dx * inv * push * 0.5;
      }

      // Ease toward target so return is smooth, not a snap
      offX[i] += (pushX - offX[i]) * k;
      offY[i] += (pushY - offY[i]) * k;

      dummy.position.set(baseX + offX[i], baseY + offY[i], z);
      // Flutter: petals stay roughly camera-facing, gently rocking + slow in-plane spin.
      // Keeps the petal silhouette readable instead of end-on sticks.
      dummy.rotation.set(
        Math.sin(p * Math.PI * 6 + ph) * 0.7,
        Math.sin(p * Math.PI * 8 + ph * 2) * 0.8,
        p * Math.PI * 3 + ph,
      );
      // Depth-of-field scale: near petals (lay~0) slightly bigger, far (lay~1) much smaller
      const depthScale = lay < 0.5 ? 1.0 + (0.5 - lay) * 0.6 : 1.0 - (lay - 0.5) * 1.4;
      const s = size[i] * depthScale * (1.15 - lay * 0.4);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, count] as never} frustumCulled={false}>
      <meshPhysicalMaterial
        map={texture}
        color="#ffffff"
        roughness={0.55}
        metalness={0}
        envMapIntensity={0.4}
        transparent
        opacity={0.92}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

export default function PetalField() {
  const geometries = useMemo(
    () => SHAPES.map((s) => createPetalGeometry(s.build, s.fold)),
    [],
  );
  const texture = useMemo(() => createPetalTexture(), []);

  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onLeave = () => {
      mouse.current.x = 0;
      mouse.current.y = 0;
    };
    const onBlur = () => {
      mouse.current.x = 0;
      mouse.current.y = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const perVariant = Math.floor(COUNT / VARIANTS);

  return (
    <>
      {geometries.map((geometry, i) => (
        <PetalLayer
          key={i}
          geometry={geometry}
          texture={texture}
          count={perVariant}
          seed={i}
          mouse={mouse}
        />
      ))}
    </>
  );
}