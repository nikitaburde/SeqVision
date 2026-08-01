"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import CanvasWrapper from "@/components/canvas/CanvasWrapper";
import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import Section from "@/components/common/Section";
import { DATASETS, MODEL_SPECS } from "@/constants/model";
import { APP_ROUTES } from "@/constants/routes";
import { getPhaseATensor, type RenderableTensor } from "@/simulation/runtime";
import type { ModelId } from "@/types";

interface ModelExplorerPageProps {
  modelId: ModelId;
}

function TensorInspector({ tensor }: { tensor: RenderableTensor | null }) {
  if (!tensor) {
    return (
      <EmptyState
        title="Hover the tensor"
        description="Move the pointer over the rendered tensor cells to inspect live values, shape, and equation metadata."
      />
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <div>
        <p className="font-medium">{tensor.name}</p>
        <p className="text-xs text-muted-foreground">Shape: [{tensor.shape.join(" × ")}]</p>
      </div>
      <div className="rounded-md bg-muted p-3 font-mono text-xs">{tensor.equation}</div>
      <div className="grid grid-cols-4 gap-1 font-mono text-xs">
        {tensor.values.map((value, index) => (
          <span key={`${tensor.id}-${index}`} className="rounded border px-2 py-1 text-center">
            {value.toFixed(2)}
          </span>
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div>Mean: {tensor.stats.mean.toFixed(3)}</div>
        <div>Variance: {tensor.stats.variance.toFixed(3)}</div>
        <div>Min: {tensor.stats.min.toFixed(2)}</div>
        <div>Max: {tensor.stats.max.toFixed(2)}</div>
      </dl>
    </div>
  );
}

export default function ModelExplorerPage({ modelId }: ModelExplorerPageProps) {
  const model = MODEL_SPECS[modelId];
  const tensor = useMemo(() => getPhaseATensor(modelId), [modelId]);
  const [hoveredTensor, setHoveredTensor] = useState<RenderableTensor | null>(null);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${model.name} Explorer`}
        description={`${model.shortDescription} Equation-linked chapters and tensor-first walkthrough controls.`}
      />

      <div className="grid gap-6 xl:grid-cols-[260px_1fr_300px]">
        <aside className="space-y-3 rounded-xl border p-4">
          <p className="text-sm font-semibold">Walkthrough Chapters</p>
          {model.chapters.map((chapter) => (
            <div key={chapter.id} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{chapter.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{chapter.summary}</p>
            </div>
          ))}
        </aside>

        <div className="space-y-4 rounded-xl border p-4">
          <p className="text-sm font-semibold">Visualization Canvas</p>
          <CanvasWrapper tensor={tensor} onTensorHover={setHoveredTensor} />
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {["Play / Pause", "Step Forward", "Step Back", "Reset", "Camera Reset", "Zoom"].map((control) => (
              <button key={control} className="rounded-md border px-3 py-2 text-left text-sm hover:bg-accent">
                {control}
              </button>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <Section title="Equation Panel" description="Atomic term highlighting and op timeline sync.">
            {tensor ? <div className="rounded-md bg-muted p-3 font-mono text-sm">{tensor.equation}</div> : null}
          </Section>
          <Section title="Tensor Inspector" description="Live stats, shape, values, gradients, and memory profile.">
            <TensorInspector tensor={hoveredTensor} />
          </Section>
        </aside>
      </div>

      <Section title="Datasets" description="Run real-world sequences through this architecture.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {DATASETS.map((dataset) => (
            <article key={dataset.id} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{dataset.name}</p>
              <p className="text-xs text-muted-foreground">{dataset.domain}</p>
              <p className="mt-1 text-xs text-muted-foreground">Target: {dataset.target}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Next Paths">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href={APP_ROUTES.compare} className="rounded-md border px-3 py-2 hover:bg-accent">
            Open Compare Mode
          </Link>
          <Link href={APP_ROUTES.research} className="rounded-md border px-3 py-2 hover:bg-accent">
            Open Research Mode
          </Link>
        </div>
      </Section>
    </div>
  );
}
