import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer, MeshReflectorMaterial, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import Sculpture from "./Sculpture";
import PetalField from "./Petals";
import Rig, { useSceneRig } from "./Rig";
import { scrollState } from "../lib/scrollStore";

function Floor() {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (!ref.current) return;
    // sink the reflective floor away as we move into the more intimate,
    // noise-reduced later scenes (about / contact)
    const fade = scrollState.progress > 0.62 ? 1 : 0;
    const targetY = -1.15 - fade * 1.4;
    ref.current.position.y = THREE.MathUtils.damp(ref.current.position.y, targetY, 3, delta);
  });
  return (
    <group ref={ref} position={[0, -1.15, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <MeshReflectorMaterial
          blur={[400, 100]}
          resolution={1024}
          mixBlur={1}
          mixStrength={35}
          roughness={1}
          depthScale={1}
          minDepthThreshold={0.85}
          color="#050403"
          metalness={0.6}
          mirror={0.35}
        />
      </mesh>
    </group>
  );
}

function Atmosphere() {
  return (
    <Sparkles
      count={70}
      scale={[6, 3, 6]}
      size={1.4}
      speed={0.15}
      opacity={0.35}
      color="#e9caa0"
      noise={1}
    />
  );
}

function Lights() {
  const rig = useSceneRig();
  return (
    <>
      <ambientLight ref={rig.ambient} intensity={0.12} color="#dcd3c6" />
      <directionalLight ref={rig.key} position={[3.5, 4, 2.5]} intensity={1.1} color="#fff3e2" />
      <directionalLight ref={rig.fill} position={[-4, 1.5, -1]} intensity={0.25} color="#9fb4c9" />
      <directionalLight ref={rig.rim} position={[-1, 2, -4]} intensity={0.9} color="#f6e5cf" />
      <Rig lights={rig} />
    </>
  );
}

export default function Scene3D({ petals = true }: { petals?: boolean }) {
  return (
    <Canvas
      dpr={[1, 1.8]}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, -0.1, 6.6], fov: 34, near: 0.1, far: 50 }}
    >
      <color attach="background" args={["#0a0908"]} />
      <fog attach="fog" args={["#0a0908", 6, 16]} />
      <Suspense fallback={null}>
        <Lights />
        <Sculpture />
        <Floor />
        <Atmosphere />
        {petals && <PetalField />}
        <Environment resolution={256} frames={1} environmentIntensity={0.55}>
          <Lightformer form="rect" intensity={4} color="#fff3e2" position={[0, 4, 9]} scale={[10, 4, 1]} />
          <Lightformer form="rect" intensity={1.5} color="#f6e5cf" rotation-y={Math.PI / 2} position={[-5, 1.5, 1]} scale={[5, 2, 1]} />
          <Lightformer form="rect" intensity={1.2} color="#9fb4c9" rotation-y={-Math.PI / 2} position={[5, 0.5, 1]} scale={[5, 2, 1]} />
          <Lightformer form="ring" intensity={2} color="#ffffff" position={[-1, 2, -5]} scale={5} />
          <Lightformer form="rect" intensity={0.8} color="#e9caa0" rotation-x={-Math.PI / 2} position={[0, -2, 2]} scale={[8, 8, 1]} />
        </Environment>
      </Suspense>
      <EffectComposer multisampling={0}>
        <Bloom intensity={0.35} luminanceThreshold={0.85} luminanceSmoothing={0.3} mipmapBlur />
        <ChromaticAberration offset={new THREE.Vector2(0.0006, 0.0006)} radialModulation={false} modulationOffset={0} />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
