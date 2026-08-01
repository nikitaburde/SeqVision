interface FeatureCardProps {
  title: string;
  description: string;
  meta?: string;
}

export default function FeatureCard({ title, description, meta }: FeatureCardProps) {
  return (
    <article className="rounded-xl border bg-card p-4">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {meta ? <p className="mt-3 text-xs text-muted-foreground">{meta}</p> : null}
    </article>
  );
}
