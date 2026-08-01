import { NextResponse } from "next/server";

import { DATASETS } from "@/constants/model";

export async function GET() {
  return NextResponse.json({ datasets: DATASETS });
}
