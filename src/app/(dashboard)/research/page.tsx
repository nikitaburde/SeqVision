"use client";

import { useState } from "react";

import PageHeader from "@/components/common/PageHeader";
import Section from "@/components/common/Section";
import { LessonControls, usePlayback } from "@/components/model/LessonControls";
import { TensorGrid, TensorStats } from "@/components/model/TensorView";
import { DATASETS, MODELS, MODEL_SPECS } from "@/constants/model";
import { getLessonFrame, LESSON_DEFAULTS, LESSON_LIMITS } from "@/simulation/runtime";
import type { ModelId } from "@/types";

export default function ResearchPage() {
  const [modelId, setModel] = useState<ModelId>("lstm");
  const [dataset, setDataset] = useState("");
  const [phase, setPhase] = useState(0);
  const [length, setLength] = useState(LESSON_DEFAULTS.length);
  const model = MODEL_SPECS[modelId];
  const lastStep = length - 1;
  const player = usePlayback(lastStep);
  const options = { ...LESSON_DEFAULTS, dataset, length };
  const trace = Array.from({ length: options.length }, (_, t) =>
    getLessonFrame(modelId, t * model.chapters.length + phase, options)
  );
  const { tensor } = trace[player.step];

  function exportTrace() {
    const blob = new Blob([JSON.stringify({ modelId, options, frames: trace }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `seqvision-${tensor.id}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const control = "block w-full rounded-md border bg-background p-2";
  return (
    <div className="space-y-8">
      <PageHeader title="Research Mode" description="Follow an operation across time, inspect its tensor distribution, and export a reproducible trace." />
      <div className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm">Model
          <select value={modelId} className={control} onChange={e => { setModel(e.target.value as ModelId); setPhase(0); player.seek(0); }}>
            {MODELS.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label className="text-sm">Operation
          <select value={phase} className={control} onChange={e => { setPhase(Number(e.target.value)); player.seek(0); }}>
            {model.chapters.map((chapter, index) => <option key={chapter.id} value={index}>{chapter.title}</option>)}
          </select>
        </label>
        <label className="text-sm">Input sequence
          <select value={dataset} className={control} onChange={e => { setDataset(e.target.value); player.seek(0); }}>
            <option value="">Example tensor</option>
            {DATASETS.map(item => <option key={item.id} value={item.id}>{item.name} (synthetic)</option>)}
          </select>
        </label>
        <label className="text-sm">Sequence length · {length}
          <input type="range" className="block w-full" min={1} max={LESSON_LIMITS.length} value={length}
            onChange={e => { setLength(Number(e.target.value)); player.seek(0); }} />
        </label>
      </div>
      <LessonControls player={player} lastStep={lastStep} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        <Section title={tensor.name}>
          <p className="break-words rounded-md bg-muted p-3 font-mono text-sm">{tensor.equation}</p>
          <TensorGrid tensor={tensor} />
        </Section>
        <Section title="Tensor statistics"><TensorStats tensor={tensor} /></Section>
      </div>
      <Section title="Mean by time step">
        <div className="flex flex-wrap gap-2">
          {trace.map(frame => (
            <button key={frame.time} type="button" aria-pressed={frame.time === player.step}
              className="rounded-md border px-4 py-2 text-sm aria-pressed:bg-accent" onClick={() => player.seek(frame.time)}>
              Step {frame.time + 1} · {frame.tensor.stats.mean.toFixed(4)}
            </button>
          ))}
        </div>
        <button type="button" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" onClick={exportTrace}>Download trace (JSON)</button>
      </Section>
    </div>
  );
}
