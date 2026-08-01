"use client";

import { Grid } from "@react-three/drei";

export function GridOverlay() {
  return (
    <Grid
      args={[8, 8]}
      cellColor="#334155"
      cellSize={0.5}
      fadeDistance={12}
      fadeStrength={1.5}
      position={[0, -0.08, 0]}
      sectionColor="#64748b"
      sectionSize={2}
    />
  );
}
