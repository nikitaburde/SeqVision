import { NextResponse } from "next/server";
import { apiError, getRun, getRunTensor } from "@/api/lesson";

export async function GET(_: Request, { params }: { params: Promise<{ runId: string; tensorId: string }> }) {
  const { runId, tensorId } = await params;
  const run = getRun(runId);
  if (!run) return apiError("Run not found", 404);
  const tensor = getRunTensor(run, tensorId);
  return tensor ? NextResponse.json({ runId, tensorId: tensor.id, stats: tensor.stats }) : apiError("Tensor not found", 404);
}
