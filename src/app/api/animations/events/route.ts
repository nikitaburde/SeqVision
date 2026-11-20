import { NextResponse } from "next/server";
import { apiError, getRun } from "@/api/lesson";
import { getLessonFrame } from "@/simulation/runtime";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const run = getRun(searchParams.get("runId") ?? "");
  if (!run) return apiError("Run not found", 404);
  const t = Number(searchParams.get("t") ?? run.step);
  const frame = getLessonFrame(run.modelId, run.step, run.options);
  if (!Number.isInteger(t) || t < 0 || t > frame.lastStep) return apiError("Timeline step is out of range");
  const { chapter, tensor } = getLessonFrame(run.modelId, t, run.options);
  return NextResponse.json({
    runId: run.runId,
    t,
    events: [{
      eventId: `${run.runId}-${t}`,
      t,
      opId: chapter.id,
      tensorIds: [tensor.id],
      equationTermIds: [tensor.id],
      chapterId: chapter.id,
      cameraCue: "component-focus",
    }],
  });
}
