import { NextResponse } from "next/server";

import { MODEL_SPECS } from "@/constants/model";

interface Params {
  params: Promise<{ modelId: string; chapterId: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { modelId, chapterId } = await params;
  const model = MODEL_SPECS[modelId as keyof typeof MODEL_SPECS];

  if (!model) {
    return NextResponse.json({ error: "Model not found" }, { status: 404 });
  }

  const chapter = model.chapters.find((item) => item.id === chapterId);
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  return NextResponse.json({ modelId, chapter });
}
