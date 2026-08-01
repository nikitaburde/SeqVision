import { NextResponse } from "next/server";

import { DATASETS } from "@/constants/model";

interface Params {
  params: Promise<{ datasetId: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { datasetId } = await params;
  const dataset = DATASETS.find((item) => item.id === datasetId);

  if (!dataset) {
    return NextResponse.json({ error: "Dataset not found" }, { status: 404 });
  }

  return NextResponse.json({
    dataset,
    samples: [
      { t: 0, value: 0.11 },
      { t: 1, value: 0.13 },
      { t: 2, value: 0.16 },
      { t: 3, value: 0.19 },
    ],
  });
}
