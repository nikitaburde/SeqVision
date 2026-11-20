"use client";

import { ArrowLeft, ArrowRight, Box, Pause, Play, RotateCcw } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

import { usePlayback } from "@/components/model/LessonControls";
import { APP_ROUTES } from "@/constants/routes";
import { ALPHABET, BLUEPRINTS, DECODER_STAGES, DEFAULT_PROMPT, MAX_CONTEXT, MAX_LETTERS, parsePrompt, runDecoder, type DecoderPass } from "@/language/decoder";

import "@/styles/explorer.css";
import "@/styles/language.css";

const LanguageScene = dynamic(() => import("./LanguageScene"), {
  ssr: false,
  loading: () => <p className="grid h-full place-items-center text-sm text-violet-200">Loading the 3D network…</p>,
});

const STEP_MS = 950;
const STAGES = DECODER_STAGES.length;
const BUTTON = "seq-transport-button";
const OUTPUT_LABELS = [...ALPHABET, "EOS"];
const FORMULAS = [
  "",
  "V = signed one-hot(context)",
  "attention = softmax(QKᵀ / √d) = 1 / visible positions",
  "pooled = Σᵢ attentionᵢ × Vᵢ",
  `available = ReLU(${MAX_CONTEXT} × pooled) − ReLU(${MAX_CONTEXT} × pooled − 1)`,
  "letter logits = 4 × available + alphabet bias",
  "next token = argmax(logits)",
];
const BLUEPRINT_COMPONENTS = [
  ["Token embedding", "Maps token IDs to feature vectors before the first decoder block."],
  ["Causal self-attention", "Projects queries, keys, and values into heads and lets each position mix information from its visible prefix."],
  ["Feed-forward network", "Transforms features at each position independently. Residual paths carry information around the attention and feed-forward sublayers."],
  ["Vocabulary readout", "Projects the final hidden representation to one logit for each vocabulary token."],
];

