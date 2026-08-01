import PageHeader from "@/components/common/PageHeader";
import Section from "@/components/common/Section";
import { COMPARE_PRESETS, MODEL_SPECS } from "@/constants/model";

export default function ComparePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Comparison Mode"
        description="Synchronized side-by-side model walkthroughs with memory, latency, parameters, complexity, speed, and accuracy deltas."
      />

      <Section title="Preset Pairs">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {COMPARE_PRESETS.map((preset) => {
            const left = MODEL_SPECS[preset.left];
            const right = MODEL_SPECS[preset.right];
            return (
              <article key={preset.id} className="rounded-xl border p-4">
                <p className="font-semibold">{preset.label}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {left.complexity} vs {right.complexity}
                </p>
                <p className="text-xs text-muted-foreground">Timeline sync, inference speed trend, and parameter delta.</p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section title="Complexity Visualizer" description="Transformer O(n²) against Mamba O(n), sequence slider 10 → 10,000.">
        <div className="rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">
            Computational graph and runtime growth panel scaffold with linear selective scan rendering cues.
          </p>
        </div>
      </Section>
    </div>
  );
}
