import Link from "next/link";

import FeatureCard from "@/components/common/FeatureCard";
import HomeDemo from "@/components/model/HomeDemo";
import PageHeader from "@/components/common/PageHeader";
import Section from "@/components/common/Section";
import { COMPARE_PRESETS, MODELS } from "@/constants/model";
import { APP_ROUTES } from "@/constants/routes";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="SeqVision"
        description="Step through seven sequence models and inspect the tensors behind each operation."
      />

      <section className="rounded-2xl border p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold">Explore an LSTM cell</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Follow sequence states through gates, projections, selective scans, and residual paths with synchronized equations.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={APP_ROUTES.language} className="rounded-md border px-4 py-2 hover:bg-accent">
                Open Language Model Lab
              </Link>
              <Link href={APP_ROUTES.models.lstm} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
                Open 3D LSTM walkthrough
              </Link>
              <Link href={APP_ROUTES.compare} className="rounded-md border px-4 py-2 hover:bg-accent">
                Open Comparison Mode
              </Link>
            </div>
          </div>
          <HomeDemo />
        </div>
      </section>

      <Section title="Architecture Selector" description="Model explorers with chapter-based walkthroughs.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {MODELS.map((model) => (
            <Link key={model.id} href={APP_ROUTES.models[model.id]} className="block rounded-xl hover:bg-accent">
              <FeatureCard title={model.name} description={model.shortDescription} meta={`Complexity ${model.complexity}`} />
            </Link>
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
            <Link key={preset.id} href={`${APP_ROUTES.compare}?pair=${preset.id}`} className="rounded-lg border p-4 hover:bg-accent">
              <p className="font-medium">{preset.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">Shared inputs and synchronized time steps.</p>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}
