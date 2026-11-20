"use client";

import { Grid, OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import type { ComponentProps } from "react";

import WebGLBoundary from "@/components/canvas/WebGLBoundary";
import { Scene } from "@/components/canvas/Scene";

const fallback = (
  <div className="grid h-full place-items-center px-6 text-center text-sm text-violet-200">
    WebGL is unavailable. Use the chapter list and tensor inspector to continue the walkthrough.
  </div>
);

function FitCamera({ count }: { count: number }) {
  const { width, height } = useThree(state => state.size);
  const zoom = Math.min(width / 16.6, height / (count > 9 ? 13 : 11.2));
  return <OrthographicCamera makeDefault position={[6, 12, 13]} near={0.1} far={100} zoom={zoom} />;
}

export default function CanvasWrapper({ cameraReset, ...scene }: ComponentProps<typeof Scene> & { cameraReset: number }) {
  return (
    <WebGLBoundary fallback={fallback}>
      <Canvas key={cameraReset}
        dpr={[1, 1.75]} fallback={fallback} frameloop="demand">
        <FitCamera count={scene.tensors.length} />
        <ambientLight intensity={1.15} />
        <directionalLight position={[4, 9, 6]} intensity={2.1} color="#efe7ff" />
        <directionalLight position={[-5, 3, -3]} intensity={0.7} color="#9cadff" />
        <Grid position={[0, -0.1, 0]} args={[30, 30]} cellSize={0.5} cellColor="#302547"
          sectionSize={2} sectionColor="#504168" fadeDistance={23} fadeStrength={1.8} />
        <Scene {...scene} />
        <OrbitControls enablePan enableDamping minZoom={18} maxZoom={160} maxPolarAngle={Math.PI / 2.05} />
      </Canvas>
    </WebGLBoundary>
  );
}
