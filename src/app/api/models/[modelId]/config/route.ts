import { NextResponse } from "next/server";

import { MODEL_SPECS } from "@/constants/model";

interface Params {
  params: Promise<{ modelId: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { modelId } = await params;
  const config = MODEL_SPECS[modelId as keyof typeof MODEL_SPECS];
  if (!config) {
    return NextResponse.json({ error: "Model not found" }, { status: 404 });
  }

  return NextResponse.json({ config });
}
