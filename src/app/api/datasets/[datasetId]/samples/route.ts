import { NextResponse } from "next/server";
import { apiError } from "@/api/lesson";
import { getDatasetById, sampleDataset } from "@/data/datasets";

export async function GET(request: Request, { params }: { params: Promise<{ datasetId: string }> }) {
  const { datasetId } = await params;
  const dataset = getDatasetById(datasetId);
  if (!dataset) return apiError("Dataset not found", 404);
  const { searchParams } = new URL(request.url);
  const start = Number(searchParams.get("start") ?? 0);
  const length = Number(searchParams.get("length") ?? 4);
  if (!Number.isSafeInteger(start) || start < 0 || start > Number.MAX_SAFE_INTEGER - dataset.windowRange[1] ||
    !Number.isInteger(length) || length < 1 || length > dataset.windowRange[1]) {
    return apiError("Invalid sample window");
  }

  const samples = Array.from({ length }, (_, index) => {
    const t = start + index;
    return { t, value: sampleDataset(datasetId, t) };
  });
  return NextResponse.json({ dataset, source: "synthetic", samples });
}
