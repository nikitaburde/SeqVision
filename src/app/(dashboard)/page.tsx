import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const architectures = [
  {
    name: "LSTM",
    href: "/models/lstm",
    complexity: "O(n)",
    state: "cell + hidden state",
    focus: "Gates, memory, BPTT",
  },
  {
    name: "xLSTM",
    href: "/models/xlstm",
    complexity: "O(n)",
    state: "matrix + scalar memory",
    focus: "mLSTM, sLSTM, exponential gates",
  },
  {
    name: "GRU",
    href: "/models/gru",
    complexity: "O(n)",
    state: "hidden state",
    focus: "Reset/update interpolation",
  },
  {
    name: "Mamba",
    href: "/models/mamba",
    complexity: "O(n)",
    state: "selective state space",
    focus: "Selective scan propagation",
    featured: true,
  },
  {
    name: "Transformer",
    href: "/models/transformer",
    complexity: "O(n²)",
    state: "attention context",
    focus: "Attention, residuals, FFN",
  },
  {
    name: "ConvLSTM",
    href: "/models/convlstm",
    complexity: "O(n·k²)",
    state: "spatial cell maps",
    focus: "Convolutional gates",
  },
  {
    name: "TCN",
    href: "/models/tcn",
    complexity: "O(n)",
    state: "receptive field",
    focus: "Dilated residual convolutions",
  },
];

const quickDemos = [
  "Temperature forecasting with LSTM gates",
  "Traffic flow with GRU state blending",
  "Transformer vs Mamba runtime growth",
  "ECG anomaly detection with TCN filters",
  "Radar nowcasting with ConvLSTM kernels",
];

const workedExamples = [
  "Forecast electricity demand from a sliding window",
  "Classify ECG signals with temporal filters",
  "Inspect Mamba selective parameters over 10,000 steps",
];

export default function HomePage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-12 pb-16">
      <section className="grid gap-8 rounded-[2rem] border bg-card p-8 shadow-sm lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
        <div className="flex flex-col justify-center gap-6">
          <div className="inline-flex w-fit rounded-full border bg-muted px-3 py-1 text-sm text-muted-foreground">
            Equation-synchronized sequence model visualization
          </div>
          <div className="space-y-4">
            <h1 className="max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
              Watch sequence models compute, tensor by tensor.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              SeqVision turns LSTM, xLSTM, GRU, Mamba, Transformer, ConvLSTM,
              and TCN internals into clickable, animated walkthroughs where every
              gate, projection, convolution, scan, and state update stays locked
              to its equation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
              href="/models/mamba"
            >
              Launch Mamba explorer
            </Link>
            <Link
              className="rounded-full border px-5 py-3 text-sm font-medium"
              href="/models/lstm"
            >
              Start with LSTM
            </Link>
          </div>
        </div>

        <div className="relative min-h-[360px] overflow-hidden rounded-[1.5rem] border bg-background p-6">
          <div className="absolute inset-x-6 top-6 flex items-center justify-between text-xs text-muted-foreground">
            <span>selective scan</span>
            <span>O(n)</span>
          </div>
          <div className="flex h-full items-center justify-center">
            <div className="grid w-full grid-cols-5 items-center gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl border bg-muted shadow-inner" />
                  <div className="h-24 w-2 rounded-full bg-gradient-to-b from-primary/80 to-primary/10" />
                  <div className="h-12 w-12 rounded-full border bg-card" />
                </div>
              ))}
            </div>
          </div>
          <div className="absolute inset-x-6 bottom-6 rounded-2xl border bg-card/90 p-4 text-sm text-muted-foreground shadow-sm">
            Mamba is shown as continuous state propagation: input-conditioned
            parameters update the carried state at each step without attention
            imagery.
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Architecture selector</p>
            <h2 className="text-3xl font-semibold tracking-tight">Choose a model explorer</h2>
          </div>
          <Link className="text-sm font-medium underline underline-offset-4" href="/docs">
            Read the docs
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {architectures.map((architecture) => (
            <Link key={architecture.name} href={architecture.href}>
              <Card
                className={
                  architecture.featured
                    ? "h-full border-primary/40 bg-primary/5"
                    : "h-full transition-colors hover:bg-muted/50"
                }
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {architecture.name}
                    <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {architecture.complexity}
                    </span>
                  </CardTitle>
                  <CardDescription>{architecture.focus}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  State: {architecture.state}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick demos</CardTitle>
            <CardDescription>Launch preconfigured teaching scenarios.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {quickDemos.map((demo) => (
                <li key={demo}>• {demo}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest additions</CardTitle>
            <CardDescription>Designed for a changelog-fed release stream.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>Flagship Mamba selective scan storyboard.</p>
            <p>Live tensor inspector specification.</p>
            <p>Comparison lab for O(n²) attention and O(n) scans.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Worked examples</CardTitle>
            <CardDescription>Practical walkthroughs using real sequence data.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {workedExamples.map((example) => (
                <li key={example}>• {example}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Link className="rounded-2xl border bg-card p-6 transition-colors hover:bg-muted/50" href="/research">
          <p className="font-medium">Research mode</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Inspect gradients, activation distributions, feature maps, loss landscapes, and weight evolution.
          </p>
        </Link>
        <Link className="rounded-2xl border bg-card p-6 transition-colors hover:bg-muted/50" href="/compare">
          <p className="font-medium">Comparison mode</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Synchronize LSTM vs GRU, Transformer vs Mamba, TCN vs LSTM, and more.
          </p>
        </Link>
        <Link
          className="rounded-2xl border bg-card p-6 transition-colors hover:bg-muted/50"
          href={process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/"}
        >
      </section>
    </div>
  );
}
