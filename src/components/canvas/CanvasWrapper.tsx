"use client";

import { CameraControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import CameraControlsImpl from "camera-controls";
import { useEffect, useMemo, useRef } from "react";

import { GridOverlay } from "@/components/canvas/Grid";
import { getOperationPosition, Scene } from "@/components/canvas/Scene";
import type { LstmOperation, RenderableTensor } from "@/simulation/runtime";

interface CanvasWrapperProps {
  operations: LstmOperation[];
  activeIndex: number;
  onTensorHover: (tensor: RenderableTensor | null) => void;
  onOperationSelect: (operationId: string) => void;
}

export default function CanvasWrapper({
  operations,
  activeIndex,
  onTensorHover,
  onOperationSelect,
}: CanvasWrapperProps) {
  const controlsRef = useRef<CameraControlsImpl>(null);
  const focusX = useMemo(
    () => getOperationPosition(activeIndex, operations.length),
    [activeIndex, operations.length],
  );

  useEffect(() => {
    controlsRef.current?.setLookAt(focusX, 4.5, 8.5, focusX, 0, 0, true);
  }, [focusX]);

  return (
    <div className="h-full min-h-[28rem] w-full overflow-hidden bg-slate-950">
      <Canvas camera={{ position: [focusX, 4.5, 8.5], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 7, 5]} intensity={1.25} />
        <pointLight position={[-3, 2, -4]} intensity={0.65} color="#60a5fa" />
        <GridOverlay focusX={focusX} />
        <Scene
          operations={operations}
          activeOperationId={operations[activeIndex]?.id ?? ""}
          onTensorHover={onTensorHover}
          onOperationSelect={onOperationSelect}
        />
        <CameraControls ref={controlsRef} makeDefault minDistance={4} maxDistance={14} />
      </Canvas>
    </div>
  );
}
