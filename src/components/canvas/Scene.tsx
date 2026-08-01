"use client";

import { Text } from "@react-three/drei";
import { useMemo } from "react";

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
  if (value >= 0) {
    const intensity = Math.min(1, Math.abs(value));
    return `rgb(${35 + intensity * 40}, ${95 + intensity * 120}, ${180 + intensity * 65})`;
  }

  const intensity = Math.min(1, Math.abs(value));
  return `rgb(${180 + intensity * 55}, ${70 + intensity * 35}, ${95 + intensity * 55})`;
}

export function Scene({ tensor, onTensorHover }: SceneProps) {
  const [rows, columns] = tensor.shape;
  const cells = useMemo(
    () =>
      tensor.values.map((value, index) => ({
        id: `${tensor.id}-${index}`,
        value,
        x: (index % columns) - (columns - 1) / 2,
        z: Math.floor(index / columns) - (rows - 1) / 2,
      })),
    [columns, rows, tensor.id, tensor.values],
  );

  return (
    <group onPointerLeave={() => onTensorHover(null)}>
      <Text position={[0, 0.85, -2.15]} fontSize={0.22} color="#e2e8f0" anchorX="center">
        {tensor.name} • shape [{tensor.shape.join(" × ")}]
      </Text>
      {cells.map((cell) => (
        <group key={cell.id} position={[cell.x, 0, cell.z]}>
          <mesh
            castShadow
            receiveShadow
            onPointerEnter={(event) => {
              event.stopPropagation();
              onTensorHover(tensor);
            }}
          >
            <boxGeometry args={[0.88, 0.18 + Math.abs(cell.value) * 0.7, 0.88]} />
            <meshStandardMaterial color={valueColor(cell.value)} roughness={0.42} metalness={0.08} />
          </mesh>
          <Text position={[0, 0.62, 0]} rotation={[-Math.PI / 2.6, 0, 0]} fontSize={0.16} color="#f8fafc" anchorX="center">
            {cell.value.toFixed(2)}
          </Text>
        </group>
      ))}
    </group>
  );
}
