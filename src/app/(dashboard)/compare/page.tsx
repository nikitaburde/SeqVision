"use client";

import { Suspense, useState } from "react";

import { useSearchParams } from "next/navigation";

import PageHeader from "@/components/common/PageHeader";
import Section from "@/components/common/Section";
import { LessonControls, usePlayback } from "@/components/model/LessonControls";
import { TensorGrid, TensorStats } from "@/components/model/TensorView";
import { COMPARE_PRESETS, MODEL_SPECS } from "@/constants/model";
import { getLessonFrame, LESSON_DEFAULTS } from "@/simulation/runtime";

export default function ComparePage() {
  return <Suspense fallback={<p>Loading comparison…</p>}><CompareWorkspace /></Suspense>;
}

function CompareWorkspace() {
  const preset = useSearchParams().get("pair");
  return <Comparison key={preset} initialPair={preset} />;
}

function Comparison({ initialPair }: { initialPair: string | null }) {
  const [pairId, setPairId] = useState(COMPARE_PRESETS.find(preset => preset.id === initialPair)?.id ?? COMPARE_PRESETS[0].id);
  const [length, setLength] = useState(128);
  const pair = COMPARE_PRESETS.find(preset => preset.id === pairId) ?? COMPARE_PRESETS[0];
  const models = [MODEL_SPECS[pair.left], MODEL_SPECS[pair.right]];
  const phases = Math.max(...models.map(model => model.chapters.length));
  const lastStep = phases * LESSON_DEFAULTS.length - 1;
  const player = usePlayback(lastStep);
  const time = Math.floor(player.step / phases);
  const attention = length * (length + 1) / 2;

  return (
    <div className="space-y-8">
      <PageHeader title="Comparison Mode" description="Inspect two teaching models on the same input and time step." />
      <label className="block text-sm font-medium">Model pair
        <select className="ml-2 rounded-md border bg-background p-2" value={pairId}
          onChange={event => { setPairId(event.target.value); player.seek(0); }}>
          {COMPARE_PRESETS.map(preset => <option key={preset.id} value={preset.id}>{preset.label}</option>)}
        </select>
      </label>
      <p className="text-sm text-muted-foreground">Time step {time + 1} of {LESSON_DEFAULTS.length}. Each model holds its final chapter until the next time step.</p>
      <LessonControls player={player} lastStep={lastStep} />
      <div className="grid gap-4 lg:grid-cols-2">
        {models.map(model => {
          const phase = Math.min(player.step % phases, model.chapters.length - 1);
          const { tensor } = getLessonFrame(model.id, time * model.chapters.length + phase);
          return (
            <article key={model.id} className="min-w-0 space-y-4 rounded-xl border p-4">
              <h2 className="text-lg font-semibold">{model.name} · {model.complexity}</h2>
              <p className="break-words rounded-md bg-muted p-3 font-mono text-sm">{tensor.equation}</p>
              <TensorGrid tensor={tensor} />
              <TensorStats tensor={tensor} />
            </article>
          );
        })}
      </div>
      <Section title="Attention and scan growth" description="Count causal attention score pairs and recurrence steps over the same sequence.">
        <label className="block text-sm">Sequence length · {length.toLocaleString()}
          <input type="range" min={10} max={10000} value={length} className="block w-full" onChange={event => setLength(Number(event.target.value))} />
        </label>
        {[["Causal attention score pairs", attention], ["Selective scan steps", length]].map(([label, count]) => (
          <div key={label} className="space-y-1 text-sm">
            <p>{label} · {count.toLocaleString()}</p>
            <div className="h-3 rounded bg-muted"><div className="h-full rounded bg-primary" style={{ width: `${100 * Number(count) / attention}%` }} /></div>
          </div>
        ))}
      </Section>
    </div>
  );
}
