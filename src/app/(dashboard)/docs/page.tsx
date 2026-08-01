import Link from "next/link";

import PageHeader from "@/components/common/PageHeader";

const docs = [
  { title: "Architecture Handbook", path: "/src/docs/architecture.md" },
  { title: "API Reference", path: "/src/docs/api.md" },
  { title: "Roadmap", path: "/src/docs/roadmap.md" },
  { title: "Contributing", path: "/src/docs/contributing.md" },
];

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Documentation" description="Technical specs, API contracts, roadmap, and contributor workflow." />
      <div className="grid gap-3 md:grid-cols-2">
        {docs.map((doc) => (
          <article key={doc.path} className="rounded-lg border p-4">
            <p className="font-medium">{doc.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{doc.path}</p>
          </article>
        ))}
      </div>
      <Link href="https://github.com/nikitaburde/SeqVision" target="_blank" rel="noreferrer" className="inline-block rounded-md border px-3 py-2 text-sm hover:bg-accent">
        Open Repository
      </Link>
    </div>
  );
}
