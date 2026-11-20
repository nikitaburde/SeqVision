import { NextResponse } from "next/server";
import { z } from "zod";

import { DEFAULT_CONTROLS } from "@/constants/config";
import { MODEL_SPECS } from "@/constants/model";
import { getDatasetById } from "@/data/datasets";
import { getLessonFrame, LESSON_DEFAULTS, LESSON_LIMITS } from "@/simulation/runtime";
import type { ModelId } from "@/types";

export const modelIdSchema = z.custom<ModelId>(value => typeof value === "string" && Object.hasOwn(MODEL_SPECS, value));
export const lessonOptionsSchema = z.object({
  length: z.number().int().min(1).max(LESSON_LIMITS.length).default(LESSON_DEFAULTS.length),
  width: z.number().int().min(1).max(LESSON_LIMITS.width).default(LESSON_DEFAULTS.width),
  dataset: z.string().refine(value => value === "" || !!getDatasetById(value)).default(LESSON_DEFAULTS.dataset),
}).default(LESSON_DEFAULTS);

interface Run {
  runId: string;
  modelId: ModelId;
  options: z.infer<typeof lessonOptionsSchema>;
  startedAt: string;
  step: number;
}

const state = globalThis as typeof globalThis & { seqvisionRuns?: Map<string, Run> };
const runs = state.seqvisionRuns ??= new Map<string, Run>();

export async function parseBody<T>(request: Request, schema: z.ZodType<T>) {
  return schema.safeParse(await request.json().catch(() => null));
}

export function apiError(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

export function startRun(modelId: ModelId, options: Run["options"]) {
  const run = { runId: crypto.randomUUID(), modelId, options, startedAt: new Date().toISOString(), step: 0 };
  if (runs.size >= 256) {
    const oldest = runs.keys().next().value;
    if (oldest) runs.delete(oldest);
  }
  runs.set(run.runId, run);
  return run;
}

export function getRun(runId: string) {
  return runs.get(runId);
}

export function getRunState(run: Run) {
  const frame = getLessonFrame(run.modelId, run.step, run.options);
  return {
    ...run,
    controls: { ...DEFAULT_CONTROLS, layers: 1, batchSize: 1, hiddenUnits: run.options.width, sequenceLength: run.options.length },
    status: run.step === frame.lastStep ? "complete" : "ready",
    playhead: run.step,
    activeChapterId: frame.chapter.id,
    frame,
  };
}

export function getChapterPhase(modelId: ModelId, operation: string) {
  return MODEL_SPECS[modelId].chapters.findIndex(chapter =>
    chapter.id === operation || chapter.title.toLowerCase().replaceAll(" ", "-") === operation
  );
}

export function getRunTensor(run: Run, tensorId: string) {
  const phase = getChapterPhase(run.modelId, tensorId);
  if (phase === -1) return null;
  const chapters = MODEL_SPECS[run.modelId].chapters.length;
  return getLessonFrame(run.modelId, Math.floor(run.step / chapters) * chapters + phase, run.options).tensor;
}
