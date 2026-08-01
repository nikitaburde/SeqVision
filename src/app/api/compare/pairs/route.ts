import { NextResponse } from "next/server";

import { COMPARE_PRESETS } from "@/constants/model";

export async function GET() {
  return NextResponse.json({ pairs: COMPARE_PRESETS });
}
