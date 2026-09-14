import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { scrollState } from "../lib/scrollStore";

/**
 * The centerpiece: an abstract sculptural bloom of chrome petals wrapped
 * around a suspended glass core. Purely geometric / material driven —
 * no external assets required, so it renders identically everywhere.
 */

const PETAL_COUNT = 6;

function Petals() {
  const group = useRef<THREE.Group>(null);

  const petals = useMemo(() => {
    return new Array(PETAL_COUNT).fill(0).map((_, i) => {
      const angle = (i / PETAL_COUNT) * Math.PI * 2;
      return {
        angle,
        tilt: 0.55 + (i % 2 === 0 ? 0.08 : -0.05),
        scale: 1 - (i % 3) * 0.045,
      };
    });
  }, []);

  useFrame((_, delta) => {
    if (!group.current) return;
    // gentle continuous drift, speed modulated slightly by scroll velocity
    group.current.rotation.y += delta * 0.04 + scrollState.velocity * 0.6;
  });

  return (
    <group ref={group}>
      {petals.map((p, i) => (
        <group key={i} rotation={[0, p.angle, 0]}>
          <group rotation={[p.tilt, 0, 0]} position={[0, 0.05, 0]} scale={p.scale}>
            <mesh castShadow receiveShadow position={[0, 0, 1.05]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[1.05, 0.042, 32, 120, Math.PI * 1.15]} />
              <meshPhysicalMaterial
                color="#e7e2da"
                metalness={1}
                roughness={0.22}
                envMapIntensity={1.6}
                clearcoat={0.6}
                clearcoatRoughness={0.25}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
}

function Halo() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.z -= delta * 0.025;
    ref.current.rotation.x = Math.PI / 2 + Math.sin(scrollState.progress * Math.PI) * 0.15;
  });
  return (
    <mesh ref={ref} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[2.15, 0.006, 16, 200]} />
      <meshBasicMaterial color="#cdbfa6" toneMapped={false} />
    </mesh>
  );
}

function Core() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15;
  });
  return (
    <group>
      <pointLight color="#f4c98f" intensity={2.2} distance={2.5} decay={2} />
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.44, 2]} />
        <MeshTransmissionMaterial
          thickness={0.6}
          roughness={0.06}
          transmission={1}
          ior={1.3}
          chromaticAberration={0.02}
          backside
          color="#fff7ec"
        />
      </mesh>
    </group>
  );
}

export default function Sculpture() {
  const root = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!root.current) return;
    // scene-to-scene rotational choreography layered on top of idle drift
    const target = scrollState.progress * Math.PI * 2.4;
    root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, target, 2.4, 0.016);
    const bob = Math.sin(scrollState.progress * Math.PI * 2) * 0.05;
    root.current.position.y = THREE.MathUtils.damp(root.current.position.y, bob, 3, 0.016);
  });

  return (
    <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.35}>
      <group ref={root}>
        <Petals />
        <Halo />
        <Core />
      </group>
    </Float>
  );
}
