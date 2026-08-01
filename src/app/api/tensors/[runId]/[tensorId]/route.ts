import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ runId: string; tensorId: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { runId, tensorId } = await params;

  return NextResponse.json({
    runId,
    tensor: {
      id: tensorId,
      name: tensorId,
      shape: [8, 128],
      dimensions: ["batch", "hidden"],
      values: [0.12, 0.33, -0.08, 0.51],
      activation: "sigmoid",
    },
  });
}
