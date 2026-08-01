import Link from "next/link";

export default function TopNavbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <h1 className="font-semibold">Interactive Sequence Model Visualizer</h1>
      <div className="flex items-center gap-4 text-sm">
        <span className="text-muted-foreground">60 FPS target</span>
        <Link
          href="https://github.com/nikitaburde/SeqVision"
          target="_blank"
          rel="noreferrer"
          className="rounded-md border px-3 py-1.5 hover:bg-accent"
        >
          GitHub
        </Link>
      </div>
    </header>
  );
}
