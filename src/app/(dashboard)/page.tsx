import Link from "next/link";

import FeatureCard from "@/components/common/FeatureCard";
import PageHeader from "@/components/common/PageHeader";
import Section from "@/components/common/Section";
import { COMPARE_PRESETS, DATASETS, MODELS } from "@/constants/model";
import { APP_ROUTES } from "@/constants/routes";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="SeqVision"
        description="Open-source, equation-locked visual explanations for sequence models from LSTM to Mamba."
      />

      <section className="rounded-2xl border p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Interactive Hero</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Follow sequence states through gates, projections, selective scans, and residual paths with synchronized equations.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={APP_ROUTES.models.mamba} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
                Launch Mamba Flagship
              </Link>
              <Link href={APP_ROUTES.compare} className="rounded-md border px-4 py-2 hover:bg-accent">
                Open Comparison Mode
              </Link>
            </div>
          </div>
          <div className="grid min-h-52 place-items-center rounded-xl border border-dashed bg-muted/20">
            <p className="text-sm text-muted-foreground">Sequence flow animation canvas placeholder</p>
          </div>
        </div>
      </section>

      <Section title="Architecture Selector" description="Model explorers with chapter-based walkthroughs.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MODELS.map((model) => (
            <FeatureCard
              key={model.id}
              title={model.name}
              description={model.shortDescription}
              meta={`Complexity: ${model.complexity} • Status: ${model.status.toUpperCase()}`}
            />
          ))}
        </div>
      </Section>

      <Section title="Quick Demos" description="30–60 second presets for fast understanding.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            "LSTM gate dynamics",
            "Mamba selective scan",
            "Transformer attention heads",
            "TCN receptive field growth",
          ].map((demo) => (
            <button key={demo} className="rounded-lg border p-4 text-left hover:bg-accent">
              <p className="font-medium">{demo}</p>
              <p className="mt-1 text-xs text-muted-foreground">Preset walkthrough</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Latest Additions">
        <div className="grid gap-3 md:grid-cols-2">
          <FeatureCard title="Model Explorer Shell" description="Unified chapter sidebar, canvas, equation panel, and tensor inspector zones." />
          <FeatureCard title="API Skeleton" description="Endpoints for models, walkthroughs, simulation, tensors, datasets, compare, and research." />
        </div>
      </Section>

      <Section title="Worked Examples" description="Real dataset presets to inspect computation behavior.">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {DATASETS.slice(0, 4).map((dataset) => (
            <article key={dataset.id} className="rounded-lg border p-4">
              <p className="font-medium">{dataset.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{dataset.domain}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Documentation & Research">
        <div className="flex flex-wrap gap-3 text-sm">
          <Link href={APP_ROUTES.docs} className="rounded-md border px-3 py-2 hover:bg-accent">
            Documentation
          </Link>
          <Link href={APP_ROUTES.research} className="rounded-md border px-3 py-2 hover:bg-accent">
            Research Mode
          </Link>
          <a
            href="https://github.com/nikitaburde/SeqVision"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border px-3 py-2 hover:bg-accent"
          >
            GitHub
          </a>
        </div>
      </Section>

      <Section title="Comparison Presets">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {COMPARE_PRESETS.map((preset) => (
            <article key={preset.id} className="rounded-lg border p-4">
              <p className="font-medium">{preset.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">Synchronized timelines and metric diffs.</p>
            </article>
          ))}
        </div>
      </Section>
    </div>
  );
}
