import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    runId?: string;
    currentStep?: number;
    direction?: "forward" | "backward";
  };

  const currentStep = body.currentStep ?? 0;
  const direction = body.direction ?? "forward";
  const nextStep = direction === "forward" ? currentStep + 1 : Math.max(0, currentStep - 1);

  return NextResponse.json({ runId: body.runId ?? "unknown", step: nextStep, direction });
}
