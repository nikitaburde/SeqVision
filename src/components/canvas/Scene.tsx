"use client";

import { Html, Line, Text } from "@react-three/drei";
import { useMemo, useState } from "react";

import type { LstmOperation, RenderableTensor } from "@/simulation/runtime";

interface SceneProps {
  operations: LstmOperation[];
  activeOperationId: string;
  onTensorHover: (tensor: RenderableTensor | null) => void;
  onOperationSelect: (operationId: string) => void;
}

function valueColor(value: number) {
  const intensity = Math.min(1, Math.abs(value) / 0.6);
  if (value >= 0) {
    return `rgb(${35 + intensity * 40}, ${95 + intensity * 120}, ${180 + intensity * 65})`;
  }

  return `rgb(${180 + intensity * 55}, ${70 + intensity * 35}, ${95 + intensity * 55})`;
}

export function getOperationPosition(index: number, count: number): number {
  return (index - (count - 1) / 2) * 2.4;
}

export function Scene({ operations, activeOperationId, onTensorHover, onOperationSelect }: SceneProps) {
  const [hoveredCell, setHoveredCell] = useState<{ operationId: string; index: number } | null>(null);

  const edges = useMemo(() => {
    const sourceIndex = new Map(operations.map((item, index) => [item.tensor.id, index]));
    return operations.flatMap((item, targetIndex) =>
      item.inputTensorIds.flatMap((inputId) => {
        const source = sourceIndex.get(inputId);
        return source === undefined ? [] : [{ id: `${inputId}-${item.id}`, source, target: targetIndex }];
      }),
    );
  }, [operations]);

  return (
    <group
      onPointerLeave={() => {
        setHoveredCell(null);
        onTensorHover(null);
      }}
    >
      {edges.map((edge) => (
        <Line
          key={edge.id}
          points={[
            [getOperationPosition(edge.source, operations.length), 0.04, 0],
            [getOperationPosition(edge.target, operations.length), 0.04, 0],
          ]}
          color="#475569"
          lineWidth={1}
          transparent
          opacity={0.45}
        />
      ))}

      {operations.map((item, operationIndex) => {
        const [rows, columns] = item.tensor.shape;
        const cellSize = Math.min(0.72, 3.6 / Math.max(rows, columns));
        const active = item.id === activeOperationId;
        const nodeX = getOperationPosition(operationIndex, operations.length);
        const cells = item.tensor.values.map((value, index) => ({
          index,
          value,
          x: ((index % columns) - (columns - 1) / 2) * cellSize,
          z: (Math.floor(index / columns) - (rows - 1) / 2) * cellSize,
        }));

        return (
          <group key={item.id} position={[nodeX, 0, 0]}>
            <Text
              position={[0, Math.max(1.15, (rows * cellSize) / 2 + 0.55), 0]}
              fontSize={active ? 0.2 : 0.14}
              color={active ? "#f8fafc" : "#94a3b8"}
              anchorX="center"
              maxWidth={2.2}
              textAlign="center"
            >
              {item.title}
            </Text>
            {cells.map((cell) => (
              <group key={`${item.tensor.id}-${cell.index}`} position={[cell.x, 0, cell.z]}>
                <mesh
                  onClick={(event) => {
                    event.stopPropagation();
                    onOperationSelect(item.id);
                  }}
                  onPointerEnter={(event) => {
                    event.stopPropagation();
                    setHoveredCell({ operationId: item.id, index: cell.index });
                    onTensorHover(item.tensor);
                  }}
                >
                  <boxGeometry args={[cellSize * 0.82, 0.16 + Math.abs(cell.value) * 0.65, cellSize * 0.82]} />
                  <meshStandardMaterial
                    color={active ? "#fbbf24" : valueColor(cell.value)}
                    emissive={active ? "#b45309" : "#000000"}
                    emissiveIntensity={active ? 0.24 : 0}
                    roughness={0.45}
                    metalness={0.06}
                  />
                </mesh>
                {hoveredCell?.operationId === item.id && hoveredCell.index === cell.index ? (
                  <Html position={[0, 0.45, 0]} center zIndexRange={[50, 0]} style={{ pointerEvents: "none" }}>
                    <div
                      role="tooltip"
                      className="min-w-56 rounded-md border border-slate-600 bg-slate-950/95 p-3 text-left text-xs text-slate-100 shadow-xl"
                    >
                      <p className="font-semibold">{item.tensor.name}</p>
                      <p className="mt-1 text-slate-300">Shape: [{item.tensor.shape.join(" × ")}]</p>
                      <p className="mt-1 font-mono text-cyan-200">{item.equation}</p>
                      <p className="mt-1 text-slate-300">
                        Value [{Math.floor(cell.index / columns)}, {cell.index % columns}]: {cell.value.toFixed(4)}
                      </p>
                    </div>
                  </Html>
                ) : null}
              </group>
            ))}
          </group>
        );
      })}
    </group>
  );
}
