import Link from "next/link";

export default function TopNavbar() {
  return (
    <header className="hidden h-16 shrink-0 items-center justify-between border-b bg-background px-6 lg:flex">
      <p className="font-semibold">Interactive Sequence Model Visualizer</p>
      <div className="flex items-center gap-4 text-sm">
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
