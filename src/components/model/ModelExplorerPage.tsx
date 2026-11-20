"use client";

import { ArrowLeft, ArrowRight, Box, Check, ChevronDown, Pause, Play, RotateCcw, Settings2, SkipBack } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";

import type { TensorCell } from "@/components/canvas/Scene";
import { usePlayback } from "@/components/model/LessonControls";
import { TensorGrid, TensorStats } from "@/components/model/TensorView";
import { PLAYBACK_STEP_MS } from "@/constants/animations";
import { DATASETS, MODELS, MODEL_SPECS } from "@/constants/model";
import { APP_ROUTES } from "@/constants/routes";
import { getChapterBeats, getLessonInput, getLessonTensors, LESSON_DEFAULTS, LESSON_LIMITS } from "@/simulation/runtime";
import type { ModelId } from "@/types";
import { EXPLANATIONS } from "@/walkthrough/explanations";

import "@/styles/explorer.css";

const CanvasWrapper = dynamic(() => import("@/components/canvas/CanvasWrapper"), {
  ssr: false,
  loading: () => <p className="grid h-full place-items-center text-sm text-violet-200">Loading 3D scene…</p>,
});

const CHAPTER_STEP_MS = 3100;
const SCENE_BEATS = 5;

let currentCompletion = "{}";

function subscribeCompletion(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("seqvision-completion", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("seqvision-completion", callback);
  };
}

function readCompletion() {
  try {
    const value = localStorage.getItem("seqvision-completion") ?? currentCompletion;
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? value : "{}";
  } catch {
    return currentCompletion;
  }
}

