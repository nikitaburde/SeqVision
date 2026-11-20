"use client";

import { Grid } from "@react-three/drei";

interface GridOverlayProps {
  focusX?: number;
}

export function GridOverlay({ focusX = 0 }: GridOverlayProps) {
  return (
    <Grid
      args={[12, 12]}
      cellColor="#334155"
      cellSize={0.5}
      fadeDistance={16}
      fadeStrength={1.5}
      position={[focusX, -0.08, 0]}
      sectionColor="#64748b"
      sectionSize={2}
    />
  );
}
