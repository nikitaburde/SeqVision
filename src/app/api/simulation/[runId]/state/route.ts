import { NextResponse } from "next/server";
import { apiError, getRun, getRunState } from "@/api/lesson";

export async function GET(_: Request, { params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;
  const run = getRun(runId);
  return run ? NextResponse.json(getRunState(run)) : apiError("Run not found", 404);
}
