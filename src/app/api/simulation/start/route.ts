import { NextResponse } from "next/server";

import { DEFAULT_CONTROLS } from "@/constants/config";
import { MODEL_SPECS } from "@/constants/model";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { modelId?: string };
  const modelId = body.modelId && body.modelId in MODEL_SPECS ? body.modelId : "lstm";

  return NextResponse.json({
    runId: `${modelId}-${Date.now()}`,
    modelId,
    controls: DEFAULT_CONTROLS,
    startedAt: new Date().toISOString(),
  });
}
