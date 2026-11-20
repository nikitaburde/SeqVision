"use client";

import { useState } from "react";
import { TensorGrid } from "@/components/model/TensorView";
import { getLessonFrame } from "@/simulation/runtime";

export default function HomeDemo() {
  const [phase, setPhase] = useState(1);
  const { tensor, chapter } = getLessonFrame("lstm", phase);
  return (
    <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
      <p className="font-medium">{chapter.title}</p>
      <p className="font-mono text-sm">{tensor.equation}</p>
      <TensorGrid tensor={tensor} />
      <button className="rounded-md border px-3 py-2 text-sm hover:bg-accent" type="button" onClick={() => setPhase(phase === 6 ? 1 : phase + 1)}>Next LSTM operation</button>
    </div>
  );
}
