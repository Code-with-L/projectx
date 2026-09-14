import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollState, SCENE_COUNT } from "../lib/scrollStore";

type Keyframe = {
  pos: [number, number, number];
  look: [number, number, number];
  fov: number;
  key: number; // key light intensity
  fill: number;
  rim: number;
  ambient: number;
  color: string; // key light color temperature
};

// One choreographed keyframe per cinematic scene.
const KEYFRAMES: Keyframe[] = [
  // 0 — Intro: wide, slightly low, empty cinematic space
  { pos: [0, -0.1, 6.6], look: [0, 0.1, 0], fov: 34, key: 1.1, fill: 0.25, rim: 0.9, ambient: 0.12, color: "#fff3e2" },
  // 1 — Identity: camera moves closer, brighter
  { pos: [2.1, 0.55, 4.1], look: [0, 0.15, 0], fov: 32, key: 1.6, fill: 0.4, rim: 1.1, ambient: 0.16, color: "#fff6ea" },
  // 2 — Work: orbit to the side, wider to make room for editorial content
  { pos: [-3.4, 0.9, 3.0], look: [-0.3, 0.1, 0], fov: 40, key: 1.35, fill: 0.5, rim: 1.3, ambient: 0.18, color: "#fdf0e2" },
  // 3 — Skills: rises slightly, crisp rim light
  { pos: [0.2, 1.9, 3.1], look: [0, 0.3, 0], fov: 30, key: 1.5, fill: 0.3, rim: 1.6, ambient: 0.14, color: "#eef2f8" },
  // 4 — About: intimate side profile, quieter
  { pos: [1.3, 0.15, 2.15], look: [0, 0.05, 0], fov: 24, key: 0.8, fill: 0.2, rim: 0.7, ambient: 0.1, color: "#ffe9d2" },
  // 5 — Contact: pulls back slowly, soft fade
  { pos: [0, 0.35, 7.8], look: [0, 0, 0], fov: 36, key: 0.9, fill: 0.22, rim: 0.6, ambient: 0.1, color: "#fff3e2" },
];

function lerpKeyframe(a: Keyframe, b: Keyframe, t: number): Keyframe {
  const lerp = (x: number, y: number) => x + (y - x) * t;
  const lerp3 = (x: [number, number, number], y: [number, number, number]) =>
    [lerp(x[0], y[0]), lerp(x[1], y[1]), lerp(x[2], y[2])] as [number, number, number];
  return {
    pos: lerp3(a.pos, b.pos),
    look: lerp3(a.look, b.look),
    fov: lerp(a.fov, b.fov),
    key: lerp(a.key, b.key),
    fill: lerp(a.fill, b.fill),
    rim: lerp(a.rim, b.rim),
    ambient: lerp(a.ambient, b.ambient),
    color: b.color,
  };
}

function getComposedKeyframe(progress: number): Keyframe {
  const b = scrollState.boundaries;
  let idx = 0;
  for (let i = 0; i < b.length - 1; i++) {
    if (progress >= b[i]) idx = i;
  }
  idx = Math.min(SCENE_COUNT - 2, idx);
  const span = Math.max(0.0001, b[idx + 1] - b[idx]);
  const t = Math.min(1, Math.max(0, (progress - b[idx]) / span));
  return lerpKeyframe(KEYFRAMES[idx], KEYFRAMES[idx + 1], t);
}

export type LightRefs = {
  key: React.RefObject<THREE.DirectionalLight | null>;
  fill: React.RefObject<THREE.DirectionalLight | null>;
  rim: React.RefObject<THREE.DirectionalLight | null>;
  ambient: React.RefObject<THREE.AmbientLight | null>;
};

export function useSceneRig(): LightRefs {
  const key = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.DirectionalLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  return { key, fill, rim, ambient };
}

export default function Rig({ lights }: { lights: LightRefs }) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 0, 0));
  const currentLook = useRef(new THREE.Vector3(0, 0, 0));
  const tmpColor = useRef(new THREE.Color());

  useFrame((_, delta) => {
    const frame = getComposedKeyframe(scrollState.progress);
    const d = Math.min(1, delta * 3.2);

    camera.position.lerp(new THREE.Vector3(...frame.pos), d);
    lookTarget.current.set(...frame.look);
    currentLook.current.lerp(lookTarget.current, d);
    camera.lookAt(currentLook.current);

    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = THREE.MathUtils.damp(camera.fov, frame.fov, 4, delta);
      camera.updateProjectionMatrix();
    }

    if (lights.key.current) {
      lights.key.current.intensity = THREE.MathUtils.damp(lights.key.current.intensity, frame.key, 4, delta);
      lights.key.current.color.lerp(tmpColor.current.set(frame.color), d);
    }
    if (lights.fill.current) {
      lights.fill.current.intensity = THREE.MathUtils.damp(lights.fill.current.intensity, frame.fill, 4, delta);
    }
    if (lights.rim.current) {
      lights.rim.current.intensity = THREE.MathUtils.damp(lights.rim.current.intensity, frame.rim, 4, delta);
    }
    if (lights.ambient.current) {
      lights.ambient.current.intensity = THREE.MathUtils.damp(lights.ambient.current.intensity, frame.ambient, 4, delta);
    }
  });

  return null;
}
