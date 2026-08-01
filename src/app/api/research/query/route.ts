import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    runId?: string;
    query?: string;
  };

  return NextResponse.json({
    runId: body.runId ?? "demo-run",
    query: body.query ?? "",
    panels: [
      "gradient-flow",
      "activation-distribution",
      "hidden-state-trace",
      "weight-evolution",
    ],
    generatedAt: new Date().toISOString(),
  });
}