export default function ModelExplorerPage({ modelId }: { modelId: ModelId }) {
  const model = MODEL_SPECS[modelId];
  const [options, setOptions] = useState(LESSON_DEFAULTS);
  const [speed, setSpeed] = useState(1);
  const [cell, setCell] = useState<TensorCell | null>(null);
  const [camera, setCamera] = useState(0);
  const [inChapter, setInChapter] = useState(false);
  const guide = useRef<HTMLElement>(null);
  const stage = useRef<HTMLElement>(null);
  const completion = useSyncExternalStore(subscribeCompletion, readCompletion, () => "{}");
  const saved = JSON.parse(completion) as Record<string, boolean>;
  const lastStep = options.length * model.chapters.length - 1;
  const player = usePlayback(lastStep, speed);
  const phase = player.step % model.chapters.length;
  const time = Math.floor(player.step / model.chapters.length);
  const chapter = model.chapters[phase];
  const tensors = useMemo(() => getLessonTensors(modelId, time, options), [modelId, time, options]);
  const beats = useMemo(() => inChapter ? getChapterBeats(modelId, phase, time, options) : [], [inChapter, modelId, phase, time, options]);
  const chapterPlayer = usePlayback(Math.max(0, beats.length - 1), speed, CHAPTER_STEP_MS);
  const playback = inChapter ? chapterPlayer : player;
  const endStep = inChapter ? beats.length - 1 : lastStep;
  const currentBeat = beats[chapterPlayer.step];
  const tensor = currentBeat?.tensor ?? tensors[phase];
  const input = getLessonInput(time, options);
  const firstBeat = Math.max(0, Math.min(chapterPlayer.step - 1, beats.length - SCENE_BEATS));
  const sceneTensors = inChapter ? beats.slice(firstBeat, firstBeat + SCENE_BEATS).map(beat => beat.tensor) : tensors;
  const hovered = cell ? sceneTensors[cell.operation] : undefined;

  function seek(step: number) {
    setCell(null);
    player.seek(step);
  }

  function openChapter(index: number) {
    seek(time * model.chapters.length + index);
    setInChapter(true);
    setCamera(value => value + 1);
    chapterPlayer.restart();
    guide.current?.scrollTo({ top: 0 });
    if (window.matchMedia("(max-width: 899px)").matches) stage.current?.scrollIntoView({ block: "start" });
  }

  function exitChapter() {
    setInChapter(false);
    setCell(null);
    setCamera(value => value + 1);
    chapterPlayer.seek(0);
  }

  function seekPlayback(step: number) {
    setCell(null);
    playback.seek(step);
  }

  function updateOptions(next: typeof options) {
    setOptions(next);
    exitChapter();
    seek(0);
  }

  function toggleCompletion() {
    const updated = { ...saved, [chapter.id]: !saved[chapter.id] };
    currentCompletion = JSON.stringify(updated);
    try {
      localStorage.setItem("seqvision-completion", currentCompletion);
    } catch {
      // Keep completion for the current session.
    }
    window.dispatchEvent(new Event("seqvision-completion"));
  }

  const control = "block w-full rounded-md border border-[#d6cee0] bg-white p-2";
  const transport = "seq-transport-button";

  return (
    <div className="seq-explorer">
      <header className="seq-explorer-header">
        <Link href={APP_ROUTES.home} className="flex items-center gap-2 font-semibold tracking-tight">
          <Box size={21} aria-hidden="true" /> SeqVision
        </Link>
        <nav aria-label="Workspace navigation" className="flex items-center gap-4 text-sm text-violet-200">
          <Link href={APP_ROUTES.compare} className="hover:text-white">Compare</Link>
          <Link href={APP_ROUTES.research} className="hover:text-white">Research</Link>
          <Link href={APP_ROUTES.docs} className="hover:text-white">Docs</Link>
        </nav>
      </header>

      <div className="seq-explorer-workspace">
        <section ref={stage} aria-label="Interactive tensor scene" className="seq-stage">
          <div className="seq-stage-heading">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{model.name} Explorer</h1>
              <p className="mt-1 text-sm text-violet-200">{inChapter ? `${chapter.title} · Input ${time + 1}` : `Time step ${time + 1} of ${options.length}`}</p>
            </div>
            <button type="button" className={transport} onClick={() => { setCell(null); setCamera(camera + 1); }}>
              <RotateCcw size={15} aria-hidden="true" /> Reset camera
            </button>
          </div>

          <div className="seq-run-input">
            <span>Input {time + 1}</span>
            <div className="flex flex-wrap gap-1.5">
              {input.map((value, feature) => <code key={feature} title={String(value)}>{value.toFixed(2)}</code>)}
            </div>
            <span className="seq-run-status" role="status">
              {inChapter
                ? (chapterPlayer.completed ? "Chapter animation complete" : currentBeat?.tensor.name)
                : (player.completed ? `Run complete · ${options.length} inputs processed` : player.running ? `Running · ${chapter.title}` : "")}
            </span>
          </div>

          <div className="seq-canvas">
            <CanvasWrapper cameraReset={camera} tensors={sceneTensors} active={inChapter ? chapterPlayer.step - firstBeat : phase}
              revealSteps={inChapter} runStep={playback.running ? playback.step : null} durationMs={(inChapter ? CHAPTER_STEP_MS : PLAYBACK_STEP_MS) / speed}
              onSelect={index => inChapter ? seekPlayback(firstBeat + index) : openChapter(index)} onCell={setCell} />
          </div>

          <div className="seq-stage-caption">
            <p>{hovered && cell && hovered.values[cell.index] !== undefined
              ? `${hovered.name} [${Math.floor(cell.index / hovered.shape[1])}, ${cell.index % hovered.shape[1]}] = ${hovered.values[cell.index].toFixed(4)}`
              : inChapter ? "Select a block to inspect its intermediate tensor" : "Drag to orbit · Scroll to zoom · Select a block to open its chapter"}</p>
            <p className="hidden sm:block">{inChapter ? "Intermediate values follow chapter step order" : "Connections follow walkthrough order"}</p>
          </div>

          <div className="seq-transport">
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={transport} disabled={playback.step === 0} onClick={() => seekPlayback(0)} aria-label="Reset timeline">
                <SkipBack size={15} aria-hidden="true" />
              </button>
              <button type="button" className={transport} disabled={playback.step === 0} onClick={() => seekPlayback(playback.step - 1)} aria-label="Step back">
                <ArrowLeft size={16} aria-hidden="true" />
              </button>
              <button type="button" className={`${transport} seq-play`} onClick={playback.toggle}>
                {playback.running ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                {playback.running ? "Pause" : playback.completed ? "Replay" : "Play"}
              </button>
              <button type="button" className={transport} disabled={playback.step === endStep} onClick={() => seekPlayback(playback.step + 1)} aria-label="Step forward">
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
            <label className="min-w-0 flex-1 text-xs text-violet-200">
              {inChapter ? "Chapter step" : "Model timeline"} · {playback.step + 1} / {endStep + 1}
              <input type="range" className="block w-full accent-[#c0afff]" min={0} max={endStep} value={playback.step}
                onChange={event => seekPlayback(Number(event.target.value))} />
            </label>
          </div>
        </section>

        <aside ref={guide} aria-label="Guided walkthrough" className="seq-guide">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-mono text-xs font-semibold tracking-wider text-[#625476]">
              CHAPTER {phase + 1} / {model.chapters.length}
            </p>
            <details className="seq-model-menu">
              <summary className="seq-guide-button">Switch model <ChevronDown size={14} aria-hidden="true" /></summary>
              <div>
                {MODELS.map(item => (
                  <Link key={item.id} href={APP_ROUTES.models[item.id]} aria-current={item.id === modelId ? "page" : undefined}>
                    {item.name}
                  </Link>
                ))}
              </div>
            </details>
          </div>

          <div className="seq-chapter">
            {inChapter && <button type="button" className="seq-guide-button mb-4" onClick={exitChapter}>
              <ArrowLeft size={14} aria-hidden="true" /> Back to full model
            </button>}
            <h2 className="text-3xl font-semibold tracking-tight">{chapter.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#574a68]">{EXPLANATIONS[modelId][phase]}</p>
            {currentBeat && (
              <div className="seq-beat-summary">
                <h3 className="text-sm font-semibold">{chapterPlayer.step + 1}. {tensor.name}</h3>
                <p className="mt-1 text-sm leading-relaxed">{currentBeat.explanation}</p>
              </div>
            )}
            <p className="seq-equation">{tensor.equation}</p>
            {inChapter && (
              <p className="mb-3 break-words font-mono text-xs text-[#574a68]">
                [{tensor.values.slice(0, 8).map(value => value.toFixed(3)).join(", ")}{tensor.values.length > 8 ? ", …" : ""}]
              </p>
            )}
            {!inChapter && <button type="button" className="seq-guide-button mr-2" onClick={() => openChapter(phase)}>
              <Play size={14} aria-hidden="true" /> Play chapter
            </button>}
            <button type="button" className="seq-guide-button" aria-pressed={Boolean(saved[chapter.id])} onClick={toggleCompletion}>
              {saved[chapter.id] && <Check size={14} aria-hidden="true" />}
              {saved[chapter.id] ? "Chapter complete" : "Mark chapter complete"}
            </button>
          </div>

          {inChapter && (
            <details className="seq-disclosure" key={chapter.id}>
              <summary>All chapter steps <ChevronDown size={16} aria-hidden="true" /></summary>
              <ol className="space-y-2 pb-4">
                {beats.map((beat, index) => (
                  <li key={beat.tensor.id}>
                    <button type="button" className="seq-chapter-link"
                      aria-current={chapterPlayer.step === index ? "step" : undefined} onClick={() => seekPlayback(index)}>
                      <span className="font-mono text-xs opacity-70">{index + 1}</span>
                      <span>{beat.tensor.name}</span>
                    </button>
                    <p className="px-3 py-1 text-sm leading-relaxed text-[#574a68]">{beat.explanation}</p>
                  </li>
                ))}
              </ol>
            </details>
          )}

          <details className="seq-disclosure">
            <summary>Tensor inspector <ChevronDown size={16} aria-hidden="true" /></summary>
            <div className="space-y-3 pb-4">
              <TensorGrid tensor={tensor} />
              <TensorStats tensor={tensor} />
            </div>
          </details>

          <details className="seq-disclosure" open>
            <summary>Walkthrough chapters <ChevronDown size={16} aria-hidden="true" /></summary>
            <ol className="space-y-1 pb-4">
              {model.chapters.map((item, index) => (
                <li key={item.id}>
                  <button type="button" aria-current={chapter.id === item.id ? "step" : undefined}
                    onClick={() => openChapter(index)} className="seq-chapter-link">
                    <span className="font-mono text-xs opacity-70">{String(index + 1).padStart(2, "0")}</span>
                    <span className="flex-1">{item.title}</span>
                    {saved[item.id] && <Check size={14} aria-label="Complete" />}
                  </button>
                </li>
              ))}
            </ol>
          </details>

          <details className="seq-disclosure">
            <summary><span className="flex items-center gap-2"><Settings2 size={16} aria-hidden="true" /> Simulation settings</span><ChevronDown size={16} aria-hidden="true" /></summary>
            <div className="grid gap-4 pb-4 text-sm">
              <label htmlFor="explorer-dataset">Input sequence</label>
              <select id="explorer-dataset" className={control} value={options.dataset} onChange={event => updateOptions({ ...options, dataset: event.target.value })}>
                <option value="">Example tensor</option>
                {DATASETS.map(dataset => <option key={dataset.id} value={dataset.id}>{dataset.name} (synthetic)</option>)}
              </select>
              <label>Sequence length · {options.length}
                <input className="block w-full accent-[#7952bc]" type="range" min={1} max={LESSON_LIMITS.length} value={options.length}
                  onChange={event => updateOptions({ ...options, length: Number(event.target.value) })} />
              </label>
              <label>Feature width · {options.width}
                <input className="block w-full accent-[#7952bc]" type="range" min={1} max={LESSON_LIMITS.width} value={options.width}
                  onChange={event => updateOptions({ ...options, width: Number(event.target.value) })} />
              </label>
              <label htmlFor="explorer-speed">Playback speed</label>
              <select id="explorer-speed" className={control} value={speed} onChange={event => setSpeed(Number(event.target.value))}>
                {[0.5, 1, 2].map(value => <option key={value} value={value}>{value}×</option>)}
              </select>
            </div>
          </details>
        </aside>
      </div>
    </div>
  );
}