function NumberTable({ columns, rows, label }: { columns: readonly string[]; rows: { label: string; values: number[] }[]; label: string }) {
  return (
    <div className="max-h-60 overflow-auto">
      <table className="lang-table">
        <caption className="sr-only">{label}</caption>
        <thead><tr><th scope="col">Position</th>{columns.map(column => <th scope="col" key={column}>{column}</th>)}</tr></thead>
        <tbody>{rows.map(row => (
          <tr key={row.label}><th scope="row">{row.label}</th>
            {row.values.map((value, column) => <td key={column} data-sign={Math.sign(value)}>{value.toFixed(3)}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function Computation({ pass, stage }: { pass: DecoderPass; stage: number }) {
  if (stage === 0) return (
    <div className="flex flex-wrap gap-1.5" aria-label="Tokens in the current context">
      {pass.context.map((token, index) => <span key={index} className="lang-chip" data-segment={token.segment}
        title={`Position ${index + 1}: ${token.segment}`}>{token.text}</span>)}
    </div>
  );

  function rowsFor(matrix: number[][]) {
    return matrix.map((values, index) => ({ label: `${index + 1} · ${pass.context[index].text}`, values }));
  }

  switch (stage) {
    case 1: return <NumberTable columns={ALPHABET} rows={rowsFor(pass.values)} label="Signed value rows" />;
    case 2: return <NumberTable columns={["Weight"]} rows={rowsFor(pass.attention.map(weight => [weight]))} label="Attention weight by position" />;
    case 3: return <NumberTable columns={ALPHABET} rows={[...rowsFor(pass.contributions), { label: "Sum", values: pass.pooled }]} label="Weighted values and their sum" />;
    case 4: return <NumberTable columns={ALPHABET} rows={[{ label: "Available", values: pass.availability }]} label="Availability by letter" />;
    case 5: return <NumberTable columns={OUTPUT_LABELS} rows={[{ label: "Logit", values: pass.logits }, { label: "Probability", values: pass.probabilities }]} label="Logits and probabilities" />;
    default: return <p className="rounded-lg bg-[#ebe2f7] p-3 font-medium text-[#3d275d]">Selected token <strong className="ml-2 font-mono">{pass.emitted}</strong></p>;
  }
}

export default function LanguageLab() {
  const [draft, setDraft] = useState(DEFAULT_PROMPT);
  const [prompt, setPrompt] = useState(() => parsePrompt(DEFAULT_PROMPT)!);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState("decoder");
  const [layer, setLayer] = useState(0);
  const [cameraReset, setCameraReset] = useState(0);
  const [speed, setSpeed] = useState(1);
  const passes = useMemo(() => runDecoder(prompt), [prompt]);
  const last = passes.length * STAGES - 1;
  const player = usePlayback(last, speed, STEP_MS);
  const blueprint = BLUEPRINTS.find(entry => entry.id === profile);
  const passIndex = Math.floor(player.step / STAGES);
  const stageIndex = player.step % STAGES;
  const pass = passes[passIndex];
  const stage = DECODER_STAGES[stageIndex];
  const emitted = passes.slice(0, passIndex + Number(stageIndex === STAGES - 1));
  const output = emitted.filter(entry => entry.emitted !== "EOS");
  const finished = emitted.at(-1)?.emitted === "EOS";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = parsePrompt(draft);
    if (!next) {
      setError(`Enter 1–${MAX_LETTERS} letters from A to F. Spaces and commas are optional.`);
      return;
    }
    setError("");
    setPrompt(next);
    player.restart();
  }

  function inspect(index: number) {
    if (blueprint) setLayer(index);
    else player.seek(passIndex * STAGES + index);
  }

  return (
    <div className="seq-explorer lang-lab">
      <header className="seq-explorer-header">
        <Link href={APP_ROUTES.home} className="flex items-center gap-2 font-semibold tracking-tight">
          <Box size={21} aria-hidden="true" /> SeqVision
        </Link>
        <nav aria-label="Lab navigation" className="flex items-center gap-4 text-sm text-violet-200">
          <Link href={APP_ROUTES.models.transformer} className="hover:text-white">Transformer</Link>
          <Link href={APP_ROUTES.docs} className="hover:text-white">Docs</Link>
        </nav>
      </header>

      <div className="seq-explorer-workspace lang-workspace">
        <section aria-label="3D decoder network" className="seq-stage">
          <div className="seq-stage-heading">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Language Model Lab</h1>
              <p className="mt-1 text-sm text-violet-200">{blueprint ? "Architecture preview" : "Autoregressive letter sorting"}</p>
            </div>
            <button type="button" className={BUTTON} onClick={() => setCameraReset(value => value + 1)}>
              <RotateCcw size={15} aria-hidden="true" /> Reset camera
            </button>
          </div>

          <div className="lang-viewport-banner">
            {blueprint
              ? <span>{blueprint.layers} layers · {blueprint.heads} heads per layer · width {blueprint.width.toLocaleString("en-US")}</span>
              : <>
                <span className="font-medium">Pass {passIndex + 1} / {passes.length}</span>
                <span className="text-violet-200">{stage.title}</span>
              </>}
          </div>

          <div className="seq-canvas lang-canvas">
            <LanguageScene pass={pass} active={blueprint ? layer : stageIndex} view={blueprint}
              moving={player.running && !blueprint} durationMs={STEP_MS / speed} frame={player.step} cameraReset={cameraReset} onInspect={inspect} />
          </div>

          <div className="seq-stage-caption">
            <p>Drag to orbit · Scroll or pinch to zoom · Select a block to inspect</p>
          </div>

          {blueprint ? (
            <div className="seq-transport">
              <label className="w-full text-xs text-violet-200">
                Inspect layer {layer + 1} / {blueprint.layers}
                <input type="range" className="block w-full accent-[#c0afff]" min={1} max={blueprint.layers} value={layer + 1}
                  onChange={event => setLayer(Number(event.target.value) - 1)} />
              </label>
            </div>
          ) : (
            <div className="seq-transport">
              <div className="flex shrink-0 items-center gap-2">
                <button type="button" className={BUTTON} aria-label="Previous operation" disabled={player.step === 0} onClick={() => player.seek(player.step - 1)}><ArrowLeft size={16} /></button>
                <button type="button" className={`${BUTTON} seq-play`} onClick={player.toggle}>
                  {player.running ? <Pause size={16} /> : <Play size={16} />}
                  {player.running ? "Pause" : player.completed ? "Replay" : "Play"}
                </button>
                <button type="button" className={BUTTON} aria-label="Next operation" disabled={player.step === last} onClick={() => player.seek(player.step + 1)}><ArrowRight size={16} /></button>
              </div>
              <label className="min-w-0 flex-1 text-xs text-violet-200">
                Inference timeline · {player.step + 1} / {last + 1}
                <input type="range" className="block w-full accent-[#c0afff]" min={0} max={last} value={player.step}
                  onChange={event => player.seek(Number(event.target.value))} />
              </label>
            </div>
          )}
        </section>

        <aside className="seq-guide lang-guide" aria-label="Model controls and computation">
          <label htmlFor="language-profile" className="lang-label">Model</label>
          <select id="language-profile" className="lang-field" value={profile} onChange={event => {
            setProfile(event.target.value);
            setLayer(0);
            setCameraReset(value => value + 1);
            player.seek(player.step);
          }}>
            <option value="decoder">Tiny letter sorter · runnable</option>
            {BLUEPRINTS.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
          </select>

          {blueprint ? (
            <>
              <p className="lang-note">Architecture preview. Weights are absent from these presets, and inference is available in the tiny letter sorter.</p>
              <section className="lang-section">
                <h2>Decoder layer {layer + 1}</h2>
                <dl className="lang-specs">
                  {Object.entries({ "Hidden width": blueprint.width, "Attention heads": blueprint.heads, "Head width": blueprint.width / blueprint.heads, "Context window": blueprint.context, "Vocabulary": blueprint.vocab }).map(([label, value]) =>
                    <div key={label}><dt>{label}</dt><dd>{value.toLocaleString("en-US")}</dd></div>)}
                </dl>
                <dl className="space-y-3 text-sm">
                  {BLUEPRINT_COMPONENTS.map(([title, description]) => (
                    <div key={title}><dt className="font-semibold">{title}</dt><dd className="mt-0.5 text-[#574a68]">{description}</dd></div>
                  ))}
                </dl>
              </section>
            </>
          ) : (
            <>
              <form onSubmit={submit} className="lang-section">
                <label htmlFor="language-prompt" className="lang-label">Prompt</label>
                <div className="flex gap-2">
                  <input id="language-prompt" className="lang-field min-w-0 flex-1 font-mono" value={draft} onChange={event => setDraft(event.target.value)}
                    maxLength={64} spellCheck={false} autoComplete="off" aria-invalid={Boolean(error)} aria-describedby={error ? "language-error" : "language-hint"} />
                  <button type="submit" className="lang-run">Run prompt</button>
                </div>
                <p id="language-hint" className="lang-note">1–{MAX_LETTERS} letters from A to F. The fixed-weight decoder generates a sorted sequence one token at a time.</p>
                {error && <p id="language-error" role="alert" className="mt-2 text-sm text-[#922f4f]">{error}</p>}
              </form>

              <section className="lang-section">
                <h2>Generated tokens</h2>
                <div className="mt-2 flex min-h-8 flex-wrap gap-1.5" aria-live="polite">
                  {output.map((entry, index) => <span key={index} className="lang-chip" data-segment="output">{entry.emitted}</span>)}
                  {finished && <span className="lang-chip" title="End of sequence">EOS</span>}
                  {!output.length && !finished && <span className="lang-note">Output appears as tokens are emitted.</span>}
                </div>
              </section>

              <section className="lang-section">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2>{stage.title}</h2>
                  <label className="text-xs font-medium">Speed{" "}
                    <select className="rounded-md border border-[#d6cee0] bg-white p-1" value={speed} onChange={event => setSpeed(Number(event.target.value))}>
                      {[0.5, 1, 2].map(value => <option key={value} value={value}>{value}×</option>)}
                    </select>
                  </label>
                </div>
                <p className="lang-note mb-3">{stage.description}</p>
                {FORMULAS[stageIndex] && <p className="lang-formula">{FORMULAS[stageIndex]}</p>}
                <Computation pass={pass} stage={stageIndex} />
              </section>

              <details className="seq-disclosure">
                <summary>Explore operations <span aria-hidden="true">⌄</span></summary>
                <ol className="pb-2">
                  {DECODER_STAGES.map((item, index) => (
                    <li key={item.title}><button type="button" className="seq-chapter-link"
                      aria-current={index === stageIndex ? "step" : undefined} onClick={() => inspect(index)}>{item.title}</button></li>
                  ))}
                </ol>
              </details>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
