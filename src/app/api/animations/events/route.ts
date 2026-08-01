import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId") ?? "demo-run";
  const t = Number(searchParams.get("t") ?? 0);

  return NextResponse.json({
    runId,
    t,
    events: [
      {
        eventId: "evt-1",
        t,
        opId: "forget-gate",
        tensorIds: ["f_t"],
        equationTermIds: ["sigma"],
        chapterId: "lstm-2",
        cameraCue: "component-focus",
      },
    ],
  });
}
