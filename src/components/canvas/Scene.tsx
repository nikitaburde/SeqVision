"use client";

import { Html, Text } from "@react-three/drei";
import { useMemo, useState } from "react";

import type { RenderableTensor } from "@/simulation/runtime";

export interface SceneNode {
  id: string;
  label: string;
  type: "tensor" | "gate" | "projection" | "state";
}

interface SceneProps {
  tensor: RenderableTensor;
  onTensorHover: (tensor: RenderableTensor | null) => void;
}

function valueColor(value: number) {
  const intensity = Math.min(1, Math.abs(value) / 0.6);
  if (value >= 0) {
    return `rgb(${35 + intensity * 40}, ${95 + intensity * 120}, ${180 + intensity * 65})`;
  }

  return `rgb(${180 + intensity * 55}, ${70 + intensity * 35}, ${95 + intensity * 55})`;
}

export function Scene({ tensor, onTensorHover }: SceneProps) {
  const [rows, columns] = tensor.shape;
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const cellSize = Math.min(0.88, 5 / Math.max(rows, columns));
  const cells = useMemo(
    () =>
      tensor.values.map((value, index) => ({
        id: `${tensor.id}-${index}`,
        index,
        value,
        x: ((index % columns) - (columns - 1) / 2) * cellSize,
        z: (Math.floor(index / columns) - (rows - 1) / 2) * cellSize,
      })),
    [cellSize, columns, rows, tensor.id, tensor.values],
  );

  return (
    <group
      onPointerLeave={() => {
        setHoveredIndex(null);
        onTensorHover(null);
      }}
    >
      <Text
        position={[0, 0.85, (-rows * cellSize) / 2 - 0.3]}
        fontSize={0.22}
        color="#e2e8f0"
        anchorX="center"
      >
        {tensor.name} • shape [{tensor.shape.join(" × ")}]
      </Text>
      {cells.map((cell) => (
        <group key={cell.id} position={[cell.x, 0, cell.z]}>
          <mesh
            castShadow
            receiveShadow
            onPointerEnter={(event) => {
              event.stopPropagation();
              setHoveredIndex(cell.index);
              onTensorHover(tensor);
            }}
          >
            <boxGeometry args={[cellSize * 0.88, 0.16 + Math.abs(cell.value) * 0.7, cellSize * 0.88]} />
            <meshStandardMaterial color={valueColor(cell.value)} roughness={0.42} metalness={0.08} />
          </mesh>
          {hoveredIndex === cell.index ? (
            <Html position={[0, 0.5, 0]} center zIndexRange={[50, 0]} style={{ pointerEvents: "none" }}>
              <div
                role="tooltip"
                className="min-w-56 rounded-md border border-slate-600 bg-slate-950/95 p-3 text-left text-xs text-slate-100 shadow-xl"
              >
                <p className="font-semibold">{tensor.name}</p>
                <p className="mt-1 text-slate-300">Shape: [{tensor.shape.join(" × ")}]</p>
                <p className="mt-1 font-mono text-cyan-200">{tensor.equation}</p>
                <p className="mt-1 text-slate-300">
                  Wₓ[{Math.floor(cell.index / columns)}, {cell.index % columns}] = {cell.value.toFixed(4)}
                </p>
              </div>
            </Html>
          ) : null}
        </group>
      ))}
    </group>
  );
}
