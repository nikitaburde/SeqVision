type ModelExplorerScaffoldProps = {
  name: string;
  tagline: string;
  chapters: readonly string[];
  equation: string;
  inspectorTargets: readonly string[];
};

export default function ModelExplorerScaffold({
  name,
  tagline,
  chapters,
  equation,
  inspectorTargets,
}: ModelExplorerScaffoldProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <section className="rounded-3xl border bg-card p-8">
        <p className="text-sm font-medium text-muted-foreground">Model Explorer</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{name} Explorer</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">{tagline}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-[280px_1fr_320px]">
        <aside className="rounded-2xl border bg-card p-5">
          <h2 className="font-medium">Walkthrough chapters</h2>
          <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
            {chapters.map((chapter, index) => (
              <li key={chapter}>
                {index + 1}. {chapter}
              </li>
            ))}
          </ol>
        </aside>

        <div className="min-h-[460px] rounded-2xl border bg-background p-6">
          <div className="flex h-full flex-col items-center justify-center gap-5 rounded-xl border border-dashed p-8 text-center">
            <div className="grid grid-cols-4 gap-3">
              {inspectorTargets.slice(0, 4).map((target) => (
                <div key={target} className="rounded-xl border bg-card px-4 py-3 text-xs text-muted-foreground">
                  {target}
                </div>
              ))}
            </div>
            <p className="max-w-md text-sm text-muted-foreground">
              Interactive WebGL renderer, timeline, camera controls, and tensor flow animation mount here.
            </p>
          </div>
        </div>

        <aside className="rounded-2xl border bg-card p-5">
          <h2 className="font-medium">Equation + tensor inspector</h2>
          <code className="mt-4 block rounded-xl bg-muted p-3 text-xs text-muted-foreground">
            {equation}
          </code>
          <div className="mt-5 space-y-2 text-sm text-muted-foreground">
            {inspectorTargets.map((target) => (
              <p key={target}>• {target}</p>
            ))}
          </div>
        </aside>
      </section>
    </div>
  );
}
