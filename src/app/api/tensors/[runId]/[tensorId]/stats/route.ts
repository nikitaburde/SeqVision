import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ runId: string; tensorId: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { runId, tensorId } = await params;

  return NextResponse.json({
    runId,
    tensorId,
    stats: {
      mean: 0.22,
      variance: 0.09,
      min: -0.81,
      max: 0.97,
      memoryBytes: 4096,
      distribution: [2, 4, 7, 8, 3],
    },
  });
}
