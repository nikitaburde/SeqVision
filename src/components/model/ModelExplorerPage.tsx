"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import CanvasWrapper from "@/components/canvas/CanvasWrapper";
import { MODEL_SPECS } from "@/constants/model";
import { runLstmForwardPass, type LstmOperation, type RenderableTensor } from "@/simulation/runtime";
import { useSimulationStore } from "@/stores/simulationStore";
import { useWalkthroughStore } from "@/stores/walkthroughStore";
import type { ModelId } from "@/types";

interface ModelExplorerPageProps {
  modelId: ModelId;
}

const TIME_STEPS = 3;
const INPUT_FEATURES = 4;

function createInitialInput(): number[][] {
  return Array.from({ length: TIME_STEPS }, () => Array(INPUT_FEATURES).fill(0) as number[]);
}

function TensorInspection({ tensor }: { tensor: RenderableTensor | null }) {
  if (!tensor) {
    return <p className="text-xs text-slate-400">Hover a tensor cell to inspect its value.</p>;
  }

  return (
    <div className="space-y-2 text-xs">
      <p className="font-medium text-slate-100">{tensor.name}</p>
      <p className="text-slate-400">Shape [{tensor.shape.join(" × ")}] · mean {tensor.stats.mean.toFixed(3)} · variance {tensor.stats.variance.toFixed(3)}</p>
    </div>
  );
}

