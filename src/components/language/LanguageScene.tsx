"use client";

import { Grid, Html, Line, OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

import WebGLBoundary from "@/components/canvas/WebGLBoundary";
import { BLUEPRINTS, DECODER_STAGES, type DecoderPass } from "@/language/decoder";

type Point = [number, number, number];
const STATIONS: Point[] = [[-6, 0, -2], [-2, 0, -2], [2, 0, -2], [6, 0, -2], [6, 0, 2], [2, 0, 2], [-2, 0, 2]];
const INK = "#745baf";
const TEAL = "#8ee8d2";
const CORAL = "#f8a893";

export interface SceneProps {
  pass: DecoderPass;
  active: number;
  moving: boolean;
  durationMs: number;
  frame: number;
  view: (typeof BLUEPRINTS)[number] | undefined;
  cameraReset: number;
  onInspect: (index: number) => void;
}

function Camera({ preview }: { preview: boolean }) {
  const { width, height } = useThree(state => state.size);
  return <OrthographicCamera makeDefault position={[5, 15, 16]}
    zoom={Math.max(1, Math.min(width / (preview ? 17 : 19), height / 10.8))} />;
}

function Packet({ from, to, durationMs, delay = 0, color = "#fff0af", radius = 0.13 }: {
  from: Point; to: Point; durationMs: number; delay?: number; color?: string; radius?: number;
}) {
  const mesh = useRef<Mesh>(null);
  const start = useRef<number | null>(null);
  useFrame(({ invalidate }) => {
    if (!mesh.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const now = performance.now();
    start.current ??= now;
    const progress = Math.min(1, Math.max(0, (now - start.current - delay) / durationMs));
    mesh.current.visible = progress > 0 && progress < 1;
    mesh.current.position.set(
      from[0] + (to[0] - from[0]) * progress,
      from[1] + (to[1] - from[1]) * progress + Math.sin(progress * Math.PI) * 0.58,
      from[2] + (to[2] - from[2]) * progress,
    );
    if (progress < 1) invalidate();
  });
  return <mesh ref={mesh} visible={false} raycast={() => null}>
    <sphereGeometry args={[radius, 12, 8]} />
    <meshBasicMaterial color={color} />
  </mesh>;
}

function glyphValues(pass: DecoderPass, stage: number) {
  switch (stage) {
    case 0: return pass.context.map(token => token.segment === "output" ? -0.75 : token.segment === "separator" ? 0 : 0.75);
    case 1: return pass.values.flat();
    case 2: return pass.attention;
    case 3: return pass.pooled;
    case 4: return pass.availability;
    case 5: return pass.probabilities;
    default: return [pass.emitted === "EOS" ? 0 : 1];
  }
}

function InferenceGraph({ pass, active, moving, durationMs, frame, onInspect }: Omit<SceneProps, "view" | "cameraReset">) {
  const target = STATIONS[active];
  const source = STATIONS[active - 1] ?? [-8, 0, -2];
  return (
    <group>
      {STATIONS.slice(1).map((point, index) => (
        <Line key={index} points={[STATIONS[index], point]} color={index === active - 1 ? "#d7beff" : "#55436d"} lineWidth={index === active - 1 ? 2.2 : 1} />
      ))}
      {moving && <Packet key={frame} durationMs={durationMs * 0.72} from={[source[0], 0.55, source[2]]} to={[target[0], 0.55, target[2]]} />}
      {moving && active === 3 && pass.contributions.map((row, index) => {
        const channel = row.findIndex(value => value !== 0);
        if (channel < 0) return null;
        return <Packet key={`${frame}:${index}`} durationMs={durationMs * 0.63} delay={index / pass.context.length * durationMs * 0.29} color={row[channel] < 0 ? CORAL : TEAL} radius={0.1}
          from={[source[0] - 0.8 + 1.6 * index / pass.context.length, 0.4, source[2] + (index % 3 - 1) * 0.36]}
          to={[target[0] + (channel - 2.5) * 0.34, 0.62, target[2]]} />;
      })}
      {DECODER_STAGES.map((stage, index) => {
        const selected = index === active;
        const values = glyphValues(pass, index);
        const width = index === 1 ? 6 : Math.min(9, values.length);
        const rows = Math.ceil(values.length / width);
        const pitch = Math.min(0.34, 2.6 / width, 1.25 / rows);
        const scale = Math.max(...values.map(Math.abs), 0.001);
        return (
          <group key={stage.short} position={STATIONS[index]}
            onClick={event => { event.stopPropagation(); if (event.delta < 5) onInspect(index); }}>
            <mesh position={[0, 0.12, 0]}>
              <boxGeometry args={[3.28, 0.25, 1.85]} />
              <meshStandardMaterial color={selected ? INK : "#332746"} emissive={selected ? "#51367f" : "#191027"} emissiveIntensity={selected ? 0.64 : 0.3} />
            </mesh>
            {index <= active && values.map((value, i) => {
              const height = 0.09 + 0.62 * Math.abs(value) / scale;
              return (
                <mesh key={i} position={[(i % width - (width - 1) / 2) * pitch, 0.25 + height / 2, (Math.floor(i / width) - (rows - 1) / 2) * pitch]}>
                  <boxGeometry args={[pitch * 0.75, height, pitch * 0.75]} />
                  <meshStandardMaterial color={value < 0 ? CORAL : value > 0 ? TEAL : "#66577f"} />
                </mesh>
              );
            })}
            <Html center position={[0, 0.28, 1.04]} zIndexRange={[20, 1]}>
              <button type="button" className={`seq-node-label${selected ? " seq-node-label-active" : ""}`}
                aria-label={`Inspect ${stage.title} in 3D`} aria-pressed={selected} onClick={() => onInspect(index)}>{index === 6 && selected ? `${stage.short} · ${pass.emitted}` : stage.short}</button>
            </Html>
          </group>
        );
      })}
    </group>
  );
}

function BlueprintGraph({ view, active, onInspect }: { view: NonNullable<SceneProps["view"]>; active: number; onInspect: SceneProps["onInspect"] }) {
  const spacing = 13.8 / view.layers;
  return (
    <group>
      <Line points={[[-7.7, 0.12, 0], [7.7, 0.12, 0]]} color="#ae8ce6" lineWidth={2} />
      {Array.from({ length: view.layers }, (_, layer) => {
        const x = -6.9 + (layer + 0.5) * spacing;
        const selected = layer === active;
        return (
          <group key={layer} position={[x, 0, 0]} onClick={event => { event.stopPropagation(); if (event.delta < 5) onInspect(layer); }}>
            <mesh position={[0, 0.57, 0]}>
              <boxGeometry args={[spacing * 0.72, 1.14, 2.9]} />
              <meshStandardMaterial color={selected ? "#b291ee" : layer % 2 ? "#514072" : "#655086"} />
            </mesh>
            <mesh position={[0, 0.82, -1.52]}>
              <boxGeometry args={[spacing * 0.65, 1.64, 0.55]} />
              <meshStandardMaterial color={selected ? TEAL : "#437a7c"} />
            </mesh>
            <mesh position={[0, 0.74, 1.52]}>
              <boxGeometry args={[spacing * 0.65, 1.48, 0.55]} />
              <meshStandardMaterial color={selected ? CORAL : "#8d626e"} />
            </mesh>
            {selected && <Html center position={[0, 0.55, 2.18]} zIndexRange={[20, 1]}>
              <span className="seq-node-label seq-node-label-active">Layer {layer + 1}</span>
            </Html>}
          </group>
        );
      })}
      {[[-7.7, "Tokens"], [7.7, "Logits"]].map(([x, title]) => (
        <group key={title} position={[Number(x), 0.4, 0]}>
          <mesh><boxGeometry args={[0.7, 0.8, 1.5]} /><meshStandardMaterial color="#9974d3" /></mesh>
          <Html center position={[0, 0.1, 1.04]} zIndexRange={[20, 1]}><span className="seq-node-label">{title}</span></Html>
        </group>
      ))}
    </group>
  );
}

const fallback = <p className="grid h-full place-items-center px-5 text-center text-sm text-violet-200">3D requires WebGL. The timeline and computation inspector are available here.</p>;

export default function LanguageScene({ view, cameraReset, ...props }: SceneProps) {
  return (
    <WebGLBoundary fallback={fallback}>
      <Canvas key={cameraReset} frameloop="demand" dpr={[1, 1.5]} fallback={fallback}>
        <Camera preview={Boolean(view)} />
        <ambientLight intensity={1.15} />
        <directionalLight color="#f1e8ff" intensity={2.25} position={[5, 8, 6]} />
        <Grid args={[32, 32]} position={[0, -0.07, 0]} cellSize={0.5} cellColor="#35294a"
          sectionSize={2} sectionColor="#524066" fadeDistance={23} fadeStrength={1.8} />
        {view ? <BlueprintGraph view={view} active={props.active} onInspect={props.onInspect} /> : <InferenceGraph {...props} />}
        <OrbitControls enableDamping minZoom={12} maxZoom={175} maxPolarAngle={Math.PI / 2.04} />
      </Canvas>
    </WebGLBoundary>
  );
}
