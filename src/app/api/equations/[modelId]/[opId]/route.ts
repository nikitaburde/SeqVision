import { NextResponse } from "next/server";
import { apiError, getChapterPhase, modelIdSchema } from "@/api/lesson";
import { getLessonFrame } from "@/simulation/runtime";

export async function GET(_: Request, { params }: { params: Promise<{ modelId: string; opId: string }> }) {
  const { modelId, opId } = await params;
  const model = modelIdSchema.safeParse(modelId);
  if (!model.success) return apiError("Model not found", 404);
  const phase = getChapterPhase(model.data, opId);
  if (phase === -1) return apiError("Operation not found", 404);
  const { tensor } = getLessonFrame(model.data, phase);
  return NextResponse.json({
    modelId,
    opId,
    equation: tensor.equation,
    atoms: [{ opId: tensor.id, equationTermId: tensor.id, startFrame: phase, endFrame: phase }],
  });
}
