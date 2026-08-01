"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";

import { GridOverlay } from "@/components/canvas/Grid";
import { Scene } from "@/components/canvas/Scene";
import type { RenderableTensor } from "@/simulation/runtime";

interface CanvasWrapperProps {
  tensor: RenderableTensor | null;
  onTensorHover: (tensor: RenderableTensor | null) => void;
}

export default function CanvasWrapper({ tensor, onTensorHover }: CanvasWrapperProps) {
  return (
    <div className="h-[28rem] w-full overflow-hidden rounded-lg border bg-slate-950">
      {tensor ? (
        <Canvas dpr={[1, 2]} shadows>
          <PerspectiveCamera makeDefault position={[0, 4.5, 7]} fov={45} />
          <ambientLight intensity={0.65} />
          <directionalLight position={[4, 6, 5]} intensity={1.4} castShadow />
          <pointLight position={[-3, 2, -4]} intensity={0.8} color="#60a5fa" />
          <GridOverlay />
          <Scene tensor={tensor} onTensorHover={onTensorHover} />
          <OrbitControls enablePan={false} minDistance={4} maxDistance={11} />
        </Canvas>
      ) : (
        <div className="grid h-full place-items-center p-8 text-center text-sm text-slate-300">
          Renderable tensors are available after the LSTM milestone is complete.
        </div>
      )}
    </div>
  );
}