function InputSequenceEditor({
  values,
  onChange,
}: {
  values: number[][];
  onChange: (timeStep: number, feature: number, value: number) => void;
}) {
  return (
    <details className="group rounded-lg border border-slate-800 bg-slate-900/60">
      <summary className="cursor-pointer list-none px-3 py-2 text-xs font-medium text-slate-300">
        Edit the 3 × 4 input sequence
      </summary>
      <div className="space-y-2 border-t border-slate-800 p-3">
        {values.map((row, timeStep) => (
          <fieldset key={timeStep} className="space-y-1">
            <legend className="text-[10px] uppercase tracking-wide text-slate-500">Time step {timeStep + 1}</legend>
            <div className="grid grid-cols-4 gap-1">
              {row.map((value, feature) => (
                <label key={feature} className="sr-only">
                  Step {timeStep + 1}, feature {feature + 1}
                  <input
                    aria-label={`Step ${timeStep + 1}, feature ${feature + 1}`}
                    type="number"
                    step="0.1"
                    value={value}
                    onChange={(event) => onChange(timeStep, feature, Number(event.target.value))}
                    className="w-full rounded border border-slate-700 bg-slate-950 px-1 py-1 text-center text-xs text-slate-100"
                  />
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <p className="text-[10px] leading-4 text-slate-500">Inputs start at zero. Edit them to recompute the forward pass.</p>
      </div>
    </details>
  );
}

export default function ModelExplorerPage({ modelId }: ModelExplorerPageProps) {
  const model = MODEL_SPECS[modelId];
  const [inputSequence, setInputSequence] = useState(createInitialInput);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredTensor, setHoveredTensor] = useState<RenderableTensor | null>(null);
  const isPlaying = useSimulationStore((state) => state.isPlaying);
  const setPlaying = useSimulationStore((state) => state.setPlaying);
  const setPlayhead = useSimulationStore((state) => state.setPlayhead);
  const setChapterId = useWalkthroughStore((state) => state.setChapterId);

  const operations = useMemo(
    () => (modelId === "lstm" ? runLstmForwardPass(inputSequence) : []),
    [inputSequence, modelId],
  );
  const activeOperation = operations[activeIndex] ?? operations[0] ?? null;

  useEffect(() => {
    setPlayhead(activeIndex);
    setChapterId(activeOperation?.id ?? "");
  }, [activeIndex, activeOperation?.id, setChapterId, setPlayhead]);

  useEffect(() => {
    if (!isPlaying || operations.length === 0) return;
    const timer = window.setInterval(() => {
      setActiveIndex((index) => Math.min(index + 1, operations.length - 1));
    }, 1400);
    return () => window.clearInterval(timer);
  }, [isPlaying, operations.length]);

  useEffect(() => {
    if (isPlaying && activeIndex >= operations.length - 1) setPlaying(false);
  }, [activeIndex, isPlaying, operations.length, setPlaying]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "")) return;

      if (event.code === "Space") {
        event.preventDefault();
        setPlaying(!isPlaying);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setPlaying(false);
        setActiveIndex((index) => Math.min(index + 1, operations.length - 1));
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setPlaying(false);
        setActiveIndex((index) => Math.max(0, index - 1));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, operations.length, setPlaying]);

  const selectOperation = useCallback(
    (operationId: string) => {
      const index = operations.findIndex((operation) => operation.id === operationId);
      if (index >= 0) {
        setPlaying(false);
        setActiveIndex(index);
      }
    },
    [operations, setPlaying],
  );

  const updateInput = useCallback((timeStep: number, feature: number, value: number) => {
    setInputSequence((sequence) =>
      sequence.map((row, rowIndex) =>
        rowIndex === timeStep ? row.map((item, itemIndex) => (itemIndex === feature ? value : item)) : row,
      ),
    );
  }, []);

  if (modelId !== "lstm") {
    return (
      <main className="mx-auto max-w-3xl space-y-4 px-6 py-12">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">SeqVision · model explorer</p>
        <h1 className="text-3xl font-semibold">{model.name}</h1>
        <p className="text-muted-foreground">The {model.name} walkthrough is not implemented yet. The interactive LSTM explorer is the first supported model.</p>
        <Link href="/models/lstm" className="inline-flex rounded-md border px-4 py-2 text-sm hover:bg-accent">
          Open the LSTM explorer
        </Link>
      </main>
    );
  }

  const progress = operations.length ? ((activeIndex + 1) / operations.length) * 100 : 0;

  return (
    <main className="space-y-4 px-4 py-4 lg:px-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-400">SeqVision · interactive LSTM</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Follow the computation</h1>
        </div>
        <p className="max-w-xl text-sm text-muted-foreground">{model.shortDescription} Values are recomputed from the editable input sequence and deterministic initial weights.</p>
      </header>

      <div className="grid min-h-[72vh] gap-3 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="flex max-h-[80vh] flex-col gap-3 overflow-hidden rounded-xl border bg-background p-4">
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Forward pass</span>
              <span>{activeIndex + 1} / {operations.length}</span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded bg-muted">
              <div className="h-full bg-cyan-500 transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {activeOperation ? (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wide text-cyan-500">Step {activeOperation.timeStep}</p>
              <h2 className="text-lg font-semibold leading-tight">{activeOperation.title}</h2>
              <p className="text-sm leading-5 text-muted-foreground">{activeOperation.summary}</p>
              <div className="rounded-lg border bg-muted/40 p-3 font-mono text-xs leading-5" aria-live="polite">
                {activeOperation.equation}
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { setPlaying(false); setActiveIndex(0); }}
              className="rounded-md border px-3 py-2 text-xs hover:bg-accent"
              aria-label="Reset walkthrough"
              title="Reset walkthrough"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((index) => Math.max(0, index - 1))}
              disabled={activeIndex === 0}
              className="rounded-md border px-3 py-2 text-xs hover:bg-accent disabled:opacity-40"
              aria-label="Previous step"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setPlaying(!isPlaying)}
              className="rounded-md bg-cyan-600 px-3 py-2 text-xs font-medium text-white hover:bg-cyan-500"
              aria-label={isPlaying ? "Pause walkthrough" : "Play walkthrough"}
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => setActiveIndex((index) => Math.min(operations.length - 1, index + 1))}
              disabled={activeIndex >= operations.length - 1}
              className="rounded-md border px-3 py-2 text-xs hover:bg-accent disabled:opacity-40"
              aria-label="Next step"
            >
              Next
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground">Space: play or pause · ← / →: step</p>

          <InputSequenceEditor values={inputSequence} onChange={updateInput} />

          <div className="min-h-0 flex-1 overflow-y-auto border-t pt-3">
            <p className="mb-2 text-xs font-semibold">Operations</p>
            <ol className="space-y-1">
              {operations.map((operation: LstmOperation, index) => (
                <li key={operation.id}>
                  <button
                    type="button"
                    onClick={() => selectOperation(operation.id)}
                    aria-current={index === activeIndex ? "step" : undefined}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                      index === activeIndex ? "bg-cyan-500/15 text-cyan-300" : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")} · {operation.title}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="border-t pt-3">
            <p className="mb-2 text-xs font-semibold">Tensor inspector</p>
            <TensorInspection tensor={hoveredTensor} />
          </div>
        </aside>

        <section className="relative min-h-[36rem] overflow-hidden rounded-xl border bg-slate-950" aria-label="Interactive LSTM computation graph">
          <CanvasWrapper
            operations={operations}
            activeIndex={activeIndex}
            onTensorHover={setHoveredTensor}
            onOperationSelect={selectOperation}
          />
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-slate-700 bg-slate-950/80 px-3 py-2 text-[10px] text-slate-400">
            Drag to orbit · scroll to zoom · select a tensor to jump to its operation
          </div>
        </section>
      </div>
    </main>
  );
}
