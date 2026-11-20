import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { apiError, modelIdSchema, parseBody } from "@/api/lesson";
import { MODELS, MODEL_SPECS } from "@/constants/model";

const cookie = "seqvision-chapters";
const chapterIds = new Set(MODELS.flatMap(model => model.chapters.map(chapter => chapter.id)));
const schema = z.object({ modelId: modelIdSchema, chapterId: z.string(), completed: z.boolean() });

function readProgress(request: NextRequest) {
  return new Set((request.cookies.get(cookie)?.value ?? "").split(",").filter(id => chapterIds.has(id)));
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ completedChapterIds: [...readProgress(request)] });
}

export async function POST(request: NextRequest) {
  const body = await parseBody(request, schema);
  if (!body.success) return apiError("Invalid progress record");
  const { modelId, chapterId, completed } = body.data;
  if (!MODEL_SPECS[modelId].chapters.some(chapter => chapter.id === chapterId)) {
    return apiError("Chapter not found", 404);
  }
  const progress = readProgress(request);
  if (completed) progress.add(chapterId);
  else progress.delete(chapterId);

  const response = NextResponse.json({ ok: true, savedAt: new Date().toISOString(), progress: body.data });
  response.cookies.set(cookie, [...progress].sort().join(","), {
    httpOnly: true,
    sameSite: "lax",
    path: "/api/progress",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
