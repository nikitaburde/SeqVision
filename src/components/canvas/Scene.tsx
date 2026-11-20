"use client";

import { Html, Line } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import type { Group } from "three";

import type { RenderableTensor } from "@/simulation/runtime";

export interface TensorCell {
  operation: number;
  index: number;
}

interface SceneProps {
  tensors: RenderableTensor[];
  active: number;
  runStep: number | null;
  durationMs: number;
  revealSteps: boolean;
  onSelect: (index: number) => void;
  onCell: (cell: TensorCell | null) => void;
}

type Position = [number, number, number];

function RunPulse({ from, to, durationMs }: { from: Position; to: Position; durationMs: number }) {
  const pulse = useRef<Group>(null);
  const start = useRef<number | null>(null);

  useFrame(({ invalidate }) => {
    if (!pulse.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pulse.current.visible = false;
      return;
    }
    const now = performance.now();
    start.current ??= now;
    const fraction = Math.min(1, (now - start.current) / Math.min(850, durationMs));
    const travel = Math.min(1, fraction / 0.72);
    const smooth = travel * travel * (3 - 2 * travel);
    pulse.current.position.set(
      from[0] + (to[0] - from[0]) * smooth,
      0.72 + 0.33 * Math.sin(Math.PI * travel),
      from[2] + (to[2] - from[2]) * smooth,
    );
    pulse.current.scale.setScalar(1 + 0.23 * Math.sin(Math.PI * fraction));
    if (fraction < 1) invalidate();
  });

  return (
    <group ref={pulse} position={[from[0], 0.72, from[2]]} raycast={() => null}>
      <mesh raycast={() => null}>
        <sphereGeometry args={[0.17, 16, 12]} />
        <meshBasicMaterial color="#fff3bd" />
      </mesh>
      <mesh raycast={() => null}>
        <sphereGeometry args={[0.3, 16, 12]} />
        <meshBasicMaterial color="#dbb9ff" transparent opacity={0.32} depthWrite={false} />
      </mesh>
    </group>
  );
}

function RevealCells({ children, durationMs }: { children: ReactNode; durationMs: number }) {
  const cells = useRef<Group>(null);
  const start = useRef<number | null>(null);
  useFrame(({ invalidate }) => {
    if (!cells.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cells.current.scale.y = 1;
      return;
    }
    const now = performance.now();
    start.current ??= now;
    const progress = Math.max(0, Math.min(1, (now - start.current - 100) / Math.min(550, durationMs)));
    cells.current.scale.y = 0.12 + 0.88 * (1 - (1 - progress) ** 3);
    if (progress < 1) invalidate();
  });
  return <group ref={cells} scale={[1, 0.12, 1]}>{children}</group>;
}

export function Scene({ tensors, active, runStep, durationMs, revealSteps, onSelect, onCell }: SceneProps) {
  const columns = 3;
  const rows = Math.ceil(tensors.length / columns);
  const positions = tensors.map((_, index): Position => {
    const row = Math.floor(index / columns);
    const column = row % 2 === 0 ? index % columns : columns - 1 - index % columns;
    return [(column - 1) * 4.3, 0, (row - (rows - 1) / 2) * 3.05];
  });

  const target = positions[active];
  const origin: Position = active === 0 ? [target[0] - 1.65, 0, target[2]] : positions[active - 1];

  return (
    <group>
      {runStep !== null && <RunPulse key={runStep} from={origin} to={target} durationMs={durationMs} />}
      {positions.slice(1).map((position, index) => {
        const from = positions[index];
        const highlighted = index === active - 1 || index === active;
        return (
          <Line key={index} points={[[from[0], 0.02, from[2]], [position[0], 0.02, position[2]]]}
            color={highlighted ? "#bcacff" : "#4e4963"} lineWidth={highlighted ? 2.4 : 1} />
        );
      })}
      {tensors.map((tensor, operation) => {
        const selected = operation === active;
        const [rowCount, columnCount] = tensor.shape;
        const shownRows = Math.min(rowCount, 8);
        const shownColumns = Math.min(columnCount, 8);
        const scale = Math.max(Math.abs(tensor.stats.min), Math.abs(tensor.stats.max));
        const pitch = Math.min(0.36, 2.55 / shownColumns, 1.27 / shownRows);

        function select(event: ThreeEvent<MouseEvent>) {
          event.stopPropagation();
          if (event.delta < 5) onSelect(operation);
        }

        const cells = revealSteps && operation > active ? null : Array.from({ length: shownRows * shownColumns }, (_, cell) => {
          const row = Math.floor(cell / shownColumns);
          const column = cell % shownColumns;
          const sourceRow = Math.round(row * (rowCount - 1) / Math.max(1, shownRows - 1));
          const sourceColumn = Math.round(column * (columnCount - 1) / Math.max(1, shownColumns - 1));
          const index = sourceRow * columnCount + sourceColumn;
          const value = tensor.values[index];
          const intensity = scale ? Math.abs(value) / scale : 0;
          const height = 0.12 + intensity * 0.55;
          const color = value < 0 ? (selected ? "#f6aa9a" : "#a76468") : (selected ? "#b9f7db" : "#5d9d92");

          return (
            <mesh key={cell} position={[(column - (shownColumns - 1) / 2) * pitch, 0.09 + height / 2, (row - (shownRows - 1) / 2) * pitch]}
              onPointerOver={event => { event.stopPropagation(); onCell({ operation, index }); }}
              onPointerOut={() => onCell(null)}>
              <boxGeometry args={[pitch * 0.82, height, pitch * 0.82]} />
              <meshStandardMaterial color={color} roughness={0.55} />
            </mesh>
          );
        });

        return (
          <group key={tensor.id} position={positions[operation]} onClick={select}>
            <mesh position={[0, 0.02, 0]}>
              <boxGeometry args={[3.45, 0.13, 1.85]} />
              <meshStandardMaterial color={selected ? "#7053c7" : "#332c4b"}
                emissive={selected ? "#5033a8" : "#141124"} emissiveIntensity={selected ? 0.55 : 0.2} />
            </mesh>
            {revealSteps && selected && runStep !== null
              ? <RevealCells key={runStep} durationMs={durationMs}>{cells}</RevealCells>
              : cells}
            <Html center position={[0, 0.22, 1.1]} zIndexRange={[20, 1]} style={{ pointerEvents: "auto" }}>
              <button type="button" aria-label={`Inspect ${tensor.name} in scene`} aria-pressed={selected} onClick={() => onSelect(operation)} className={`seq-node-label${selected ? " seq-node-label-active" : ""}`}>
                {tensor.name}
              </button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
