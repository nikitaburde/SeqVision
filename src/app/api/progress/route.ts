import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    modelId?: string;
    chapterId?: string;
    completed?: boolean;
  };

  return NextResponse.json({
    ok: true,
    savedAt: new Date().toISOString(),
    progress: {
      modelId: body.modelId ?? "lstm",
      chapterId: body.chapterId ?? "lstm-1",
      completed: body.completed ?? false,
    },
  });
}
