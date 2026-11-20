import { NextResponse } from "next/server";
import { z } from "zod";
import { apiError, getChapterPhase, getRun, parseBody } from "@/api/lesson";
import { MODEL_SPECS } from "@/constants/model";
import { getLessonFrame } from "@/simulation/runtime";

const schema = z.object({ runId: z.string().uuid(), query: z.string().optional() });

export async function POST(request: Request) {
  const body = await parseBody(request, schema);
  if (!body.success) return apiError("Invalid research query");
  const { runId, query } = body.data;
  const run = getRun(runId);
  if (!run) return apiError("Run not found", 404);
  const chapters = MODEL_SPECS[run.modelId].chapters.length;
  const phase = query ? getChapterPhase(run.modelId, query) : run.step % chapters;
  if (phase === -1) return apiError("Operation not found", 404);
  const frames = Array.from({ length: run.options.length }, (_, t) =>
    getLessonFrame(run.modelId, t * chapters + phase, run.options)
  );
  return NextResponse.json({ runId, modelId: run.modelId, options: run.options, frames });
}
