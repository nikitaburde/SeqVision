import PageHeader from "@/components/common/PageHeader";
import Section from "@/components/common/Section";

export default function ResearchPage() {
  const modules = [
    "Attention maps",
    "Hidden & cell state traces",
    "Gradient flow",
    "Feature maps",
    "Tensor histograms",
    "Parameter statistics",
    "Activation distributions",
    "Loss landscape",
    "Layer outputs",
    "Weight evolution",
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Research Mode"
        description="Advanced diagnostics workspace with exportable traces, controlled playback, and deep tensor analytics."
      />

      <Section title="Diagnostics Modules">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {modules.map((module) => (
            <article key={module} className="rounded-lg border p-4">
              <p className="font-medium">{module}</p>
              <p className="mt-1 text-xs text-muted-foreground">Live synchronized panel</p>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Saved Layouts & Exports" description="Bookmark analysis workspaces and download experiment traces.">
        <div className="rounded-xl border p-4 text-sm text-muted-foreground">
          Layout presets, bookmarks, and trace exports are persisted through progress APIs.
        </div>
      </Section>
    </div>
  );
}
