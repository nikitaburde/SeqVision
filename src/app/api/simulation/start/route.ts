import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, getRunState, lessonOptionsSchema, modelIdSchema, parseBody, startRun } from "@/api/lesson";

const schema = z.object({ modelId: modelIdSchema.default("lstm"), options: lessonOptionsSchema });

export async function POST(request: Request) {
  const body = await parseBody(request, schema);
  if (!body.success) return apiError("Invalid model ID or lesson options");
  return NextResponse.json(getRunState(startRun(body.data.modelId, body.data.options)));
}
