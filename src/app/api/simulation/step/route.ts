import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, getRun, getRunState, parseBody } from "@/api/lesson";
import { getLessonFrame } from "@/simulation/runtime";

const schema = z.object({
  runId: z.string().uuid(),
  direction: z.enum(["forward", "backward"]).default("forward"),
  currentStep: z.number().int().nonnegative().optional(),
});

export async function POST(request: Request) {
  const body = await parseBody(request, schema);
  if (!body.success) return apiError("Invalid run ID or step parameters");
  const { runId, direction, currentStep } = body.data;
  const run = getRun(runId);
  if (!run) return apiError("Run not found", 404);
  if (currentStep !== undefined && currentStep !== run.step) return apiError("The playhead has changed", 409);

  run.step = getLessonFrame(run.modelId, run.step + (direction === "forward" ? 1 : -1), run.options).step;
  return NextResponse.json({ ...getRunState(run), direction });
}
