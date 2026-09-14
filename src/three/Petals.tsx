import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState } from "../lib/scrollStore";

/**
 * Cherry blossom petal field. Authentic sakura petals — notched apex,
 * V-folded body, blush/vein texture — tumbling in the wind.
 */

const COUNT = 260;

const REDUCED_MOTION =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function createPetalGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(0, -0.52);
  shape.bezierCurveTo(0.26, -0.44, 0.34, -0.05, 0.28, 0.18);
  shape.bezierCurveTo(0.24, 0.36, 0.1, 0.46, 0.055, 0.475);
  shape.bezierCurveTo(0.03, 0.465, 0, 0.4, 0, 0.37);
  shape.bezierCurveTo(0, 0.4, -0.03, 0.465, -0.055, 0.475);
  shape.bezierCurveTo(-0.1, 0.46, -0.24, 0.36, -0.28, 0.18);
  shape.bezierCurveTo(-0.34, -0.05, -0.26, -0.44, 0, -0.52);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.012,
    bevelEnabled: false,
    steps: 1,
  });
  geometry.rotateX(-Math.PI / 2);

  // V-fold: crease along the central spine so petals aren't flat plates
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const fold = x * 1.1;
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

export default function PetalField() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => createPetalGeometry(), []);
  const texture = useMemo(() => createPetalTexture(), []);

  const data = useMemo(() => {
    const u = new Float32Array(COUNT);
    const phase = new Float32Array(COUNT);
    const speed = new Float32Array(COUNT);
    const size = new Float32Array(COUNT);
    const layer = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      u[i] = Math.random();
      phase[i] = Math.random() * Math.PI * 2;
      speed[i] = 0.03 + Math.random() * 0.055;
      size[i] = 0.05 + Math.random() * 0.08;
      layer[i] = Math.random();
    }
    return { u, phase, speed, size, layer };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const petalColor = useMemo(() => new THREE.Color(), []);

  useLayoutEffect(() => {
    const inst = mesh.current;
    if (!inst) return;
    for (let i = 0; i < COUNT; i++) {
      petalColor.setHSL(0.76 + Math.random() * 0.04, 0.32 + Math.random() * 0.2, 0.78 + Math.random() * 0.08);
      inst.setColorAt(i, petalColor);
    }
    if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
  }, [petalColor]);

  useFrame((state, delta) => {
    const inst = mesh.current;
    if (!inst) return;
    const { u, phase, speed, size, layer } = data;
    const d = Math.min(delta, 0.05);
    const boost = 1 + Math.min(3, Math.abs(scrollState.velocity) * 12);
    const t = state.clock.elapsedTime;

    for (let i = 0; i < COUNT; i++) {
      if (!REDUCED_MOTION) {
        u[i] = (u[i] + d * speed[i] * boost) % 1;
      }
      const p = u[i];
      const ph = phase[i];
      const lay = layer[i];

      const x = -9 + p * 18 + Math.sin(p * Math.PI * 3 + ph) * (0.5 + lay);
      const y = 4.6 - p * 9.8 + Math.sin(p * Math.PI * 2 + ph * 1.7) * 0.5;
      const z = 1.6 - lay * 3.4 + Math.sin(p * Math.PI * 2.2 + ph) * (0.6 + lay * 0.8);

      dummy.position.set(x, y, z);
      // Full tumble: petals rotate freely on all axes, not just face-on plates
      dummy.rotation.set(
        p * Math.PI * 2 + ph * 3 + t * 0.0003,
        p * Math.PI * 2 + ph * 2,
        p * Math.PI * 4 + ph,
      );
      const s = size[i] * (1.15 - lay * 0.4);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      inst.setMatrixAt(i, dummy.matrix);
    }
    inst.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, COUNT] as never} frustumCulled={false}>
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