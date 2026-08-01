import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ runId: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { runId } = await params;

  return NextResponse.json({
    runId,
    status: "running",
    playhead: 0,
    activeChapterId: "lstm-1",
  });
}
