import Link from "next/link";

import EmptyState from "@/components/common/EmptyState";
import PageHeader from "@/components/common/PageHeader";
import Section from "@/components/common/Section";
import { DATASETS, MODEL_SPECS } from "@/constants/model";
import { APP_ROUTES } from "@/constants/routes";
import type { ModelId } from "@/types";

interface ModelExplorerPageProps {
  modelId: ModelId;
}

export default function ModelExplorerPage({ modelId }: ModelExplorerPageProps) {
  const model = MODEL_SPECS[modelId];

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
          <div className="grid min-h-72 place-items-center rounded-lg border border-dashed bg-muted/20">
            <p className="text-sm text-muted-foreground">
              3D/2D synchronized renderer for {model.name} operations and equation steps.
            </p>
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {[
              "Play / Pause",
              "Step Forward",
              "Step Back",
              "Reset",
              "Camera Reset",
              "Zoom",
            ].map((control) => (
              <button key={control} className="rounded-md border px-3 py-2 text-left text-sm hover:bg-accent">
                {control}
              </button>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <Section title="Equation Panel" description="Atomic term highlighting and op timeline sync.">
            <EmptyState
              title="Equation Sync"
              description="Each matrix multiply, bias add, activation, and state write is surfaced frame-by-frame."
            />
          </Section>
          <Section title="Tensor Inspector" description="Live stats, shape, values, gradients, and memory profile.">
            <EmptyState
              title="Inspector Ready"
              description="Click any gate/projection/tensor to inspect values, distributions, and metadata."
            />
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
